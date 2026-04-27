import { describe, it, expect, vi, beforeEach } from'vitest';
import { configureStore } from'@reduxjs/toolkit';
import authReducer, { logOut } from'./authSlice';

vi.mock('./thunk/thunkAuthLogin', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkAuthLogin/pending' },
 fulfilled: { type:'auth/thunkAuthLogin/fulfilled' },
 rejected: { type:'auth/thunkAuthLogin/rejected' },
 }),
}));

vi.mock('./thunk/thunkAuthMe', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/me/pending' },
 fulfilled: { type:'auth/me/fulfilled' },
 rejected: { type:'auth/me/rejected' },
 }),
}));

vi.mock('./thunk/thunkLogout', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/logout/pending' },
 fulfilled: { type:'auth/logout/fulfilled' },
 rejected: { type:'auth/logout/rejected' },
 }),
}));

vi.mock('./thunk/thunkAuthRegister', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkAuthRegister/pending' },
 fulfilled: { type:'auth/thunkAuthRegister/fulfilled' },
 rejected: { type:'auth/thunkAuthRegister/rejected' },
 }),
}));

vi.mock('./thunk/thunkForgotPassword', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkForgotPassword/pending' },
 fulfilled: { type:'auth/thunkForgotPassword/fulfilled' },
 rejected: { type:'auth/thunkForgotPassword/rejected' },
 }),
}));

vi.mock('./thunk/thunkVerifyOtp', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkVerifyOtp/pending' },
 fulfilled: { type:'auth/thunkVerifyOtp/fulfilled' },
 rejected: { type:'auth/thunkVerifyOtp/rejected' },
 }),
}));

vi.mock('./thunk/thunkResetPassword', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkResetPassword/pending' },
 fulfilled: { type:'auth/thunkResetPassword/fulfilled' },
 rejected: { type:'auth/thunkResetPassword/rejected' },
 }),
}));

vi.mock('./thunk/thunkRequestPhoneVerification', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkRequestPhoneVerification/pending' },
 fulfilled: { type:'auth/thunkRequestPhoneVerification/fulfilled' },
 rejected: { type:'auth/thunkRequestPhoneVerification/rejected' },
 }),
}));

vi.mock('./thunk/thunkVerifyPhoneNumber', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'auth/thunkVerifyPhoneNumber/pending' },
 fulfilled: { type:'auth/thunkVerifyPhoneNumber/fulfilled' },
 rejected: { type:'auth/thunkVerifyPhoneNumber/rejected' },
 }),
}));

vi.mock('@mohamy/shared-utils', async (importOriginal) => {
 const actual = await importOriginal<typeof import('@mohamy/shared-utils')>();
 return { ...actual, isString: (v: unknown) => typeof v ==='string' };
});

function makeStore() {
 return configureStore({
 reducer: { auth: authReducer },
 });
}

describe('lawyer authSlice', () => {
 beforeEach(() => {
 localStorage.clear();
 vi.clearAllMocks();
 });

 it('starts with unknown status, idle loading, and null user', () => {
 const store = makeStore();
 const state = store.getState().auth;
 expect(state.status).toBe('unknown');
 expect(state.loading).toBe('idle');
 expect(state.user).toBeNull();
 expect(state.error).toBeNull();
 });

 describe('login thunk', () => {
 it('sets loading pending on thunkAuthLogin pending', () => {
 const store = makeStore();
 store.dispatch({ type:'auth/thunkAuthLogin/pending' });
 expect(store.getState().auth.loading).toBe('pending');
 expect(store.getState().auth.error).toBeNull();
 });

 it('sets user and authenticated status on thunkAuthLogin fulfilled', () => {
 const store = makeStore();
 const payload = {
 userId:'u1',
 fullName:'Lawyer User',
 profileId:'p1',
 roles: ['Lawyer'],
 phone:'01000000000',
 };
 store.dispatch({ type:'auth/thunkAuthLogin/fulfilled', payload });
 const state = store.getState().auth;
 expect(state.loading).toBe('succeeded');
 expect(state.status).toBe('authenticated');
 expect(state.user).toEqual(payload);
 expect(localStorage.getItem('user')).toBe(JSON.stringify(payload));
 });

 it('sets error on thunkAuthLogin rejected', () => {
 const store = makeStore();
 store.dispatch({ type:'auth/thunkAuthLogin/rejected', payload:'Invalid credentials' });
 const state = store.getState().auth;
 expect(state.loading).toBe('failed');
 expect(state.error).toBe('Invalid credentials');
 });
 });

 describe('logout', () => {
 it('clears user and status on thunkLogout fulfilled', () => {
 const store = makeStore();
 const payload = {
 userId:'u1',
 fullName:'Lawyer User',
 profileId:'p1',
 roles: ['Lawyer'],
 phone:'01000000000',
 };
 store.dispatch({ type:'auth/thunkAuthLogin/fulfilled', payload });
 localStorage.setItem('user', JSON.stringify(payload));

 store.dispatch({ type:'auth/logout/fulfilled' });
 const state = store.getState().auth;
 expect(state.user).toBeNull();
 expect(state.status).toBe('unauthenticated');
 expect(localStorage.getItem('user')).toBeNull();
 });

 it('clears user on thunkLogout rejected', () => {
 const store = makeStore();
 store.dispatch({ type:'auth/logout/rejected' });
 expect(store.getState().auth.user).toBeNull();
 expect(store.getState().auth.status).toBe('unauthenticated');
 });

 it('synchronous logOut action clears all state', () => {
 const store = makeStore();
 store.dispatch(logOut());
 const state = store.getState().auth;
 expect(state.user).toBeNull();
 expect(state.status).toBe('unauthenticated');
 expect(state.loading).toBe('idle');
 expect(state.error).toBeNull();
 });
 });

 describe('register thunk', () => {
 it('sets pending verification info on thunkAuthRegister fulfilled', () => {
 const store = makeStore();
 const payload = { phoneNumber:'01000000000', message:'OTP sent' };
 store.dispatch({ type:'auth/thunkAuthRegister/fulfilled', payload });
 const state = store.getState().auth;
 expect(state.loading).toBe('succeeded');
 expect(state.pendingVerificationPhone).toBe('01000000000');
 expect(state.pendingVerificationMessage).toBe('OTP sent');
 });
 });
});
