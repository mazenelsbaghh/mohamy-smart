/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AgendaItemDto } from '../models/AgendaItemDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AgendaService {
    /**
     * @param caseId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AgendaCase(
        caseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Agenda/case/{caseId}',
            path: {
                'caseId': caseId,
            },
        });
    }
    /**
     * @param lawyerId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AgendaLawyer(
        lawyerId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Agenda/lawyer/{lawyerId}',
            path: {
                'lawyerId': lawyerId,
            },
        });
    }
    /**
     * @param date
     * @param lawyerId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AgendaAgendaRoll(
        date?: string,
        lawyerId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Agenda/agenda-roll',
            query: {
                'date': date,
                'lawyerId': lawyerId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1Agenda(
        requestBody?: AgendaItemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Agenda',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
