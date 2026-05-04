import axios from 'axios';
import axiosRetry from 'axios-retry';

import { toApiClientError } from './error';

const FALLBACK_API_BASE_URL = 'http://localhost:8080';
const FALLBACK_TIMEOUT_MS = 10000;

const parsedTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS);
const timeoutMs = Number.isFinite(parsedTimeout) ? parsedTimeout : FALLBACK_TIMEOUT_MS;

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL,
  timeout: timeoutMs,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

axiosRetry(http, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    (error.response ? error.response.status >= 500 : false),
});

let unauthorizedHandler: ((status: number) => void) | null = null;

export function setUnauthorizedHandler(handler: ((status: number) => void) | null): void {
  unauthorizedHandler = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const parsedError = toApiClientError(error);

    if (parsedError.status === 401) {
      unauthorizedHandler?.(parsedError.status);
    }

    return Promise.reject(parsedError);
  },
);
