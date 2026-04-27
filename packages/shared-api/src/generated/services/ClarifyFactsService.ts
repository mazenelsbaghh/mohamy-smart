/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClarifyFactsRequestDto } from '../models/ClarifyFactsRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClarifyFactsService {
    /**
     * Pre-flight endpoint: evaluates the case facts for material gaps
     * and returns 3–7 clarification questions (each with 3 suggested answers).
     * Returns an empty list if the facts are comprehensive.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1ClarifyFactsEvaluate(
        requestBody?: ClarifyFactsRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ClarifyFacts/evaluate',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
