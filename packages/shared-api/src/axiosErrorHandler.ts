import { isAxiosError } from 'axios';

const GENERIC_ERROR_MESSAGE = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'الطلب غير صحيح. راجع البيانات وحاول مرة أخرى.',
  401: 'انتهت الجلسة أو تحتاج إلى تسجيل الدخول مرة أخرى.',
  403: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
  404: 'العنصر المطلوب غير موجود.',
  408: 'انتهت مهلة الطلب. حاول مرة أخرى.',
  409: 'يوجد تعارض في البيانات. حدّث الصفحة وحاول مرة أخرى.',
  413: 'حجم البيانات أو الملف أكبر من المسموح.',
  415: 'نوع الملف أو المحتوى غير مدعوم.',
  422: 'بعض البيانات غير صحيحة. راجع الحقول وحاول مرة أخرى.',
  429: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.',
  500: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
  502: 'الخادم غير متاح حالياً. حاول مرة أخرى.',
  503: 'الخدمة غير متاحة حالياً. حاول مرة أخرى.',
  504: 'الخادم استغرق وقتاً طويلاً في الرد. حاول مرة أخرى.',
};

type ErrorPayload = {
  message?: unknown;
  Message?: unknown;
  title?: unknown;
  Title?: unknown;
  detail?: unknown;
  Detail?: unknown;
  error?: unknown;
  Error?: unknown;
  errors?: unknown;
  Errors?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanMessage = (message: string) => message.trim();

const pushMessage = (messages: string[], value: unknown) => {
  if (typeof value !== 'string') return;
  const cleaned = cleanMessage(value);
  if (cleaned) messages.push(cleaned);
};

const collectMessages = (value: unknown, messages: string[]) => {
  if (typeof value === 'string') {
    pushMessage(messages, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, messages));
    return;
  }

  if (!isRecord(value)) return;

  const payload = value as ErrorPayload;
  pushMessage(messages, payload.message);
  pushMessage(messages, payload.Message);
  pushMessage(messages, payload.title);
  pushMessage(messages, payload.Title);
  pushMessage(messages, payload.detail);
  pushMessage(messages, payload.Detail);

  const nestedError = payload.error ?? payload.Error;
  if (nestedError !== value) {
    collectMessages(nestedError, messages);
  }

  const nestedErrors = payload.errors ?? payload.Errors;
  if (isRecord(nestedErrors)) {
    Object.values(nestedErrors).forEach((entry) => collectMessages(entry, messages));
  } else if (nestedErrors !== value) {
    collectMessages(nestedErrors, messages);
  }
};

const uniqueMessages = (messages: string[]) =>
  Array.from(new Set(messages.map(cleanMessage).filter(Boolean)));

const extractPayloadMessage = (data: unknown): string | null => {
  const messages: string[] = [];
  collectMessages(data, messages);
  const unique = uniqueMessages(messages);
  return unique.length > 0 ? unique.join('، ') : null;
};

const fallbackForStatus = (status?: number) => {
  if (!status) return null;
  return STATUS_FALLBACK_MESSAGES[status] ?? null;
};

/**
 * Extracts a user-facing error message from API responses.
 * Supports the app Result<T> shape, ASP.NET validation payloads, RFC7807 problem details,
 * plain-string errors, and Axios network failures.
 */
const axiosErrorHandler = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت أو حاول مرة أخرى.';
    }

    const apiMessage = extractPayloadMessage(error.response.data);
    if (apiMessage) return apiMessage;

    return fallbackForStatus(error.response.status) ?? GENERIC_ERROR_MESSAGE;
  }

  if (error instanceof Error && cleanMessage(error.message)) {
    return error.message;
  }

  return extractPayloadMessage(error) ?? GENERIC_ERROR_MESSAGE;
};

export default axiosErrorHandler;
