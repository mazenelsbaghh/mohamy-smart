/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentService {
    /**
     * @param subscriptionId
     * @param paymentMethod
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1PaymentInitiate(
        subscriptionId?: number,
        paymentMethod?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Payment/initiate',
            query: {
                'subscriptionId': subscriptionId,
                'paymentMethod': paymentMethod,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PaymentCallback(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Payment/callback',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1PaymentServerCallback(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Payment/server-callback',
        });
    }
    /**
     * @param paymentId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PaymentStatus(
        paymentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Payment/status/{paymentId}',
            path: {
                'paymentId': paymentId,
            },
        });
    }
    /**
     * @param transactionId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PaymentStatusByTransaction(
        transactionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Payment/status/by-transaction/{transactionId}',
            path: {
                'transactionId': transactionId,
            },
        });
    }
    /**
     * @param pageNumber
     * @param pageSize
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PaymentHistory(
        pageNumber: number = 1,
        pageSize: number = 20,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Payment/history',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
            },
        });
    }
}
