import { getAuthHeader } from '../core/apiUtils';
import apiClient from '../core/apiClient';

// const API_URL = `http://127.0.0.1:8000`

interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
}

interface User {
    id: number;
    email: string,
    hashed_password: string
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

class UserServiceAPI {

    static async register(email: string, hashed_password: string): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.post(
                `/user/register`,
                { email, hashed_password },
            )
            return {
                status: 'success',
                data: response.data,
            }
        }
        catch (error: any) {
            console.error('Ошибка при регистрации:', error.response?.data)
            return {
                status: 'error',
                message: 'Ошибка регистрации'
            }
        }
    } 

    // Авториизация пользователя
    static async login(email: string, hashed_password: string): Promise<ApiResponse<LoginResponse>> {
        try {
            const response = await apiClient.post(
                `/user/login`, // URL
                { email, hashed_password }, // data
            )
            console.log('Ответ с сервера: ', response.data)
            
            if (response.status == 200 && (response.data.access_token && response.data.refresh_token)) {
                return {
                    status: 'success',
                    data: {
                        access_token: response.data.access_token,
                        refresh_token: response.data.refresh_token,
                        token_type: response.data.token_type,
                    },
                };
            }
            return {
                status: 'error',
                message: 'Неверный ответ с сервера',
            }
        }
        catch (error: any) {
            console.error('Ошибка при логине:', error.response.data)
            return {
                status: 'error',
                message: 'Ошибка авторизации'
            }
        }
    }
    // Создание рефреш токена
    private static async refreshAuthToken(): Promise<boolean> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) return false;
    
            const response = await apiClient.post(
                `/user/refresh-token`,
                {refresh_token: refreshToken}
            );
            
            // Исправлено: используем правильный ключ
            localStorage.setItem('access_token', response.data.access_token);
            return true;
        }
        catch (error) {
            console.error('Ошибка обновления токена:', error);
            return false;
        }
    }
}

export default UserServiceAPI