/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProcessServerPaperStatus } from './ProcessServerPaperStatus';
import type { ProcessServerPaperType } from './ProcessServerPaperType';
export type CreateProcessServerPaperDto = {
    clientId: string;
    caseId?: string | null;
    paperType: ProcessServerPaperType;
    otherPaperType?: string | null;
    customPaperTypeTitle?: string | null;
    targetName: string;
    status: ProcessServerPaperStatus;
    notes?: string | null;
    servedDate?: string | null;
};

