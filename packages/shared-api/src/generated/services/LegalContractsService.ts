/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLegalContractRequestDto } from '../models/CreateLegalContractRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LegalContractsService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1LegalContractsTypes(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LegalContracts/types',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1LegalContracts(
        requestBody?: CreateLegalContractRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/LegalContracts',
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
    public static getApiV1LegalContracts(
        pageNumber: number = 1,
        pageSize: number = 10,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LegalContracts',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1LegalContracts1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LegalContracts/{id}',
            path: {
                'id': id,
            },
        });
    }
}
