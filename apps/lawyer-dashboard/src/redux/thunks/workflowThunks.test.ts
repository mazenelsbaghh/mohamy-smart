import { describe, it, expect, vi, beforeEach } from'vitest';
import { configureStore } from'@reduxjs/toolkit';
import casesReducer from'../cases/casesSlice';

vi.mock('../cases/thunk/thunkGetAllCases', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'cases/thunkGetAllCases/pending' },
 fulfilled: { type:'cases/thunkGetAllCases/fulfilled' },
 rejected: { type:'cases/thunkGetAllCases/rejected' },
 }),
}));

vi.mock('../cases/thunk/thunkAddNewCase', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'cases/thunkAddNewCase/pending' },
 fulfilled: { type:'cases/thunkAddNewCase/fulfilled' },
 rejected: { type:'cases/thunkAddNewCase/rejected' },
 }),
}));

vi.mock('../cases/thunk/thunkGetSingleCase', () => ({
 default: Object.assign(vi.fn(), {
 pending: { type:'cases/thunkGetSingleCase/pending' },
 fulfilled: { type:'cases/thunkGetSingleCase/fulfilled' },
 rejected: { type:'cases/thunkGetSingleCase/rejected' },
 }),
}));

vi.mock('@mohamy/shared-utils', async (importOriginal) => {
 const actual = await importOriginal<typeof import('@mohamy/shared-utils')>();
 return { ...actual, isString: (v: unknown) => typeof v ==='string' };
});

function makeStore() {
 return configureStore({
 reducer: { cases: casesReducer },
 });
}

describe('workflowThunks — thunkGetAllCases', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });

 it('sets loading pending and clears cases on pending', () => {
 const store = makeStore();
 store.dispatch({ type:'cases/thunkGetAllCases/pending' });
 const state = store.getState().cases;
 expect(state.loading).toBe('pending');
 expect(state.error).toBeNull();
 expect(state.cases).toEqual([]);
 });

 it('stores data in state on fulfilled', () => {
 const store = makeStore();
 const casesData = [
 {
 id: 1,
 title:'Case One',
 number:'C001',
 caseTypeId: 1,
 caseTypeName:'Civil',
 court:'Cairo',
 clientName:'Client A',
 apponentName:'Opponent A',
 defendingParty:'Defendant',
 description:'Test case',
 facts:'Facts here',
 legalClaims:'',
 status: 1,
 clientId:'cl1',
 creationDate:'2025-01-01',
 },
 ];
 const payload = {
 data: casesData,
 pageNumber: 1,
 totalPages: 1,
 totalRecords: 1,
 };
 store.dispatch({ type:'cases/thunkGetAllCases/fulfilled', payload });
 const state = store.getState().cases;
 expect(state.loading).toBe('succeeded');
 expect(state.cases).toEqual(casesData);
 expect(state.pageNumber).toBe(1);
 expect(state.totalPages).toBe(1);
 expect(state.totalRecords).toBe(1);
 });

 it('sets error state on rejected', () => {
 const store = makeStore();
 store.dispatch({ type:'cases/thunkGetAllCases/rejected', payload:'Server error' });
 const state = store.getState().cases;
 expect(state.loading).toBe('failed');
 expect(state.cases).toEqual([]);
 expect(state.error).toBe('Server error');
 });

 it('handles fulfilled with empty cases', () => {
 const store = makeStore();
 store.dispatch({
 type:'cases/thunkGetAllCases/fulfilled',
 payload: { data: [], pageNumber: 1, totalPages: 0, totalRecords: 0 },
 });
 expect(store.getState().cases.cases).toEqual([]);
 expect(store.getState().cases.totalRecords).toBe(0);
 });
});
