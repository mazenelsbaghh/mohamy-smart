/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
    /**
     * @param caseId
     * @param state
     * @param pageNumber
     * @param pageSize
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1Documents(
        caseId?: string,
        state?: string,
        pageNumber: number = 1,
        pageSize: number = 10,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Documents',
            query: {
                'caseId': caseId,
                'state': state,
                'pageNumber': pageNumber,
                'pageSize': pageSize,
            },
        });
    }
}
