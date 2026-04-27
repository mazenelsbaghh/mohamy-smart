import'@testing-library/jest-dom';

// Stub localStorage for tests
const localStorageMock = (() => {
 let store: Record<string, string> = {};
 return {
 getItem: (key: string) => store[key] ?? null,
 setItem: (key: string, value: string) => { store[key] = value; },
 removeItem: (key: string) => { delete store[key]; },
 clear: () => { store = {}; },
 get length() { return Object.keys(store).length; },
 key: (index: number) => Object.keys(store)[index] ?? null,
 };
})();

Object.defineProperty(window,'localStorage', { value: localStorageMock });

// Stub import.meta.env
Object.defineProperty(import.meta,'env', {
 value: {
 VITE_API_BASE_URL:'http://localhost:8976/api',
 MODE:'test',
 DEV: true,
 PROD: false,
 SSR: false,
 },
 writable: true,
});
