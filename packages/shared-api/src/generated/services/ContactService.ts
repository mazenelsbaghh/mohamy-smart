/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubmitContactRequestDto } from '../models/SubmitContactRequestDto';
import type { UpdateContactStatusDto } from '../models/UpdateContactStatusDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContactService {
    /**
     * Public endpoint: submit a contact request from the landing page.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ContactSubmit(
        requestBody?: SubmitContactRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Contact/submit',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Admin-only: list contact requests, optionally filtered by status (New, Read, Replied).
     * @param status
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1Contact(
        status?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Contact',
            query: {
                'status': status,
            },
        });
    }
    /**
     * Admin-only: update the status of a contact request.
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static patchApiV1ContactStatus(
        id: string,
        requestBody?: UpdateContactStatusDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/Contact/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
