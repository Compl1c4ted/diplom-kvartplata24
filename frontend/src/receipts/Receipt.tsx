import { useState, useEffect } from 'react';
import ReceiptServiceAPI from './ReceiptAPI';
import PropertyServiceAPI from '../properties/PropertyAPI';

interface Property {
  id: number;
  address: string;
  account_number: string;
}

interface Receipt {
  id: number;
  transaction_number: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  updated_at: string;
  created_at: string;
}

export const ReceiptsPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState({
    properties: true,
    receipts: false
  });
  const [error, setError] = useState<string | null>(null);

  // Загрузка объектов недвижимости
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await PropertyServiceAPI.getProperties();
        
        if (response.status === 'success') {
          setProperties(response.data || []);
          if (response.data?.length) {
            setSelectedPropertyId(response.data[0].id);
          }
        } else {
          setError(response.message || 'Ошибка загрузки объектов');
        }
      } catch (e) {
        setError('Ошибка соединения');
      } finally {
        setLoading(prev => ({ ...prev, properties: false }));
      }
    };

    loadProperties();
  }, []);

  // Загрузка квитанций с валидацией данных
  useEffect(() => {
    if (!selectedPropertyId) return;

    const loadReceipts = async () => {
      setLoading(prev => ({ ...prev, receipts: true }));
      setError(null);
      
      try {
        const response = await ReceiptServiceAPI.getReceiptsByProperty(selectedPropertyId);
        
        if (response.status === 'success') {
          // Валидация и нормализация данных
          const validatedReceipts = (response.data || []).map(receipt => ({
            ...receipt,
            amount: Number(receipt.amount) || 0
          }));
          setReceipts(validatedReceipts);
        } else {
          setError(response.message || 'Ошибка загрузки квитанций');
        }
      } catch (e) {
        setError('Ошибка соединения');
      } finally {
        setLoading(prev => ({ ...prev, receipts: false }));
      }
    };

    loadReceipts();
  }, [selectedPropertyId]);

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString; // Возвращаем исходную строку, если не удалось распарсить
    }
  };

  // Стили для статусов
  const statusStyles = {
    pending: {
      bg: 'bg-orange-500',
      text: 'text-white',
      label: 'Ожидает оплаты'
    },
    paid: {
      bg: 'bg-green-500',
      text: 'text-white',
      label: 'Оплачено'
    },
    overdue: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: 'Просрочено'
    }
  };

  const handleDownloadPdf = async (receiptId: number) => {
    try {
      const response = await ReceiptServiceAPI.downloadReceiptPDF(receiptId);
      
      if (response.status === 'success' && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${receiptId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError('Ошибка при скачивании PDF');
    }
  };

  if (loading.properties) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Загрузка объектов недвижимости...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-sm ml-4"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="alert alert-info max-w-md mx-auto mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>У вас нет объектов недвижимости</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Мои квитанции</h1>
      
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold mb-3 text-gray-700">Выберите объект:</label>
        <select
          value={selectedPropertyId || ''}
          onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
          className="select select-bordered w-full max-w-md bg-white border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary"
        >
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.address} (ЛС: {property.account_number})
            </option>
          ))}
        </select>
      </div>

      {selectedPropertyId && (
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Квитанции для выбранного объекта
            {loading.receipts && (
              <span className="loading loading-spinner loading-sm ml-2"></span>
            )}
          </h2>
          
          {receipts.length === 0 ? (
            <div className="alert alert-info shadow-lg max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Нет квитанций для этого объекта</span>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {receipts.map(receipt => {
                const status = statusStyles[receipt.status];
                
                return (
                  <div 
                    key={receipt.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Квитанция #{receipt.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-600">Номер:</span>
                          <span className="font-medium text-gray-800">{receipt.transaction_number}</span>
                        </div>
                        
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-600">Сумма:</span>
                          <span className="font-bold text-lg text-gray-800">
                            {formatAmount(receipt.amount)} ₽
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Период:</span>
                          <span className="text-gray-800">
                            {formatDate(receipt.created_at)} — {formatDate(receipt.updated_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleDownloadPdf(receipt.id)}
                          className={`btn btn-sm ${
                            receipt.status === 'paid' 
                              ? 'btn-primary bg-primary hover:bg-primary-dark' 
                              : 'btn-disabled bg-gray-200 text-gray-500'
                          }`}
                          disabled={receipt.status !== 'paid'}
                        >
                          Скачать PDF
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};