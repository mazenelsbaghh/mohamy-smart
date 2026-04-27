/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateAiModelConfigRequest } from '../models/UpdateAiModelConfigRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiModelConfigService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiModelConfig(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AiModelConfig',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1AiModelConfig(
        requestBody?: UpdateAiModelConfigRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/AiModelConfig',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiModelConfigModels(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AiModelConfig/models',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AiModelConfigStages(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/AiModelConfig/stages',
        });
    }
}
