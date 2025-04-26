import apiClient from '../core/apiClient';
import { getAuthHeader } from '../core/apiUtils';

interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

interface Tariff {
  id: number;
  name: string;
  rate: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

class TariffServiceAPI {
  /**
   * Получить список всех тарифов
   */
  static async getTariffs(): Promise<ApiResponse<Tariff[]>> {
    try {
      const response = await apiClient.get('/tariffs/', {
        headers: getAuthHeader()
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Ошибка при получении тарифов:', error);
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Ошибка при получении тарифов'
      };
    }
  }

  /**
   * Создать новый тариф
   */
  static async createTariff(data: {
    name: string;
    rate: number;
    description?: string;
  }): Promise<ApiResponse<Tariff>> {
    try {
      const response = await apiClient.post('/tariffs/', data, {
        headers: getAuthHeader()
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Ошибка при создании тарифа:', error);
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Ошибка при создании тарифа'
      };
    }
  }

  /**
   * Обновить существующий тариф
   */
  static async updateTariff(
    tariffId: number,
    data: {
      name?: string;
      rate?: number;
      description?: string;
    }
  ): Promise<ApiResponse<Tariff>> {
    try {
      const response = await apiClient.put(`/tariffs/${tariffId}`, data, {
        headers: getAuthHeader()
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Ошибка при обновлении тарифа:', error);
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Ошибка при обновлении тарифа'
      };
    }
  }

  /**
   * Удалить тариф
   */
  static async deleteTariff(tariffId: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/tariffs/${tariffId}`, {
        headers: getAuthHeader()
      });
      
      return {
        status: 'success'
      };
    } catch (error: any) {
      console.error('Ошибка при удалении тарифа:', error);
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Ошибка при удалении тарифа'
      };
    }
  }
  static async getTariffByMeter(meterId: string): Promise<ApiResponse<{
    id: number;
    rate: number;
    name: string;
    unit: string;
  }>> {
    try {
      const response = await apiClient.get(`/tariffs/meter/${meterId}`, {
        headers: getAuthHeader()
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Ошибка при получении тарифа:', error);
      return {
        status: 'error',
        message: error.response?.data?.detail || 'Ошибка при получении тарифа'
      };
    }
  }
}

export default TariffServiceAPI;
export type { Tariff };