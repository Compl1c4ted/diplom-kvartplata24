import apiClient from '../core/apiClient';
import { getAuthHeader } from '../core/apiUtils';
// import MetersDetail from './MetersDetail';


// const API_URL = `http://127.0.0.1:8000`

interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
}

interface Meter {
    id: number;
    property_id: number;
    type: string;
    meter_number: string;
  }


class ReadingServiceAPI {
    // Добавление счетчика для объекта недвижимости
    static async addMeter(data: {
        property_id: number;
        type: string;
        meter_number: string;
      }): Promise<ApiResponse<Meter>> {  // Указали конкретный тип возвращаемых данных
        try {
          const response = await apiClient.post('/meters/add-meter', data, {
            headers: getAuthHeader()
          });
          
          console.log('Meter added:', response.data); // Логирование ответа
          
          return {
            status: 'success',
            data: response.data
          };
        } catch (error: any) {
          console.error('Add meter error:', error.response?.data || error.message);
          return {
            status: 'error',
            message: error.response?.data?.detail || 'Ошибка при добавлении счетчика'
          };
        }
      }
    // Получить счетчики по id недивжимости
    static async getMetersByProperty(property_id: string): Promise<ApiResponse<{meters: Meter[]}>> {
        if (!property_id) {
            return {
                status: 'error',
                message: 'Property ID is required',
                data: { meters: [] }
            };
        }
        
        try {
            const response = await apiClient.get(
                `/meters/${property_id}/meters/`,
                { headers: getAuthHeader() }
            );
            
            // Убедимся, что response.data содержит meters массив
            const metersData = response.data?.meters || [];
            const metersArray = Array.isArray(metersData) ? metersData : [];
            
            return {
                status: 'success',
                data: {
                    meters: metersArray
                },
            };
        }
        catch (error: any) {
            console.error('Ошибка при получении счетчиков:', error);
            return {
                status: 'error',
                message: error.message || 'Ошибка при получении счетчиков',
                data: { meters: [] }
            };
        }
    }
    // Отправка показаний счетчика
    static async addReading(data: {
        meter_id: number,
        current_value: number,
        tariff: number,
    }): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.post(
                '/readings/add-reading/',
                data,
                { headers: getAuthHeader()}
            )
            return {
                status: 'success',
                data: response.data,
            }
        }
        catch (error: any) {
            console.error('Ошибка при отправке показаний', error.response?.data)
            return {
                status: 'error',
                message: 'Ошибка при отправке показаний'
            }
        }
    }
    // Получение последних учетов показаний
    static async getLastReading(meterId: string): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.get(
                `/readings/meters/${meterId}/last-reading`,
                {headers: getAuthHeader()}
            )
            return {
                status: 'success',
                data: response.data
            }
        }
        catch (error: any) {
            console.error('Ошибка при получении последнего показания:', error.response?.data)
            return {
                status: 'error',
                message: 'Ошибка при получении последнего показания'
            }
        }
    }
}

export default ReadingServiceAPI