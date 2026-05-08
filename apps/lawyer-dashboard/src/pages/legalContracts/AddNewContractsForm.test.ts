import { describe, expect, it } from 'vitest';
import { parseGeneratedContractSuggestions } from './AddNewContractsForm';

describe('parseGeneratedContractSuggestions', () => {
 it('parses JSON wrapped in markdown fences', () => {
 const parsed = parseGeneratedContractSuggestions(`
\`\`\`json
{
 "assetDescription": "وصف العين",
 "paymentTerms": "دفعة مقدمة",
 "partyObligations": ["التزام أول"]
}
\`\`\`
`);

 expect(parsed?.assetDescription).toBe('وصف العين');
 expect(parsed?.partyObligations).toEqual(['التزام أول']);
 });

 it('repairs trailing commas and raw newlines inside strings', () => {
 const parsed = parseGeneratedContractSuggestions(`{
 "customClauses": "البند الأول
البند الثاني",
 "jurisdiction": "محاكم القاهرة",
}`);

 expect(parsed?.customClauses).toBe('البند الأول\nالبند الثاني');
 expect(parsed?.jurisdiction).toBe('محاكم القاهرة');
 });

 it('extracts the first balanced JSON object from surrounding text', () => {
 const parsed = parseGeneratedContractSuggestions(`
هذه هي البنود:
{
 "guarantees": "شرط جزائي",
 "terminationTerms": "فسخ بعد إنذار"
}
تم.
`);

 expect(parsed?.guarantees).toBe('شرط جزائي');
 expect(parsed?.terminationTerms).toBe('فسخ بعد إنذار');
 });
});
