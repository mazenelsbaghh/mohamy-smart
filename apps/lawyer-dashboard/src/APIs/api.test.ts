import { describe, it, expect, vi, beforeEach } from'vitest';
import { API_ROUTES } from'./routes';

// Mock localStorage
const localStorageMock = (() => {
 let store: Record<string, string> = {};
 return {
 getItem: vi.fn((key: string) => store[key] ?? null),
 setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
 removeItem: vi.fn((key: string) => { delete store[key]; }),
 clear: vi.fn(() => { store = {}; }),
 };
})();
Object.defineProperty(globalThis,'localStorage', { value: localStorageMock });

describe('API client module (structure)', () => {
 beforeEach(() => {
 localStorageMock.clear();
 vi.clearAllMocks();
 });

 it('exports a default api instance', async () => {
 const mod = await import('./api');
 expect(mod.default).toBeDefined();
 expect(mod.default.defaults.baseURL).toBeDefined();
 });

 it('configures cookie-based auth with manual CSRF handling', async () => {
 const mod = await import('./api');
 expect(mod.default.defaults.withCredentials).toBe(true);
 expect(mod.default.defaults.xsrfCookieName).toBe('');
 expect(mod.default.defaults.xsrfHeaderName).toBe('');
 });

 it('exports handleLogout function', async () => {
 const mod = await import('./api');
 expect(typeof mod.handleLogout).toBe('function');
 });

 it('keeps route constants relative to the configured API base URL', () => {
 expect(API_ROUTES.GET_PROFILE).toBe('/account/profile');
 expect(API_ROUTES.UPDATE_PROFILE).toBe('/account/profile');
 expect(API_ROUTES.CHANGE_PASSWORD).toBe('/account/change-password');
 expect(API_ROUTES.GET_SUBSCRIPTION_PLANS).toBe('/subscription');
 expect(API_ROUTES.GET_LAWYER_SUBSCRIPTION).toBe('/subscription/lawyer');
 expect(API_ROUTES.INITIATE_PAYMENT).toBe('/payment/initiate');
 expect(API_ROUTES.GET_PAYMENT_STATUS('123')).toBe('/payment/status/123');
 expect(API_ROUTES.GET_PAYMENT_HISTORY).toBe('/payment/history');
 expect(API_ROUTES.GET_DOCUMENTS).toBe('/documents');
 expect(API_ROUTES.GET_LEGAL_CONTRACTS).toBe('/LegalContracts');
 expect(API_ROUTES.SEND_CHAT_MESSAGE).toBe('/smartanalysis/chat');
 expect(API_ROUTES.AUTH_REFRESH).toBe('/Auth/refresh-token');
 });
});
