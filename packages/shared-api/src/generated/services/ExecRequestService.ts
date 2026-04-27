/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunWorkflowStepRequest } from '../models/RunWorkflowStepRequest';
import type { SaveExecStepRequest } from '../models/SaveExecStepRequest';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { StartExecRequestRequest } from '../models/StartExecRequestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExecRequestService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ExecRequestStart(
        requestBody?: StartExecRequestRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ExecRequest/start',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1ExecRequest(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ExecRequest/{id}',
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
    public static getApiV1ExecRequestCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ExecRequest/case/{caseId}',
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
    public static postApiV1ExecRequestStepsRun(
        requestBody?: RunWorkflowStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ExecRequest/steps/run',
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
    public static putApiV1ExecRequestStepsSave(
        workflowId: number,
        stepNumber: number,
        requestBody?: SaveExecStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/ExecRequest/{workflowId}/steps/{stepNumber}/save',
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
    public static patchApiV1ExecRequestStepAutoSave(
        workflowId: number,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/ExecRequest/{workflowId}/step/{stepNumber}/auto-save',
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
    public static postApiV1ExecRequestAbandon(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ExecRequest/abandon/{id}',
            path: {
                'id': id,
            },
        });
    }
}
