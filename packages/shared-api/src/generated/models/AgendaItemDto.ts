/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AgendaStatus } from './AgendaStatus';
export type AgendaItemDto = {
    caseId?: string;
    title: string | null;
    date?: string;
    type: string | null;
    status?: AgendaStatus;
    sessionType?: string | null;
    courtName?: string | null;
    previousSessionId?: string | null;
    postponementReason?: string | null;
    actionType?: string | null;
    executionDetails?: string | null;
    location?: string | null;
};

