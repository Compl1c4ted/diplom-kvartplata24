import { getAuthHeader } from '../core/apiUtils';
import apiClient from '../core/apiClient';


// const API_URL = `http://127.0.0.1:8000`

interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
}

export interface PropertyInterface {
    id: number;
    address: string;
    inn_uk: string;
    account_number: string;
    unpaid_receipts_count?: number;
}

class PropertyServiceAPI {
    // Добавление объекта недвижимости
    static async addProperty(data: {
        address: string;
        inn_uk: string;
        account_number: string;
      }): Promise<ApiResponse<any>> {
        try {
          const response = await apiClient.post(
            '/property/create-property',
            data,
            { headers: getAuthHeader() }
          );
          return { status: 'success', data: response.data };
        } catch (error) {
          console.error('Add property error:', error);
          return { status: 'error', message: 'Failed to add property' };
        }
      }

    // Получение всех объектов недвижимости
    static async getProperties(): Promise<ApiResponse<PropertyInterface[]>> {
        try {
            const response = await apiClient.get(
                '/property/my-properties/',
                {
                    headers: getAuthHeader(),
            })
            const properties = response.data.properties || []

            return {
                status: 'success',
                data: properties
            }
        }
        catch (error: any) {
            console.error('Ошибка получения объектов:', error.response?.data)
            return {
                status: 'error',
                message: 'Ошибка получения объектов',
                data: []
            }
        }
    }
    // Получение объекта недвижимости по id
    static async getPropertyById(id: string): Promise<ApiResponse<PropertyInterface>> {
        try {
          const response = await apiClient.get(`/property/${id}`, {
            headers: getAuthHeader(),
          });
          
          return {
            status: 'success',
            data: response.data
          };
        } catch (error: any) {
          console.error(`Ошибка получения объекта ${id}:`, error);
          return {
            status: 'error',
            message: error.response?.data?.detail || 'Ошибка при получении объекта'
          };
        }
      }
      static async getPropertiesWithUnpaidReceipts(): Promise<ApiResponse<PropertyInterface[]>> {
        try {
          const response = await apiClient.get(
            '/property/with-unpaid-receipts/',
            {headers: getAuthHeader() }
          );
          return {
            status: 'success',
            data: response.data
          };
        } catch (error: any) {
          console.error('Ошибка получения объектов с квитанциями:', error.response?.data)
          return {
            status: 'error',
            message: 'Ошибка получения данных',
            data: []
          }
        }
      }
    // Временно
    // static async getUserProperties(): Promise<ApiResponse<Property[]>> {
    //     try {
    //       const response = await this.requestWithRetry({
    //         url: `${API_URL}/property/my-properties/`,
    //         method: 'get',
    //         headers: getAuthHeader()
    //       });
    //       return {
    //         status: 'success',
    //         data: response.data
    //       };
    //     } catch (error: any) {
    //       handleAuthError(error)
    //       return {
    //         status: 'error',
    //         message: error.response?.data?.detail || 'Failed to load properties'
    //       };
    //     }
    //   }
}

export default PropertyServiceAPI