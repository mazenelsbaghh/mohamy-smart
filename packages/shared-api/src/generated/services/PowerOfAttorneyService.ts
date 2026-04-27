/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PowerOfAttorneyDto } from '../models/PowerOfAttorneyDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PowerOfAttorneyService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1PowerOfAttorney(
        requestBody?: PowerOfAttorneyDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/PowerOfAttorney',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param clientId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1PowerOfAttorneyClient(
        clientId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/PowerOfAttorney/client/{clientId}',
            path: {
                'clientId': clientId,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1PowerOfAttorneyCancel(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/PowerOfAttorney/{id}/cancel',
            path: {
                'id': id,
            },
        });
    }
}
