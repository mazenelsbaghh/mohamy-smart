import { fireEvent, render, screen } from'@testing-library/react';
import { beforeEach, describe, expect, it } from'vitest';
import PageGuidance from'./PageGuidance';
import { guidanceContent } from'./guidanceContent';

describe('PageGuidance', () => {
 beforeEach(() => {
 localStorage.clear();
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
});
