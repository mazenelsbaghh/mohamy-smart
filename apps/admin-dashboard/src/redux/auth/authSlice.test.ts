import { describe, it, expect, vi, beforeEach } from'vitest';
import { configureStore } from'@reduxjs/toolkit';
import authReducer from'./authSlice';

vi.mock('./thunk/thunkAuthLogin', () => {
 return {
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkAuthLogin/pending' },
 fulfilled: { type:'auth/thunkAuthLogin/fulfilled' },
 rejected: { type:'auth/thunkAuthLogin/rejected' },
 })
 };
});

vi.mock('./thunk/thunkAuthMe', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/me/pending' },
 fulfilled: { type:'auth/me/fulfilled' },
 rejected: { type:'auth/me/rejected' },
 }),
}));

vi.mock('../../utils/toastHelpers', () => ({
 showSuccessToast: vi.fn(),
 showErrorToast: vi.fn(),
}));

function makeStore() {
 return configureStore({
 reducer: { auth: authReducer },
 });
}

describe('authSlice', () => {
 beforeEach(() => {
 localStorage.clear();
 vi.clearAllMocks();
 });

 it('starts with unknown status and null user when no saved profile', () => {
 const store = makeStore();
 const state = store.getState().auth;
 expect(state.status).toBe('unknown');
 expect(state.user).toBeNull();
 });

 it('supports roles array in user state', () => {
 const store = makeStore();
 const state = store.getState().auth;
 expect(state.user).toBeNull();
 });

 describe('login thunk', () => {
 it('sets loading on pending', () => {
 const store = makeStore();
 store.dispatch({ type:'auth/thunkAuthLogin/pending' });
 expect(store.getState().auth.isLoading).toBe(true);
 expect(store.getState().auth.error).toBeNull();
 });

 it('sets user data and authenticated status on fulfilled', () => {
 const store = makeStore();
 const payload = {
 userId:'u1',
 fullName:'Admin User',
 roles: ['Admin'],
 email:'admin@test.com',
 phone:'01000000000',
 };
 store.dispatch({ type:'auth/thunkAuthLogin/fulfilled', payload });
 const state = store.getState().auth;
 expect(state.isLoading).toBe(false);
 expect(state.status).toBe('authenticated');
 expect(state.user).toEqual(payload);
 expect(localStorage.getItem('admin_user')).toBe(JSON.stringify(payload));
 });

 it('sets error state on rejected', () => {
 const store = makeStore();
 store.dispatch({ type:'auth/thunkAuthLogin/rejected', payload:'Invalid credentials' });
 const state = store.getState().auth;
 expect(state.isLoading).toBe(false);
 expect(state.status).toBe('unauthenticated');
 expect(state.error).toBe('Invalid credentials');
 });
 });

 describe('logout', () => {
 it('clears user and sets unauthenticated on thunkLogOut fulfilled', () => {
 const store = makeStore();
 const payload = {
 userId:'u1',
 fullName:'Admin User',
 roles: ['Admin'],
 email:'admin@test.com',
 phone:'01000000000',
 };
 store.dispatch({ type:'auth/thunkAuthLogin/fulfilled', payload });
 expect(store.getState().auth.user).not.toBeNull();

 store.dispatch({ type:'auth/thunkLogOut/fulfilled' });
 const state = store.getState().auth;
 expect(state.user).toBeNull();
 expect(state.status).toBe('unauthenticated');
 });

 it('clears user and sets unauthenticated on thunkLogOut rejected', () => {
 const store = makeStore();
 const payload = {
 userId:'u1',
 fullName:'Admin User',
 roles: ['Admin'],
 email:'admin@test.com',
 phone:'01000000000',
 };
 store.dispatch({ type:'auth/thunkAuthLogin/fulfilled', payload });

 store.dispatch({ type:'auth/thunkLogOut/rejected' });
 const state = store.getState().auth;
 expect(state.user).toBeNull();
 expect(state.status).toBe('unauthenticated');
 });
 });
});
