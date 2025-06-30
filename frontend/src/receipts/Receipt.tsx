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
  amount: number | string; // Разрешаем оба типа
  status: 'pending' | 'paid' | 'overdue';
  period_start: string;
  period_end: string;
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

  // Защищенное форматирование суммы
  const formatAmount = (amount: unknown): string => {
    try {
      const num = typeof amount === 'number' 
        ? amount 
        : typeof amount === 'string'
          ? parseFloat(amount.replace(',', '.'))
          : Number(amount);
      
      return isNaN(num) ? '0.00' : num.toFixed(2);
    } catch {
      return '0.00';
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    } catch {
      return 'Некорректная дата';
    }
  };

  // Стили для статусов
  const statusStyles = {
    pending: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      badge: 'badge-warning',
      label: 'Ожидает оплаты'
    },
    paid: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'badge-success',
      label: 'Оплачено'
    },
    overdue: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'badge-error',
      label: 'Просрочено'
    }
  };

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
            amount: typeof receipt.amount === 'number' ? receipt.amount : 0
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
      <h1 className="text-3xl font-bold mb-6 text-primary">Мои квитанции</h1>
      
      <div className="mb-8 bg-base-200 p-4 rounded-lg">
        <label className="block text-lg font-semibold mb-2 text-base-content">Выберите объект:</label>
        <select
          value={selectedPropertyId || ''}
          onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
          className="select select-bordered w-full max-w-xs bg-white"
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
          <h2 className="text-xl font-semibold mb-4 text-base-content">
            Квитанции для выбранного объекта
            {loading.receipts && (
              <span className="loading loading-spinner loading-sm ml-2"></span>
            )}
          </h2>
          
          {receipts.length === 0 ? (
            <div className="alert alert-info shadow-lg">
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
                    className={`card shadow-lg ${status.bg} ${status.text} hover:shadow-xl transition-shadow`}
                  >
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <h3 className="card-title text-lg">Квитанция #{receipt.id}</h3>
                        <span className={`badge ${status.badge} text-white`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="divider my-2"></div>
                      
                      <div className="space-y-2">
                        <p>
                          <span className="font-bold">Номер:</span> 
                          <span className="ml-2 font-mono">{receipt.transaction_number}</span>
                        </p>
                        <p>
                          <span className="font-bold">Сумма:</span> 
                          <span className="ml-2 font-mono text-lg font-bold">
                            {formatAmount(receipt.amount)} ₽
                          </span>
                        </p>
                        <p>
                          <span className="font-bold">Период:</span> 
                          <span className="ml-2">
                            {formatDate(receipt.period_start)} — {formatDate(receipt.period_end)}
                          </span>
                        </p>
                      </div>
                      
                      <div className="card-actions justify-end mt-4">
                        <button
                          onClick={() => handleDownloadPdf(receipt.id)}
                          className={`btn btn-sm ${
                            receipt.status === 'paid' ? 'btn-primary' : 'btn-ghost'
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