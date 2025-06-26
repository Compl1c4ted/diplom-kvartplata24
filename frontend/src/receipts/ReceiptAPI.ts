import { getAuthHeader } from "../core/apiUtils";
import apiClient from "../core/apiClient";

interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
  }

interface Receipt {
    id: number
    transaction_number: string
    transaction_date: string
    amount: number
    status: 'pending' | 'paid' | 'overdue'
    period_start: string
    period_end: string
    due_date: string
    property_id: number
  }

// interface CreateReceiptData {
//     property_id: number;
//     amount: number;
//     period_start: string;
//     period_end: string;
//     due_date: string;
//   }

class ReceiptServiceAPI {
  static async getReceiptsByProperty(propertyId: number): Promise<ApiResponse<Receipt[]>> {
    try {
        console.log('Зашли в трай')
        const response = await apiClient.get(
            `/receipts/property/${propertyId}`,
            { headers: getAuthHeader()
        })
        console.log(`Ответ: ${response}`)
        return {
            status: 'success',
            data: response.data
        }
    } catch (error: any) {
        return {
            status: 'error',
            message: error.response?.data?.detail || 'Failed to load receipts'
        }
    }
  }

  static async getAllUserReceipts(): Promise<ApiResponse<Receipt[]>> {
    try {
        const response = await apiClient.get(
            `/receipts/all-receipts/`,
            {headers: getAuthHeader()
        })
        return {
            status: 'success',
            data: response.data
        }
    } catch (error: any) {
        console.error('Error fetching receipts:', error)
        return {
            status: 'error',
            message: error.response?.data?.detail ||
                    'Failed to load receipts'
        }
    }
  }

  static async downloadReceiptPDF(receiptId: number): Promise<ApiResponse<Blob>> {
    try {
        const response = await apiClient.get(
            `/receipts/${receiptId}/pdf`,
            {
                responseType: 'blob',
                headers: getAuthHeader()
        })
        return {
            status: 'success',
            data: response.data
        }
    } catch (error: any) {
        return {
            status: 'error',
            message: error.response?.data?.detail || 'Failed to download PDF'
        }
    }
  }
}

export default ReceiptServiceAPI