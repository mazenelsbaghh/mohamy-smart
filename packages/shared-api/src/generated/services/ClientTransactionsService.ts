/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateClientTransactionDto } from '../models/CreateClientTransactionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientTransactionsService {
    /**
     * @param clientId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1ClientTransactionsClient(
        clientId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ClientTransactions/client/{clientId}',
            path: {
                'clientId': clientId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ClientTransactions(
        requestBody?: CreateClientTransactionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ClientTransactions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
