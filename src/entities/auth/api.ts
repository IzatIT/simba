import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import type { LoginResult, AdminUser } from '../../shared/api/types.ts';

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// После axios-интерцептора response.data уже без конверта { success, data }
export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResult> => {
        const { email, password } = credentials;
        const response = await apiClient.post<LoginResult>(Path.Auth.Login, { email, password });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post(Path.Auth.Logout);
    },

    getCurrentUser: async (): Promise<AdminUser> => {
        const response = await apiClient.get<{data: AdminUser}>(Path.Auth.Me);
        return response.data.data;
    },
};
