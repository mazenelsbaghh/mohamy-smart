import { describe, it, expect, vi, beforeEach } from'vitest';
import { render, screen } from'@testing-library/react';
import { MemoryRouter, Routes, Route } from'react-router-dom';
import { Provider } from'react-redux';
import { configureStore } from'@reduxjs/toolkit';
import AdminRoute from'./AdminRoute';

// Mocks
vi.mock('../utils/toastHelpers', () => ({
 showErrorToast: vi.fn(),
 showSuccessToast: vi.fn(),
}));

vi.mock('../redux/auth/authSlice', async () => {
 const { createAsyncThunk } = await import('@reduxjs/toolkit');
 return {
 thunkLogOut: createAsyncThunk('auth/thunkLogOut', async () => {}),
 default: (_state: unknown) => _state,
 };
});

function makeStore(authState: Record<string, unknown>) {
 return configureStore({
 reducer: {
 auth: () => authState,
 },
 });
}

function renderWithRouter(store: ReturnType<typeof makeStore>) {
 return render(
 <Provider store={store}>
 <MemoryRouter initialEntries={['/protected']}>
 <Routes>
 <Route element={<AdminRoute />}>
 <Route path="/protected" element={<div data-testid="protected-content">Protected</div>} />
 </Route>
 <Route path="/auth/login" element={<div data-testid="login-page">Login</div>} />
 </Routes>
 </MemoryRouter>
 </Provider>
 );
}

describe('AdminRoute', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });

 it('redirects to login when user is unauthenticated', () => {
 const store = makeStore({ status:'unauthenticated', user: null, isLoading: false, error: null });
 renderWithRouter(store);
 expect(screen.getByTestId('login-page')).toBeInTheDocument();
 });

 it('redirects to login when authenticated but not admin', () => {
 const store = makeStore({
 status:'authenticated',
 user: { userId:'1', fullName:'Test', roles: ['Lawyer'] },
 isLoading: false,
 error: null,
 });
 renderWithRouter(store);
 expect(screen.getByTestId('login-page')).toBeInTheDocument();
 });

 it('renders protected content when user is admin', () => {
 const store = makeStore({
 status:'authenticated',
 user: { userId:'1', fullName:'Admin', roles: ['Admin'] },
 isLoading: false,
 error: null,
 });
 renderWithRouter(store);
 expect(screen.getByTestId('protected-content')).toBeInTheDocument();
 });
});
