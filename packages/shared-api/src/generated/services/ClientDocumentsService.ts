/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientDocumentsService {
    /**
     * @param clientId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1ClientDocumentsClient(
        clientId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ClientDocuments/client/{clientId}',
            path: {
                'clientId': clientId,
            },
        });
    }
    /**
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ClientDocuments(
        formData?: {
            ClientId?: string;
            DocumentName?: string;
            DeliveryDate?: string;
            ReceiptFile?: Blob;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ClientDocuments',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
