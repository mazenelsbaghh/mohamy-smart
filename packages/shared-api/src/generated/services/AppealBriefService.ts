/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunStepRequest } from '../models/RunStepRequest';
import type { SaveStepRequest } from '../models/SaveStepRequest';
import type { SaveWorkflowDraftRequest } from '../models/SaveWorkflowDraftRequest';
import type { StartAppealWorkflowRequest } from '../models/StartAppealWorkflowRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AppealBriefService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AppealBrief(
        requestBody?: StartAppealWorkflowRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/AppealBrief',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AppealBrief(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AppealBrief/{id}',
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
    public static getApiV1AppealBriefCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AppealBrief/case/{caseId}',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param id
     * @param stepNumber
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AppealBriefStep(
        id: number,
        stepNumber: number,
        requestBody?: RunStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/AppealBrief/{id}/step/{stepNumber}',
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
    public static putApiV1AppealBriefStep(
        id: number,
        stepNumber: number,
        requestBody?: SaveStepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/AppealBrief/{id}/step/{stepNumber}',
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
    public static patchApiV1AppealBriefStepAutoSave(
        id: number,
        stepNumber: number,
        requestBody?: SaveWorkflowDraftRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/AppealBrief/{id}/step/{stepNumber}/auto-save',
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
    public static postApiV1AppealBriefAbandon(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/AppealBrief/abandon/{id}',
            path: {
                'id': id,
            },
        });
    }
}
