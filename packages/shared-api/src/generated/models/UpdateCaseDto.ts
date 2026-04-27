/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CaseStatus } from './CaseStatus';
export type UpdateCaseDto = {
    title?: string | null;
    number?: string | null;
    caseTypeIds?: Array<number> | null;
    status?: CaseStatus;
    court?: string | null;
    clientName?: string | null;
    apponentName?: string | null;
    description?: string | null;
    facts?: string | null;
    legalClaims?: string | null;
    powerOfAttorneyId?: string | null;
};

