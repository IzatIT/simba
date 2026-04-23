import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { Storage } from "../utils/storage.ts";
import { BASE_URL } from "../../contants";
import { Path } from "./path.ts";

interface ErrorResponse {
    message: string;
    statusCode: number;
}

// Создаем экземпляр axios
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

const resetRefreshAttempts = () => {
    refreshAttempts = 0;
};

const isMaxAttemptsReached = (): boolean => {
    return refreshAttempts >= MAX_REFRESH_ATTEMPTS;
};

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Storage.getItem('ACCESS_TOKEN');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Разворачиваем envelope { success: true, data: ... } автоматически
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _refreshAttempt?: number };

        // Если ошибка не 401 или уже достигнут лимит попыток
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // Если это не запрос на рефреш и мы уже пробовали рефрешить много раз
        if (!originalRequest._retry && isMaxAttemptsReached()) {
            resetRefreshAttempts();
            Storage.removeItem('ACCESS_TOKEN');
            Storage.removeItem('REFRESH_TOKEN');

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(new Error('Maximum refresh attempts reached'));
        }

        // Если это запрос на рефреш (не нужно пытаться рефрешить его снова)
        if (originalRequest.url?.includes(Path.Auth.Refresh)) {
            resetRefreshAttempts();
            Storage.removeItem('ACCESS_TOKEN');
            Storage.removeItem('REFRESH_TOKEN');

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        if (!originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest._refreshAttempt = (originalRequest._refreshAttempt || 0) + 1;
            refreshAttempts++;
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => apiClient(originalRequest))
                .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            // Refresh token передаётся автоматически через HttpOnly cookie
            const response = await axios.post(
                `${BASE_URL}/${Path.Auth.Refresh}`,
                {},
                { withCredentials: true }
            );

            // Разворачиваем envelope вручную (здесь не проходит через interceptor)
            const responseData = response.data?.data ?? response.data;
            const accessToken = responseData?.accessToken || responseData?.data?.accessToken;

            if (!accessToken) {
                throw new Error('No access token received');
            }

            Storage.setItem('ACCESS_TOKEN', accessToken);

            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Сброс счетчика при успешном обновлении
            resetRefreshAttempts();
            processQueue(null, accessToken);

            return apiClient(originalRequest);
        } catch (refreshError) {
            const axiosError = refreshError as AxiosError;

            // Если рефреш не удался, увеличиваем счетчик
            console.error(`Refresh attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS} failed:`, axiosError.message);

            processQueue(refreshError as Error, null);

            // Если достигнут лимит попыток, очищаем всё и редиректим на логин
            if (isMaxAttemptsReached()) {
                resetRefreshAttempts();
                Storage.removeItem('ACCESS_TOKEN');
                Storage.removeItem('REFRESH_TOKEN');

                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export const resetRefreshCounter = () => {
    resetRefreshAttempts();
};

export default apiClient;