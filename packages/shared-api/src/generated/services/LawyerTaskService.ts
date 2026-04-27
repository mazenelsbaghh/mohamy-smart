/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskPeriod } from '../models/TaskPeriod';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LawyerTaskService {
    /**
     * @param title
     * @param date
     * @param time
     * @param notes
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1LawyerTaskCreate(
        title?: string,
        date?: string,
        time?: string,
        notes?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/LawyerTask/create',
            query: {
                'Title': title,
                'Date': date,
                'Time': time,
                'Notes': notes,
            },
        });
    }
    /**
     * @param pageNumber
     * @param pageSize
     * @param lawyerId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1LawyerTask(
        pageNumber: number = 1,
        pageSize: number = 10,
        lawyerId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LawyerTask',
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
    public static getApiV1LawyerTask1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LawyerTask/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param title
     * @param date
     * @param time
     * @param notes
     * @param isActive
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1LawyerTask(
        id: string,
        title?: string,
        date?: string,
        time?: string,
        notes?: string,
        isActive?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/LawyerTask/{id}',
            path: {
                'id': id,
            },
            query: {
                'Title': title,
                'Date': date,
                'Time': time,
                'Notes': notes,
                'IsActive': isActive,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiV1LawyerTask(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/LawyerTask/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param period
     * @param date
     * @param lawyerId
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1LawyerTaskCalendar(
        period?: TaskPeriod,
        date?: string,
        lawyerId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/LawyerTask/calendar',
            query: {
                'period': period,
                'date': date,
                'lawyerId': lawyerId,
            },
        });
    }
}
