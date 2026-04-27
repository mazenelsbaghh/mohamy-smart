/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LawSuitCaseTypeRequestDto } from '../models/LawSuitCaseTypeRequestDto';
import type { LawSuitFactsRequestDto } from '../models/LawSuitFactsRequestDto';
import type { LawSuitLegalBasisRequestDto } from '../models/LawSuitLegalBasisRequestDto';
import type { LawSuitPartiesRequestDto } from '../models/LawSuitPartiesRequestDto';
import type { LawSuitRequestsRequestDto } from '../models/LawSuitRequestsRequestDto';
import type { LawSuitSubjectsRequestDto } from '../models/LawSuitSubjectsRequestDto';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { StartStatementOfClaimsRequest } from '../models/StartStatementOfClaimsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PreparingStatementOfClaimsService {
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/case/{caseId}',
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
    public static postApiV1PreparingStatementOfClaims(
        requestBody?: StartStatementOfClaimsRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1PreparingStatementOfClaimsLawsuitCaseType(
        requestBody?: LawSuitCaseTypeRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-case-type',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsLawsuitCaseType(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-case-type/{caseId}',
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
    public static postApiV1PreparingStatementOfClaimsLawsuitParties(
        requestBody?: LawSuitPartiesRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-parties',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsLawsuitParties(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-parties/{caseId}',
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
    public static postApiV1PreparingStatementOfClaimsLawsuitSubjects(
        requestBody?: LawSuitSubjectsRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-subjects',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsLawsuitSubjects(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-subjects/{caseId}',
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
    public static postApiV1PreparingStatementOfClaimsLawsuitFacts(
        requestBody?: LawSuitFactsRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-facts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsLawsuitFacts(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-facts/{caseId}',
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
    public static postApiV1PreparingStatementOfClaimsLawsuitLegalBasis(
        requestBody?: LawSuitLegalBasisRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-legal-basis',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsLawsuitLegalBasis(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-legal-basis/{caseId}',
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
    public static postApiV1PreparingStatementOfClaimsLawsuitRequests(
        requestBody?: LawSuitRequestsRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-requests',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PreparingStatementOfClaimsLawsuitRequests(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PreparingStatementOfClaims/lawsuit-requests/{caseId}',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1PreparingStatementOfClaimsAbandon(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PreparingStatementOfClaims/{caseId}/abandon',
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
    public static patchApiV1PreparingStatementOfClaimsStepAutoSave(
        caseId: string,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/PreparingStatementOfClaims/{caseId}/step/{stepNumber}/auto-save',
            path: {
                'caseId': caseId,
                'stepNumber': stepNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
