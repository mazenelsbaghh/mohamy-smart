/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunWorkflowStepRequest } from '../models/RunWorkflowStepRequest';
import type { SaveComplaintStepRequest } from '../models/SaveComplaintStepRequest';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { StartComplaintWorkflowRequest } from '../models/StartComplaintWorkflowRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminComplaintService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AdminComplaint(
        requestBody?: StartComplaintWorkflowRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/AdminComplaint',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AdminComplaint(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AdminComplaint/{id}',
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
    public static getApiV1AdminComplaintCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AdminComplaint/case/{caseId}',
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
    public static postApiV1AdminComplaintStepsRun(
        requestBody?: RunWorkflowStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/AdminComplaint/steps/run',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param stepNumber
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1AdminComplaintStep(
        id: number,
        stepNumber: number,
        requestBody?: SaveComplaintStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/AdminComplaint/{id}/step/{stepNumber}',
            path: {
                'id': id,
                'stepNumber': stepNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param stepNumber
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static patchApiV1AdminComplaintStepAutoSave(
        id: number,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/AdminComplaint/{id}/step/{stepNumber}/auto-save',
            path: {
                'id': id,
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
    public static postApiV1AdminComplaintAbandon(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/AdminComplaint/abandon/{id}',
            path: {
                'id': id,
            },
        });
    }
}
