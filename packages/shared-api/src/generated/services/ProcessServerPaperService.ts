/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateProcessServerPaperDto } from '../models/CreateProcessServerPaperDto';
import type { MarkServedDto } from '../models/MarkServedDto';
import type { ProcessServerPaperStatus } from '../models/ProcessServerPaperStatus';
import type { ProcessServerPaperType } from '../models/ProcessServerPaperType';
import type { UpdateProcessServerPaperDto } from '../models/UpdateProcessServerPaperDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProcessServerPaperService {
    /**
     * @param clientId
     * @param caseId
     * @param status
     * @param type
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1ProcessServerPaper(
        clientId?: string,
        caseId?: string,
        status?: ProcessServerPaperStatus,
        type?: ProcessServerPaperType,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ProcessServerPaper',
            query: {
                'clientId': clientId,
                'caseId': caseId,
                'status': status,
                'type': type,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ProcessServerPaper(
        requestBody?: CreateProcessServerPaperDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ProcessServerPaper',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1ProcessServerPaper1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ProcessServerPaper/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1ProcessServerPaper(
        id: string,
        requestBody?: UpdateProcessServerPaperDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/ProcessServerPaper/{id}',
            path: {
                'id': id,
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
    public static deleteApiV1ProcessServerPaper(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/ProcessServerPaper/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ProcessServerPaperAttachment(
        id: string,
        formData?: {
            file: Blob;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ProcessServerPaper/{id}/attachment',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ProcessServerPaperMarkServed(
        id: string,
        requestBody?: MarkServedDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ProcessServerPaper/{id}/mark-served',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
