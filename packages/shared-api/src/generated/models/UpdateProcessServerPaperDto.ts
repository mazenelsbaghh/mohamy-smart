/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProcessServerPaperStatus } from './ProcessServerPaperStatus';
import type { ProcessServerPaperType } from './ProcessServerPaperType';
export type UpdateProcessServerPaperDto = {
    paperType?: ProcessServerPaperType;
    otherPaperType?: string | null;
    customPaperTypeTitle?: string | null;
    targetName?: string | null;
    status?: ProcessServerPaperStatus;
    notes?: string | null;
};

