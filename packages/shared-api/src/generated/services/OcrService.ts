/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OcrService {
    /**
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1OcrOcr(
        formData?: {
            images?: Array<Blob>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Ocr/ocr',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1OcrGenerateCase(
        formData?: {
            revisedText: string;
            availableCaseTypesJson?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Ocr/generate-case',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
