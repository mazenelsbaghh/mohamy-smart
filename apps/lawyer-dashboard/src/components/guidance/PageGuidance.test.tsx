import '@testing-library/jest-dom';
import { fireEvent, render, screen } from'@testing-library/react';
import { beforeEach, describe, expect, it, vi } from'vitest';
import PageGuidance from'./PageGuidance';
import { guidanceContent } from'./guidanceContent';

vi.mock('../../hooks/reduxHooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: { auth: { user: null } }) => unknown) => selector({ auth: { user: null } }),
}));

describe('PageGuidance', () => {
 beforeEach(() => {
 localStorage.clear();
 sessionStorage.clear();
 document.cookie.split(';').forEach((cookie) => {
 const name = cookie.split('=')[0]?.trim();
 if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
 });
 });

 it('stores permanent dismissal and hides the current page guidance', () => {
 render(<PageGuidance content={guidanceContent.home} />);

 fireEvent.click(screen.getByRole('button', { name:/عدم الإظهار مرة أخرى/i }));

 expect(localStorage.getItem('mohamy:page-guidance:home:dismissed')).toBe('true');
 expect(document.cookie).toContain('mohamy%3Apage-guidance%3Ahome%3Adismissed=true');
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.getByRole('button', { name:/فتح إرشاد الصفحة/i })).toBeInTheDocument();
 });

 it('does not reopen dismissed guidance when the same page is rendered again', () => {
 localStorage.setItem('mohamy:page-guidance:home:dismissed','true');

 const { rerender } = render(<PageGuidance content={guidanceContent.home} />);
 rerender(<PageGuidance content={guidanceContent.home} />);

 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.getByRole('button', { name:/فتح إرشاد الصفحة/i })).toBeInTheDocument();
 });

 it('uses the dismissal cookie when local storage is unavailable or cleared', () => {
 document.cookie ='mohamy%3Apage-guidance%3Ahome%3Adismissed=true; Path=/';

 render(<PageGuidance content={guidanceContent.home} />);

 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.getByRole('button', { name:/فتح إرشاد الصفحة/i })).toBeInTheDocument();
 });

 it('opens dismissed guidance from the page launcher', () => {
 localStorage.setItem('mohamy:page-guidance:home:dismissed','true');

 render(<PageGuidance content={guidanceContent.home} />);
 fireEvent.click(screen.getByRole('button', { name:/فتح إرشاد الصفحة/i }));

 expect(screen.getByRole('dialog')).toBeInTheDocument();
 });

 it('keeps dismissal scoped to the page key', () => {
 localStorage.setItem('mohamy:page-guidance:home:dismissed','true');

 render(<PageGuidance content={guidanceContent.cases} />);

 expect(screen.getByRole('dialog')).toBeInTheDocument();
 });

 it('stores session closing and hides the guidance for the current session', () => {
    const { rerender } = render(<PageGuidance content={guidanceContent.home} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /إغلاق الإرشاد الآن/i }));

    expect(sessionStorage.getItem('mohamy:page-guidance:home:dismissed:closed')).toBe('true');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<PageGuidance content={guidanceContent.home} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /فتح إرشاد الصفحة/i })).toBeInTheDocument();
  });

  it('clears session closed status and opens guidance when launcher is clicked', () => {
    sessionStorage.setItem('mohamy:page-guidance:home:dismissed:closed', 'true');

    render(<PageGuidance content={guidanceContent.home} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const launcher = screen.getByRole('button', { name: /فتح إرشاد الصفحة/i });
    expect(launcher).toBeInTheDocument();

    fireEvent.click(launcher);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(sessionStorage.getItem('mohamy:page-guidance:home:dismissed:closed')).toBeNull();
  });
});
