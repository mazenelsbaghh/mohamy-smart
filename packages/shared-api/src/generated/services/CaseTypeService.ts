/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CaseTypeService {
    /**
     * @param searchQuery
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1CaseType(
        searchQuery?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/CaseType',
            query: {
                'searchQuery': searchQuery,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1CaseType1(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/CaseType/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param title
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1CaseType(
        id: number,
        title?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/CaseType/{id}',
            path: {
                'id': id,
            },
            query: {
                'Title': title,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiV1CaseType(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/CaseType/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param title
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1CaseTypeCreate(
        title?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/CaseType/create',
            query: {
                'Title': title,
            },
        });
    }
}
