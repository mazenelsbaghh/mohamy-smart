import { describe, it, expect, vi, beforeEach } from'vitest';
import { configureStore } from'@reduxjs/toolkit';
import lawyersReducer from'../lawyers/lawyersSlice';

vi.mock('../lawyers/thunk/fetchLawyers', () => {
 const fetchLawyers = Object.assign(vi.fn(), {
 pending: { type:'lawyers/fetchLawyers/pending' },
 fulfilled: { type:'lawyers/fetchLawyers/fulfilled' },
 rejected: { type:'lawyers/fetchLawyers/rejected' },
 });
 return { default: fetchLawyers };
});

vi.mock('../lawyers/thunk/updateLawyerStatus', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'lawyers/updateLawyerStatus/pending' },
 fulfilled: { type:'lawyers/updateLawyerStatus/fulfilled' },
 rejected: { type:'lawyers/updateLawyerStatus/rejected' },
 }),
}));

vi.mock('../../utils/toastHelpers', () => ({
 showSuccessToast: vi.fn(),
 showErrorToast: vi.fn(),
}));

function makeStore() {
 return configureStore({
 reducer: { lawyers: lawyersReducer },
 });
}

describe('adminThunks — fetchLawyers', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });

 it('sets loading on pending', () => {
 const store = makeStore();
 store.dispatch({ type:'lawyers/fetchLawyers/pending' });
 expect(store.getState().lawyers.isLoading).toBe(true);
 expect(store.getState().lawyers.error).toBeNull();
 });

 it('stores data in state on fulfilled', () => {
 const store = makeStore();
 const items = [
 {
 id:'1',
 fullName:'Lawyer One',
 email:'l1@test.com',
 phoneNumber:'01000000001',
 isActive: true,
 barNumber:'B001',
 specialization:'Civil',
 experienceNumber:'5',
 lawFirmName:'Firm A',
 lawyerId:'lv1',
 subscriptionPlanName:'Pro',
 subscriptionIsActive: true,
 numberOfCases: 10,
 },
 ];
 const payload = {
 items,
 totalPages: 1,
 pageNumber: 1,
 pageSize: 10,
 totalCount: 1,
 };
 store.dispatch({ type:'lawyers/fetchLawyers/fulfilled', payload });
 const state = store.getState().lawyers;
 expect(state.isLoading).toBe(false);
 expect(state.list).toEqual(items);
 expect(state.totalPages).toBe(1);
 expect(state.totalCount).toBe(1);
 });

 it('sets error on rejected', () => {
 const store = makeStore();
 store.dispatch({ type:'lawyers/fetchLawyers/rejected', payload:'Network error' });
 const state = store.getState().lawyers;
 expect(state.isLoading).toBe(false);
 expect(state.error).toBe('Network error');
 });

 it('handles fulfilled with empty items array', () => {
 const store = makeStore();
 store.dispatch({
 type:'lawyers/fetchLawyers/fulfilled',
 payload: { items: [], totalPages: 0, pageNumber: 1, pageSize: 10, totalCount: 0 },
 });
 expect(store.getState().lawyers.list).toEqual([]);
 expect(store.getState().lawyers.totalCount).toBe(0);
 });
});
