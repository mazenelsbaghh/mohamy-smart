/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateClientDto } from '../models/CreateClientDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ClientCreate(
        requestBody?: CreateClientDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Client/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param pageNumber
     * @param pageSize
     * @param lawyerId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1Client(
        pageNumber: number = 1,
        pageSize: number = 10,
        lawyerId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Client',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
                'lawyerId': lawyerId,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1Client1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Client/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param clientName
     * @param phoneNumber
     * @param email
     * @param notes
     * @param address
     * @param nationalId
     * @param governorate
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1Client(
        id: string,
        clientName?: string,
        phoneNumber?: string,
        email?: string,
        notes?: string,
        address?: string,
        nationalId?: string,
        governorate?: string,
        caseId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Client/{id}',
            path: {
                'id': id,
            },
            query: {
                'ClientName': clientName,
                'PhoneNumber': phoneNumber,
                'Email': email,
                'Notes': notes,
                'Address': address,
                'NationalId': nationalId,
                'Governorate': governorate,
                'CaseId': caseId,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiV1Client(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/Client/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param clientId
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ClientFiles(
        clientId: string,
        formData?: {
            file?: Blob;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Client/{clientId}/files',
            path: {
                'clientId': clientId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param clientId
     * @param fileId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiV1ClientFiles(
        clientId: string,
        fileId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/Client/{clientId}/files/{fileId}',
            path: {
                'clientId': clientId,
                'fileId': fileId,
            },
        });
    }
}
