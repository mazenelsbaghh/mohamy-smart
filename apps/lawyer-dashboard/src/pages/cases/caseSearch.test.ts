import { describe, expect, it } from'vitest';
import type { TCase } from'../../redux/cases/casesSlice';
import { caseMatchesSearch, normalizeCaseSearchText } from'./caseSearch';

const baseCase: TCase = {
 id:'case-1',
 title:'دعوى صحة توقيع على عقد بيع ابتدائي',
 number:'1025',
 caseTypeId: 8,
 caseTypeName:'المدني',
 caseTypeNames:['المدني','الإثبات'],
 court:'محكمة مدني سيدي جابر الجزئية الدائرة 29',
 clientName:'الدكتور عاطف وديع بسطوروس معوض',
 apponentName:'محمد عبد الحميد محمد عبد المنعم بدوي',
 defendingParty:'client',
 description:'نزاع متعلق بصحة توقيع عقد بيع',
 facts:'وقائع القضية',
 legalClaims:'طلبات قانونية',
 status: 0,
 clientId:'client-1',
 creationDate:'2026-04-27',
 isActive: true,
};

describe('case search helpers', () => {
 it('normalizes Arabic digits and common Arabic letter variants', () => {
 expect(normalizeCaseSearchText('  رقم ١٠٢٥ إختبار  ')).toBe('رقم 1025 اختبار');
 });

 it('matches by client name', () => {
 expect(caseMatchesSearch(baseCase,'عاطف وديع')).toBe(true);
 });

 it('matches by opponent name', () => {
 expect(caseMatchesSearch(baseCase,'عبد المنعم بدوى')).toBe(true);
 });

 it('matches by court and case number with Arabic digits', () => {
 expect(caseMatchesSearch(baseCase,'سيدي جابر ١٠٢٥')).toBe(true);
 });

 it('matches by status and archive labels', () => {
 expect(caseMatchesSearch(baseCase,'متداولة')).toBe(true);
 expect(caseMatchesSearch({ ...baseCase, isActive: false },'مؤرشفة')).toBe(true);
 });

 it('returns true for empty queries and false for unrelated terms', () => {
 expect(caseMatchesSearch(baseCase,'   ')).toBe(true);
 expect(caseMatchesSearch(baseCase,'تجاري القاهرة الجديدة')).toBe(false);
 });
});
