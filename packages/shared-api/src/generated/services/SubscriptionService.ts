/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubscriptionDto } from '../models/CreateSubscriptionDto';
import type { UpdateSubscriptionDto } from '../models/UpdateSubscriptionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionService {
    /**
     * Subscription activation now requires payment. Use POST /api/payment/initiate instead.
     * This endpoint is kept for admin use only.
     * @param lawyerId
     * @param subscriptionId
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1Subscription(
        lawyerId?: string,
        subscriptionId?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Subscription',
            query: {
                'lawyerId': lawyerId,
                'subscriptionId': subscriptionId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1Subscription(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Subscription',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1SubscriptionPlan(
        requestBody?: CreateSubscriptionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Subscription/plan',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param pageNumber
     * @param pageSize
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SubscriptionPaginated(
        pageNumber: number = 1,
        pageSize: number = 10,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Subscription/paginated',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * @param lawyerId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SubscriptionLawyer(
        lawyerId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Subscription/lawyer',
            query: {
                'lawyerId': lawyerId,
            },
        });
    }
    /**
     * @param isActive
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1SubscriptionLawyers(
        isActive?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Subscription/lawyers',
            query: {
                'isActive': isActive,
            },
        });
    }
    /**
     * @param newSubscriptionId
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1SubscriptionUpgrade(
        newSubscriptionId?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Subscription/upgrade',
            query: {
                'newSubscriptionId': newSubscriptionId,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1SubscriptionPlan(
        id: number,
        requestBody?: UpdateSubscriptionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Subscription/plan/{id}',
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
    public static putApiV1SubscriptionLawyerSubscription(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Subscription/lawyer-subscription/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Archive (soft-delete) a subscription plan. Blocked if plan has active subscribers.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static patchApiV1SubscriptionPlanArchive(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/Subscription/plan/{id}/archive',
            path: {
                'id': id,
            },
        });
    }
}
