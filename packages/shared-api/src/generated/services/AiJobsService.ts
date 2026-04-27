/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AiStepType } from '../models/AiStepType';
import type { SubmitAiJobDto } from '../models/SubmitAiJobDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiJobsService {
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1CasesAiJobs(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/cases/{caseId}/ai-jobs',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param caseId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1CasesAiJobs(
        caseId: string,
        requestBody?: SubmitAiJobDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/cases/{caseId}/ai-jobs',
            path: {
                'caseId': caseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @param stepType
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1CasesAiJobs1(
        caseId: string,
        stepType: AiStepType,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/cases/{caseId}/ai-jobs/{stepType}',
            path: {
                'caseId': caseId,
                'stepType': stepType,
            },
        });
    }
    /**
     * @param caseId
     * @param stepType
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1CasesAiJobsRetry(
        caseId: string,
        stepType: AiStepType,
        requestBody?: SubmitAiJobDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/cases/{caseId}/ai-jobs/{stepType}/retry',
            path: {
                'caseId': caseId,
                'stepType': stepType,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param caseId
     * @param stepType
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1CasesAiJobsCancel(
        caseId: string,
        stepType: AiStepType,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/cases/{caseId}/ai-jobs/{stepType}/cancel',
            path: {
                'caseId': caseId,
                'stepType': stepType,
            },
        });
    }
}
