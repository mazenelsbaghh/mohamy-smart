/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportPeriod } from '../models/ReportPeriod';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminReportService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AdminReportsLawyers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/reports/lawyers',
        });
    }
    /**
     * @param pageNumber
     * @param pageSize
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AdminReportsSubscriptions(
        pageNumber: number = 1,
        pageSize: number = 50,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/reports/subscriptions',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * @param period
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AdminReportsRevenue(
        period?: ReportPeriod,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/reports/revenue',
            query: {
                'period': period,
            },
        });
    }
    /**
     * @param page
     * @param pageSize
     * @param workflowType
     * @param stepType
     * @param from
     * @param to
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AdminReportsValidationFailures(
        page: number = 1,
        pageSize: number = 20,
        workflowType?: string,
        stepType?: number,
        from?: string,
        to?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/reports/validation-failures',
            query: {
                'page': page,
                'pageSize': pageSize,
                'workflowType': workflowType,
                'stepType': stepType,
                'from': from,
                'to': to,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AdminReportsAccountMessaging(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/reports/account-messaging',
        });
    }
}
