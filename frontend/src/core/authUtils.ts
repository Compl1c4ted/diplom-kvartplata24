import axios, {AxiosRequestConfig} from "axios";
import apiClient from "./apiClient";

// export const refreshAuthToken = async (): Promise<Boolean> => {
//     try {
//         const refreshToken = localStorage.getItem('refresh_token')
//         if (!refreshToken) return false

//         const response = await axios.post(`${apiClient}/user/refresh-token`, {
//             refresh_token: refreshToken
//         });
//         localStorage.setItem('token', response.data.access_token)
//         return true
//     }
//     catch (error) {
//         console.error('Token refresh failed', error)
//         return false
//     }
// }

// export const requestWithRetry = async (config: AxiosRequestConfig): Promise<any> => {
//     try {
//       return await axios(config);
//     } catch (error: any) {
//       if (error.response?.status === 401 && !config._retry) {
//         const refreshed = await refreshAuthToken();
//         if (refreshed) {
//           const newConfig = {
//             ...config,
//             _retry: true,
//             headers: {
//               ...config.headers,
//               Authorization: `Bearer ${localStorage.getItem('token')}`
//             }
//           };
//           return axios(newConfig);
//         }
//       }
//       throw error;
//     }
//   };

// export const getAuthHeader = () => {
//     const token = localStorage.getItem('token');
//     return token ? {
//         Authorization: `Bearer ${token}`
//     } : {};
// }

// Обработчик ошибки аутентификации
export const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }
    return error
}


