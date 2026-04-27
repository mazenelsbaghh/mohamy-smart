/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnalyticsService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AnalyticsFinancial(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Analytics/financial',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AnalyticsSubscriptions(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Analytics/subscriptions',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AnalyticsEngagement(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Analytics/engagement',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AnalyticsCohorts(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Analytics/cohorts',
        });
    }
}
