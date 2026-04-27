import { describe, expect, it } from 'vitest';
import axiosErrorHandler from '../axiosErrorHandler';

const axiosError = (status: number | undefined, data: unknown) => ({
  isAxiosError: true,
  message: 'Request failed',
  response: status ? { status, data } : undefined,
});

describe('axiosErrorHandler', () => {
  it('uses API Result message when present', () => {
    const message = axiosErrorHandler(axiosError(400, { message: 'رقم الهاتف مطلوب' }));

    expect(message).toBe('رقم الهاتف مطلوب');
  });

  it('joins Result errors array', () => {
    const message = axiosErrorHandler(axiosError(400, { errors: ['الاسم مطلوب', 'البريد غير صحيح'] }));

    expect(message).toBe('الاسم مطلوب، البريد غير صحيح');
  });

  it('extracts ASP.NET validation errors object', () => {
    const message = axiosErrorHandler(axiosError(400, {
      errors: {
        Phone: ['رقم الهاتف غير صحيح'],
        Password: ['كلمة المرور قصيرة'],
      },
    }));

    expect(message).toBe('رقم الهاتف غير صحيح، كلمة المرور قصيرة');
  });

  it('extracts problem details title and detail', () => {
    const message = axiosErrorHandler(axiosError(404, {
      title: 'Not Found',
      detail: 'لم يتم العثور على القضية',
    }));

    expect(message).toBe('Not Found، لم يتم العثور على القضية');
  });

  it('uses Arabic status fallback when payload has no message', () => {
    const message = axiosErrorHandler(axiosError(403, {}));

    expect(message).toBe('ليس لديك صلاحية لتنفيذ هذا الإجراء.');
  });

  it('uses network message when the server does not respond', () => {
    const message = axiosErrorHandler(axiosError(undefined, undefined));

    expect(message).toBe('تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت أو حاول مرة أخرى.');
  });
});
