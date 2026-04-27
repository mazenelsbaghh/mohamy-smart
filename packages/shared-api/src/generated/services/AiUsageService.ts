/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiUsageService {
    /**
     * @param from
     * @param to
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiUsageSummary(
        from?: string,
        to?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ai-usage/summary',
            query: {
                'from': from,
                'to': to,
            },
        });
    }
    /**
     * @param pageNumber
     * @param pageSize
     * @param from
     * @param to
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiUsageLawyers(
        pageNumber: number = 1,
        pageSize: number = 20,
        from?: string,
        to?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ai-usage/lawyers',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
                'from': from,
                'to': to,
            },
        });
    }
    /**
     * @param lawyerId
     * @param from
     * @param to
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiUsageLawyers1(
        lawyerId: string,
        from?: string,
        to?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ai-usage/lawyers/{lawyerId}',
            path: {
                'lawyerId': lawyerId,
            },
            query: {
                'from': from,
                'to': to,
            },
        });
    }
    /**
     * @param from
     * @param to
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiUsageModels(
        from?: string,
        to?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ai-usage/models',
            query: {
                'from': from,
                'to': to,
            },
        });
    }
}
