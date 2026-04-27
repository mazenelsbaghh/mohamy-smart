import { describe, it, expect, vi, beforeEach } from'vitest';
import { render, screen } from'@testing-library/react';
import { MemoryRouter, Routes, Route } from'react-router-dom';
import { Provider } from'react-redux';
import { configureStore } from'@reduxjs/toolkit';
import ProtectedRoute from'./ProtectedRoute';

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
 <MemoryRouter initialEntries={['/dashboard']}>
 <Routes>
 <Route element={<ProtectedRoute />}>
 <Route path="/dashboard" element={<div data-testid="dashboard-content">Dashboard</div>} />
 </Route>
 <Route path="/auth/login" element={<div data-testid="login-page">Login</div>} />
 </Routes>
 </MemoryRouter>
 </Provider>
 );
}

describe('ProtectedRoute', () => {
 beforeEach(() => {
 localStorage.clear();
 vi.clearAllMocks();
 });

 it('renders nothing while auth status is unknown (loading)', () => {
 const store = makeStore({ user: null, status:'unknown' });
 const { container } = renderWithRouter(store);
 expect(container.querySelector('[data-testid="dashboard-content"]')).toBeNull();
 expect(container.querySelector('[data-testid="login-page"]')).toBeNull();
 });

 it('redirects to login when unauthenticated', () => {
 const store = makeStore({ user: null, status:'unauthenticated' });
 renderWithRouter(store);
 expect(screen.getByTestId('login-page')).toBeInTheDocument();
 });

 it('renders protected content when authenticated', () => {
 const store = makeStore({
 user: { userId:'1', fullName:'Lawyer', roles: ['Lawyer'] },
 status:'authenticated',
 });
 renderWithRouter(store);
 expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
 });
});
