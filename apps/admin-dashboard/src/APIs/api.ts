import { axiosErrorHandler, createApiClient } from"@mohamy/shared-api";
import { sileo } from"sileo";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

const { api, fetchCsrfToken, registerLogoutDispatcher, handleLogout } = createApiClient({
 baseUrl: apiBaseUrl,
 enforceHttpsInProd: true,
 loginPath:"/auth/login",
 onHttpError: (status, error) => {
 if (status === 403) {
 sileo.error({ title: axiosErrorHandler(error) });
 } else if (status === 429) {
 sileo.error({ title: axiosErrorHandler(error) });
 }
 },
});

export { fetchCsrfToken, registerLogoutDispatcher, handleLogout };
export default api;
