import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

interface Property {
  id: number;
  address: string;
  account_number: string;
  // другие поля, если есть
}

interface Receipt {
  id: number;
  transaction_number: string;
  transaction_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  period_start: string;
  period_end: string;
  due_date: string;
  property_id: number;
}

interface CreateReceiptData {
  property_id: number;
  amount: number;
  period_start: string;
  period_end: string;
  due_date: string;
}

class ApiService {
  // constructor() {
  //   axios.interceptors.response.use(
  //     response => response,
  //     async error => {
  //       const originalRequest = error.config;
        
  //       if (error.response?.status === 401 && !originalRequest._retry) {
  //         originalRequest._retry = true;
          
  //         const refreshed = await this.refreshAuthToken();
  //         if (refreshed) {
  //           originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  //           return axios(originalRequest);
  //         }
  //       }
        
  //       if (error.response?.status === 401) {
  //         this.handleAuthError(error);
  //       }
        
  //       return Promise.reject(error);
  //     }
  //   );
  // }

  // private static getAuthHeader() {
  //   const token = localStorage.getItem('token');
  //   return token ? { Authorization: `Bearer ${token}` } : {};
  // }
  // рефактор
  // static async login(email: string, hashed_password: string): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.post(`${API_URL}/user/login`, { email, hashed_password });
  //     console.log('Ответ с сервера:', response.data);

  //     if (response.status === 200 && response.data.access_token) {
  //       return {
  //         status: 'success',
  //         data: {
  //           token: response.data.access_token,
  //         },
  //       };
  //     }
  //     return { status: 'error', message: 'Неверный ответ с сервера' };
  //   } catch (error: any) {
  //     console.error('Ошибка при логине:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка авторизации' };
  //   }
  // }
  // // рефактор
  // static async register(email: string, hashed_password: string): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.post(`${API_URL}/user/register`, { email, hashed_password });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка при регистрации:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка регистрации' };
  //   }
  // }
  // // Рефактор
  // static async getProperties(): Promise<ApiResponse<Property[]>> {
  //   try {
  //     const response = await axios.get(`${API_URL}/property/my-properties/`, {
  //       headers: this.getAuthHeader(),
  //     });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка получения объектов:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка получения объектов' };
  //   }
  // }
  // // Рефактор
  // static async getPropertyById(id: string): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.get(`${API_URL}/property/${id}/`, {
  //       headers: this.getAuthHeader(),
  //     });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка получения объекта:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка получения объекта' };
  //   }
  // }
  // // Рефактор
  // static async addProperty(address: string, inn_uk: string, account_number: string): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.post(
  //       `${API_URL}/property/create-property`,
  //       { address, inn_uk, account_number },
  //       { headers: this.getAuthHeader() }
  //     );
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка добавления объекта:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка добавления объекта' };
  //   }
  // }

  // static async addMeter(data: {
  //   property_id: number;
  //   type: string;
  //   meter_number: string;
  // }): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.post(`${API_URL}/readings/add-meter/`, data, {
  //       headers: this.getAuthHeader(),
  //     });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка при добавлении счетчика:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка при добавлении счетчика' };
  //   }
  // }

  // static async getMetersByProperty(propertyId: string): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.get(`${API_URL}/readings/${propertyId}/meters/`, {
  //       headers: this.getAuthHeader(),
  //     });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка при получении счетчиков:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка при получении счетчиков' };
  //   }
  // }

  // static async addReading(data: {
  //   meter_id: number;
  //   current_value: number;
  //   tariff: number;
  // }): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.post(`${API_URL}/readings/add-reading/`, data, {
  //       headers: this.getAuthHeader(),
  //     });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка при отправке показаний:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка при отправке показаний' };
  //   }
  // }

  // static async getLastReading(meterId: string): Promise<ApiResponse<any>> {
  //   try {
  //     const response = await axios.get(`${API_URL}/readings/meters/${meterId}/last-reading/`, {
  //       headers: this.getAuthHeader(),
  //     });
  //     return { status: 'success', data: response.data };
  //   } catch (error: any) {
  //     console.error('Ошибка при получении последнего показания:', error.response?.data);
  //     return { status: 'error', message: 'Ошибка при получении последнего показания' };
  //   }
  // }

  static async downloadReceiptPdf(receiptId: number): Promise<ApiResponse<Blob>> {
    try {
      const response = await axios.get(`${API_URL}/receipts/${receiptId}/pdf`, {
        responseType: 'blob',
        headers: this.getAuthHeader()
      });
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Failed to download PDF'
      };
    }
  }

  static async getAllUserReceipts(): Promise<ApiResponse<Receipt[]>> {
    try {
      const response = await axios.get(`${API_URL}/receipts/all-receipts/`, {
        headers: this.getAuthHeader()
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      return {
        status: 'error',
        message: error.response?.data?.detail || 
               'Failed to load receipts'
      };
    }
  }

  // static async getUserProperties(): Promise<ApiResponse<Property[]>> {
  //   try {
  //     const response = await this.requestWithRetry({
  //       url: `${API_URL}/property/my-properties/`,
  //       method: 'get',
  //       headers: this.getAuthHeader()
  //     });
  //     return {
  //       status: 'success',
  //       data: response.data
  //     };
  //   } catch (error: any) {
  //     this.handleAuthError(error)
  //     return {
  //       status: 'error',
  //       message: error.response?.data?.detail || 'Failed to load properties'
  //     };
  //   }
  // }

  static async getReceiptsByProperty(propertyId: number): Promise<ApiResponse<Receipt[]>> {
    try {
      const response = await axios.get(`${API_URL}/receipts/property/${propertyId}`, {
        headers: this.getAuthHeader()
      });
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Failed to load receipts'
      };
    }
  }

  // constructor() {
  //   axios.interceptors.response.use(
  //     response => response,
  //     error => {
  //       if (error.response?.status === 401) {
  //         localStorage.removeItem('token');
  //         window.location.href = '/login';
  //       }
  //       return Promise.reject(error);
  //     }
  //   );
  // }

  // private static handleAuthError(error: any) {
  //   if (error.response?.status === 401) {
  //     localStorage.removeItem('token');
  //     window.location.href = '/login';
  //   }
  //   return error;
  // }

  // private static async refreshAuthToken(): Promise<boolean> {
  //   try {
  //     const refreshToken = localStorage.getItem('refresh_token');
  //     if (!refreshToken) return false;

  //     const response = await axios.post(`${API_URL}/user/refresh-token`, { 
  //       refresh_token: refreshToken 
  //     });

  //     localStorage.setItem('token', response.data.access_token);
  //     return true;
  //   } catch (error) {
  //     console.error('Ошибка обновления токена:', error);
  //     return false;
  //   }
  // }

  // private static async requestWithRetry(config: AxiosRequestConfig): Promise<any> {
  //   try {
  //     return await axios(config);
  //   } catch (error: any) {
  //     if (error.response?.status === 401 && !config._retry) {
  //       // Пробуем обновить токен
  //       const refreshed = await this.refreshAuthToken();
  //       if (refreshed) {
  //         // Повторяем оригинальный запрос
  //         const newConfig = {
  //           ...config,
  //           _retry: true,
  //           headers: {
  //             ...config.headers,
  //             Authorization: `Bearer ${localStorage.getItem('token')}`
  //           }
  //         };
  //         return axios(newConfig);
  //       }
  //     }
  //     throw error;
  //   }
  // }

}

export default ApiService;