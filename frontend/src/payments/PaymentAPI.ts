import { getAuthHeader } from '../core/apiUtils';
import apiClient from '../core/apiClient';

interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
}

export interface Property {
    id: number;
    account_number: string;
    address: string;
    // Другие поля свойства, если они есть
}

export interface Receipt {
    id: number;
    transaction_number: string;
    transaction_date: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    property_id: number;
    // Другие поля квитанции, если они есть
}

class PaymentApi {
    /**
     * Получение всех недвижимостей пользователя
     * Использует endpoint: GET /property/my-properties/
     */
    static async getPropertiesWithUnpaidReceipts(): Promise<ApiResponse<Property[]>> {
        try {
            const response = await apiClient.get(
                '/property/my-properties/', // Используем правильный endpoint
                { headers: getAuthHeader() }
            );
            
            console.log('Properties response:', response.data); // Для отладки
            
            return {
                status: 'success',
                data: response.data || []
            };
        } catch (error: any) {
            console.error('Error fetching properties:', error);
            return {
                status: 'error',
                message: error.response?.data?.message || 'Failed to load properties',
                data: []
            };
        }
    }

    /**
     * Получение неоплаченных квитанций для всех недвижимостей
     * Использует endpoint: GET /receipts/unpaid-receipts/
     */
    static async getAllUnpaidReceipts(): Promise<ApiResponse<Receipt[]>> {
        try {
            const response = await apiClient.get(
                '/receipts/unpaid-receipts/',
                { headers: getAuthHeader() }
            );
            return {
                status: 'success',
                data: response.data
            };
        } catch (error: any) {
            console.error('Error fetching all unpaid receipts:', error);
            return {
                status: 'error',
                message: error.response?.data?.message || 'Failed to load unpaid receipts',
                data: []
            };
        }
    }

    /**
     * Получение неоплаченных квитанций для конкретной недвижимости
     * Использует endpoint: GET /receipts/property/{property_id}
     */
    static async getUnpaidReceipts(propertyId: number): Promise<ApiResponse<Receipt[]>> {
        try {
            const response = await apiClient.get(
                `/receipts/property/${propertyId}`,
                { headers: getAuthHeader() }
            );
            
            // Фильтруем только неоплаченные квитанции
            const unpaidReceipts = response.data.filter((receipt: Receipt) => receipt.status !== 'paid');
            
            return {
                status: 'success',
                data: unpaidReceipts
            };
        } catch (error: any) {
            console.error('Error fetching receipts:', error);
            return {
                status: 'error',
                message: error.response?.data?.message || 'Failed to load receipts',
                data: []
            };
        }
    }

    /**
     * Оплата квитанций
     * Использует endpoint: POST /receipts/pay/
     */
    static async payReceipt(receiptId: number, paymentMethod: 'sbp' | 'card'): Promise<ApiResponse<{
        success: boolean;
        message?: string;
        receipt?: Receipt;
    }>> {
        try {
            const response = await apiClient.post(
                '/receipts/pay/',
                {
                    receipt_id: receiptId // Отправляем один receipt_id
                },
                { 
                    headers: getAuthHeader(),
                    params: {
                        payment_method: paymentMethod // Добавляем метод оплаты как query параметр
                    }
                }
            );
            
            return {
                status: 'success',
                data: response.data
            };
        } catch (error: any) {
            console.error('Payment error:', error);
            return {
                status: 'error',
                message: error.response?.data?.message || 'Payment failed'
            };
        }
    }
}

export default PaymentApi;