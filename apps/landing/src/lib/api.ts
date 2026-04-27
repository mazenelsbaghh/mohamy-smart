import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

if (process.env.NODE_ENV === 'production' && rawApiUrl && !rawApiUrl.startsWith('https://')) {
  throw new Error(`[Security] NEXT_PUBLIC_API_BASE_URL must use HTTPS in production. Got: ${rawApiUrl}`);
}

export const apiBaseUrl = rawApiUrl;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});
