// api/authService.ts

import apiClient from "../../shared/api/api.ts";

export interface LoginCredentials {
    login: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

interface LogoutResponse {
    message: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
        return response.data;
    },

    logout: async (): Promise<LogoutResponse> => {
        const response = await apiClient.post<LogoutResponse>('/auth/logout');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};