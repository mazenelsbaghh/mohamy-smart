import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _csrfRetry?: boolean;
}

export interface CreateApiClientOptions {
  /** The base URL for the API (e.g. from VITE_API_BASE_URL) */
  baseUrl: string;
  /** Whether to enforce HTTPS in production. Defaults to true. */
  enforceHttpsInProd?: boolean;
  /** Login path to redirect on session expiry. Defaults to '/auth/login'. */
  loginPath?: string;
  /**
   * Optional hook called for every response error after the interceptor has decided
   * not to retry. Consumers can surface toasts or analytics here — for example showing
   * a 403/429 toast — without duplicating the 401/refresh/CSRF logic in every app.
   */
  onHttpError?: (status: number | undefined, error: unknown) => void;
}

/**
 * Creates a configured Axios instance with:
 * - Cookie-based auth (withCredentials)
 * - CSRF token management (XSRF-TOKEN cookie → X-XSRF-TOKEN header)
 * - 401 refresh queue (single-flight refresh, queues concurrent requests)
 * - 400 CSRF retry
 * - 403 CSRF retry
 * - Logout dispatcher for session expiry
 */
export function createApiClient(options: CreateApiClientOptions) {
  const { baseUrl, enforceHttpsInProd = true, loginPath = '/auth/login', onHttpError } = options;

  // Security: enforce HTTPS in production
  if (enforceHttpsInProd && typeof window !== 'undefined') {
    const isProd =
      window.location.protocol === 'https:' ||
      (typeof import.meta !== 'undefined' &&
        typeof (import.meta as { env?: { PROD?: boolean } }).env !== 'undefined' &&
        !!(import.meta as { env?: { PROD?: boolean } }).env?.PROD);
    if (isProd && baseUrl && !baseUrl.startsWith('https://')) {
      throw new Error(
        `[Security] API base URL must use HTTPS in production. Got: ${baseUrl}`
      );
    }
  }

  const api: AxiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    // T034: Disable Axios's built-in XSRF handling.
    // ASP.NET Core's antiforgery uses two DIFFERENT tokens:
    //   - Cookie token  (stored in XSRF-TOKEN cookie)
    //   - Request token  (returned by /Auth/csrf-token endpoint)
    // Axios's built-in support reads the cookie and puts it in the header,
    // but the cookie token ≠ the request token → validation always fails.
    // We manage CSRF manually via the request interceptor below.
    xsrfCookieName: '',
    xsrfHeaderName: '',
  });

  const internalApi: AxiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    xsrfCookieName: '',
    xsrfHeaderName: '',
  });

  const getPath = (requestUrl?: string) => {
    if (!requestUrl) return '';
    try {
      return new URL(requestUrl, baseUrl || window.location.origin).pathname.toLowerCase();
    } catch {
      return requestUrl.toLowerCase();
    }
  };

  const isCsrfEndpoint = (requestUrl?: string) => getPath(requestUrl).endsWith('/auth/csrf-token');
  const isRefreshEndpoint = (requestUrl?: string) => getPath(requestUrl).endsWith('/auth/refresh-token');
  const isAuthWriteWithoutCsrf = (requestUrl?: string) => {
    const path = getPath(requestUrl);
    const isAuthPath = path.includes('/auth/');
    return isAuthPath
      && (path.endsWith('/login')
        || path.endsWith('/admin/login')
        || path.endsWith('/register')
        || path.endsWith('/refresh-token'));
  };

  const looksLikeCsrfFailure = (data: unknown) => {
    const text =
      typeof data === 'string'
        ? data.toLowerCase()
        : JSON.stringify(data ?? '').toLowerCase();

    return (
      text.includes('csrf') ||
      text.includes('xsrf') ||
      text.includes('antiforgery') ||
      text.includes('anti-forgery') ||
      text.includes('forgery token')
    );
  };

  // --- CSRF Token Management ---
  let _csrfToken: string | null = null;
  let _csrfFetchPromise: Promise<void> | null = null;
  // Tracks whether a CSRF fetch failed because the user isn't authenticated yet.
  // Prevents repeated 401 requests on the login page. Reset on successful fetch.
  let _csrfFailedPreAuth = false;

  const fetchCsrfToken = async () => {
    try {
      const res = await internalApi.get<{ data: { token: string } }>('/Auth/csrf-token');
      if (res.data?.data?.token) {
        _csrfToken = res.data.data.token;
        _csrfFailedPreAuth = false; // Reset: user is now authenticated
      }
    } catch {
      _csrfToken = null;
      // If fetch fails (likely 401 before login), mark to avoid retrying
      _csrfFailedPreAuth = true;
    }
  };

  /**
   * Ensures the CSRF request token is available.
   * - Returns immediately if token exists or if a prior fetch failed pre-auth
   * - Uses a shared promise so concurrent requests share a single fetch
   * - Skips auth endpoints that have [IgnoreAntiforgeryToken] on the backend
   */
  const ensureCsrfToken = async (requestUrl?: string): Promise<void> => {
    if (_csrfToken) return;
    if (_csrfFailedPreAuth) return; // Don't retry until after login calls fetchCsrfToken()

    // Skip CSRF fetch for auth endpoints — they have [IgnoreAntiforgeryToken].
    // Matches /auth/login, /auth/admin/login, /auth/register, /auth/refresh-token, etc.
    if (isCsrfEndpoint(requestUrl) || isAuthWriteWithoutCsrf(requestUrl)) {
      return;
    }

    if (!_csrfFetchPromise) {
      _csrfFetchPromise = fetchCsrfToken().finally(() => {
        _csrfFetchPromise = null;
      });
    }
    return _csrfFetchPromise;
  };

  // --- Logout Dispatcher ---
  let _logoutDispatcher: (() => void) | null = null;

  const registerLogoutDispatcher = (fn: () => void) => {
    _logoutDispatcher = fn;
  };

  const handleLogout = () => {
    _logoutDispatcher?.();
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.toLowerCase();
      const targetPath = loginPath.toLowerCase();
      if (currentPath !== targetPath) {
        window.location.replace(loginPath);
      }
    }
  };

  // --- Refresh with retry (exponential backoff) ---
  // Transient network blips or a momentarily slow backend must not cause
  // an instant logout. We retry the refresh call twice before giving up.
  const REFRESH_MAX_RETRIES = 2;
  const refreshWithRetry = async (): Promise<void> => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= REFRESH_MAX_RETRIES; attempt++) {
      try {
        await internalApi.post('/Auth/refresh-token', {});
        await fetchCsrfToken();
        return;
      } catch (err) {
        lastErr = err;
        // Only retry on network errors or 5xx — a 401 means the session is truly gone.
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status && status < 500 && status !== 408 && status !== 429) {
          throw err;
        }
        if (attempt < REFRESH_MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
        }
      }
    }
    throw lastErr;
  };

  // --- Proactive refresh: refresh before the 30-min JWT expires ---
  // Running every 20 minutes keeps the session alive for active users
  // so they never hit a 401 mid-action. Silent failures are fine — the
  // 401 interceptor is the ultimate fallback.
  const PROACTIVE_REFRESH_MS = 20 * 60 * 1000;
  let _refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  if (typeof window !== 'undefined') {
    _refreshIntervalId = setInterval(() => {
      // Only refresh if the user appears logged in (CSRF token acquired post-login).
      if (_csrfToken || !_csrfFailedPreAuth) {
        internalApi
          .post('/Auth/refresh-token', {})
          .then(() => fetchCsrfToken())
          .catch(() => {
            // Silent: 401 interceptor will handle it on next real request.
          });
      }
    }, PROACTIVE_REFRESH_MS);
  }

  // --- 401 Refresh Queue ---
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: () => void;
    reject: (reason?: unknown) => void;
  }> = [];

  const processQueue = (error: unknown) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    failedQueue = [];
  };

  // --- Request Interceptor: attach CSRF token ---
  // Unsafe HTTP methods that require a valid CSRF request token.
  const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

  api.interceptors.request.use(async (config) => {
    const method = (config.method ?? 'get').toLowerCase();
    const requestUrl = config.url;

    // T034: For state-changing requests, ensure the CSRF request token is
    // available before sending.  This eliminates the "first request 400"
    // problem that occurred when _csrfToken was null on fresh page load
    // and the fallback read the wrong cookie token.
    if (UNSAFE_METHODS.has(method)) {
      await ensureCsrfToken(requestUrl);
    }

    if (_csrfToken && !isCsrfEndpoint(requestUrl) && !isAuthWriteWithoutCsrf(requestUrl)) {
      config.headers.set('X-XSRF-TOKEN', _csrfToken);
    }

    return config;
  });

  // --- Response Interceptor: handle 401/400/403 ---
  api.interceptors.response.use(
    (response) => {
      // Reset CSRF pre-auth flag after successful login so subsequent
      // requests re-attempt CSRF token fetch with valid credentials.
      const url = (response.config?.url ?? '').toLowerCase();
      if (url.includes('/auth/login') && response.status >= 200 && response.status < 300) {
        _csrfFailedPreAuth = false;
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;
      const requestUrl = originalRequest?.url;

      // Network error — don't logout
      if (!error.response) {
        return Promise.reject(error);
      }

      // Internal token endpoints must never recursively trigger CSRF/refresh retry.
      if (isCsrfEndpoint(requestUrl)) {
        _csrfToken = null;
        _csrfFailedPreAuth = true;
        return Promise.reject(error);
      }

      // If the refresh call itself failed → session expired → logout
      if (isRefreshEndpoint(requestUrl)) {
        processQueue(error);
        handleLogout();
        return Promise.reject(error);
      }

      // 400 → only retry if the response body signals a CSRF/antiforgery failure.
      // A blanket retry on every 400 amplifies validation errors into request storms
      // and can trip server rate limits (429). Inspect the payload to disambiguate.
      if (error.response?.status === 400 && !originalRequest._csrfRetry) {
        if (looksLikeCsrfFailure(error.response.data)) {
          originalRequest._csrfRetry = true;
          _csrfToken = null;
          await fetchCsrfToken();
          if (_csrfToken) {
            return api(originalRequest);
          }
        }
      }

      // 401 → token expired → refresh + queue
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve: () => resolve(undefined), reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshWithRetry();
          processQueue(null);
          return api(originalRequest);
        } catch (err) {
          processQueue(err);
          handleLogout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // 403 → retry only when the payload is explicitly a CSRF/antiforgery failure.
      // Normal authorization 403s must surface to the caller.
      if (error.response?.status === 403 && !originalRequest._retry && looksLikeCsrfFailure(error.response.data)) {
        originalRequest._retry = true;
        _csrfToken = null;
        await fetchCsrfToken();
        if (_csrfToken) {
          return api(originalRequest);
        }
      }

      onHttpError?.(error.response?.status, error);
      return Promise.reject(error);
    }
  );

  return {
    api,
    fetchCsrfToken,
    registerLogoutDispatcher,
    handleLogout,
    cleanup: () => {
      if (_refreshIntervalId !== null) clearInterval(_refreshIntervalId);
    },
  };
}
