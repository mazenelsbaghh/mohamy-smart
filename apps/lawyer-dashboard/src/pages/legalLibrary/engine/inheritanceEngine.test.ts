import { describe, expect, it } from'vitest';
import { calculateInheritance } from'./inheritanceEngine';

describe('calculateInheritance', () => {
 it('does not return remainder to the wife when a full sister is present', () => {
 const result = calculateInheritance(
 { totalValue: 100000, debts: 0, bequests: 0 },
 [
 { type:'WIFE', count: 1 },
 { type:'FULL_SISTER', count: 1 },
 ],
 );

 const wife = result.shares.find((share) => share.heirType ==='WIFE');
 const fullSister = result.shares.find((share) => share.heirType ==='FULL_SISTER');

 expect(wife?.fraction).toBe('1/4');
 expect(wife?.totalAmount).toBe(25000);
 expect(wife?.shareType).toBe('fard');
 expect(fullSister?.fraction).toBe('1/2');
 expect(fullSister?.totalAmount).toBe(75000);
 expect(fullSister?.shareType).toBe('radd');
 expect(result.remainingEstate).toBe(0);
 });

 it('returns remainder to a spouse only when there is no other radd heir or residuary heir', () => {
 const result = calculateInheritance(
 { totalValue: 100000, debts: 0, bequests: 0 },
 [{ type:'WIFE', count: 1 }],
 );

 const wife = result.shares.find((share) => share.heirType ==='WIFE');

 expect(wife?.fraction).toBe('1/4');
 expect(wife?.totalAmount).toBe(100000);
 expect(wife?.shareType).toBe('radd');
 expect(result.remainingEstate).toBe(0);
 });
});
