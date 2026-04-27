/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnalyzeDefenseRequestDto } from '../models/AnalyzeDefenseRequestDto';
import type { CaseAnalysisRequestDto } from '../models/CaseAnalysisRequestDto';
import type { CaseDefensesRequestDto } from '../models/CaseDefensesRequestDto';
import type { ChatRequestDto } from '../models/ChatRequestDto';
import type { FinalRequirementsRequestDto } from '../models/FinalRequirementsRequestDto';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SmartAnalysisService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SmartAnalysisLegalAnalysis(
        requestBody?: CaseAnalysisRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/SmartAnalysis/legal-analysis',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SmartAnalysisFactAnalysis(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/SmartAnalysis/fact-analysis/{caseId}',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SmartAnalysisGenerateDefenses(
        requestBody?: CaseDefensesRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/SmartAnalysis/generate-defenses',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SmartAnalysisDefenses(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/SmartAnalysis/defenses/{caseId}',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SmartAnalysisAnalyzeDefense(
        requestBody?: AnalyzeDefenseRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/SmartAnalysis/analyze-defense',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param defenseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SmartAnalysisDefenseAnalysis(
        defenseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/SmartAnalysis/defense-analysis/{defenseId}',
            path: {
                'defenseId': defenseId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SmartAnalysisFinalRequirements(
        requestBody?: FinalRequirementsRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/SmartAnalysis/final-requirements',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SmartAnalysisCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/SmartAnalysis/case/{caseId}',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SmartAnalysisChat(
        requestBody?: ChatRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/SmartAnalysis/chat',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SmartAnalysisAbandon(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/SmartAnalysis/{caseId}/abandon',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param caseId
     * @param stepNumber
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static patchApiV1SmartAnalysisStepAutoSave(
        caseId: string,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/SmartAnalysis/{caseId}/step/{stepNumber}/auto-save',
            path: {
                'caseId': caseId,
                'stepNumber': stepNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
