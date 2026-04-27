/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunWorkflowStepRequest } from '../models/RunWorkflowStepRequest';
import type { SaveRulingStepRequest } from '../models/SaveRulingStepRequest';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { StartRulingWorkflowRequest } from '../models/StartRulingWorkflowRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RulingAnalysisService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1RulingAnalysisStart(
        requestBody?: StartRulingWorkflowRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/RulingAnalysis/start',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1RulingAnalysis(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/RulingAnalysis/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1RulingAnalysisCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/RulingAnalysis/case/{caseId}',
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
    public static postApiV1RulingAnalysisStepsRun(
        requestBody?: RunWorkflowStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/RulingAnalysis/steps/run',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param workflowId
     * @param stepNumber
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1RulingAnalysisStepsSave(
        workflowId: number,
        stepNumber: number,
        requestBody?: SaveRulingStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/RulingAnalysis/{workflowId}/steps/{stepNumber}/save',
            path: {
                'workflowId': workflowId,
                'stepNumber': stepNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param workflowId
     * @param stepNumber
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static patchApiV1RulingAnalysisStepAutoSave(
        workflowId: number,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/RulingAnalysis/{workflowId}/step/{stepNumber}/auto-save',
            path: {
                'workflowId': workflowId,
                'stepNumber': stepNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1RulingAnalysisAbandon(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/RulingAnalysis/abandon/{id}',
            path: {
                'id': id,
            },
        });
    }
}
