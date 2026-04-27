/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunWorkflowStepRequest } from '../models/RunWorkflowStepRequest';
import type { SaveWarningStepRequest } from '../models/SaveWarningStepRequest';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { StartLegalWarningRequest } from '../models/StartLegalWarningRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LegalWarningService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1LegalWarningStart(
        requestBody?: StartLegalWarningRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/LegalWarning/start',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1LegalWarning(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LegalWarning/{id}',
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
    public static getApiV1LegalWarningCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LegalWarning/case/{caseId}',
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
    public static postApiV1LegalWarningStepsRun(
        requestBody?: RunWorkflowStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/LegalWarning/steps/run',
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
    public static putApiV1LegalWarningStepsSave(
        workflowId: number,
        stepNumber: number,
        requestBody?: SaveWarningStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/LegalWarning/{workflowId}/steps/{stepNumber}/save',
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
    public static patchApiV1LegalWarningStepAutoSave(
        workflowId: number,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/LegalWarning/{workflowId}/step/{stepNumber}/auto-save',
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
    public static postApiV1LegalWarningAbandon(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/LegalWarning/abandon/{id}',
            path: {
                'id': id,
            },
        });
    }
}
