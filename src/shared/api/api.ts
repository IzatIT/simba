import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import {Storage} from "../utils/storage.ts";
import {BASE_URL} from "../../contants";
import {Path} from "./path.ts";

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

interface ErrorResponse {
    message: string;
    statusCode: number;
}

// Создаем экземпляр axios
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
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

// Интерсептор для добавления токена
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

// Интерсептор для обработки ответов и refresh token
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Если ошибка 401 и запрос не повторялся
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return apiClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Storage.getItem('REFRESH_TOKEN');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Запрос на обновление токенов
                const response = await axios.post<TokenResponse>(
                    `${BASE_URL}/${Path.Auth.Refresh}`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Сохраняем новые токены
                Storage.setItem('REFRESH_TOKEN', newRefreshToken)
                Storage.setItem('ACCESS_TOKEN', accessToken)

                // Обновляем заголовок авторизации
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                // Обрабатываем очередь запросов
                processQueue(null, accessToken);

                // Повторяем оригинальный запрос
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Если refresh token невалидный, очищаем токены и перенаправляем на логин
                processQueue(refreshError as Error, null);
                Storage.removeItem('REFRESH_TOKEN')
                Storage.removeItem('ACCESS_TOKEN')

                // Перенаправляем на страницу логина
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;