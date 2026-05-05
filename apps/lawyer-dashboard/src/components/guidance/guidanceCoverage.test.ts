import { describe, expect, it } from'vitest';
import { guidanceRoutes } from'./guidanceRoutes';
import { guidanceContent } from'./guidanceContent';
import { getGuidanceCoverageIssues } from'./guidanceCoverage';

describe('page guidance coverage', () => {
 it('has content for every registered route', () => {
 const missingKeys = guidanceRoutes
 .map((route) => route.key)
 .filter((key) => !guidanceContent[key]);

 expect(missingKeys).toEqual([]);
 });

 it('has complete tour and AI guidance copy', () => {
 expect(getGuidanceCoverageIssues()).toEqual([]);
 });
});
