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

  // Загружаем список объектов недвижимости
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await PropertyServiceAPI.getProperties();
        
        if (response.status === 'success') {
          setProperties(response.data || []);
          // Автоматически выбираем первый объект, если есть
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

  // Загружаем квитанции при изменении выбранного объекта
  useEffect(() => {
    if (!selectedPropertyId) return;

    const loadReceipts = async () => {
      setLoading(prev => ({ ...prev, receipts: true }));
      setError(null);
      
      try {
        const response = await ReceiptServiceAPI.getReceiptsByProperty(selectedPropertyId);
        
        if (response.status === 'success') {
          setReceipts(response.data || []);
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
    <div className="container mx-auto p-4 pb-20"> {/* Добавлен отступ снизу */}
      <h1 className="text-2xl font-bold mb-6">Мои квитанции</h1>
      
      {/* Выбор объекта недвижимости - теперь select вместо карточек */}
      <div className="mb-8">
        <label className="block text-lg font-semibold mb-2">Выберите объект:</label>
        <select
          value={selectedPropertyId || ''}
          onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
          className="select select-bordered w-full max-w-xs"
        >
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.address} (ЛС: {property.account_number})
            </option>
          ))}
        </select>
      </div>

      {/* Список квитанций */}
      {selectedPropertyId && (
        <div className="mb-16"> {/* Добавлен отступ снизу */}
          <h2 className="text-lg font-semibold mb-4">
            Квитанции для выбранного объекта
            {loading.receipts && (
              <span className="loading loading-spinner loading-sm ml-2"></span>
            )}
          </h2>
          
          {receipts.length === 0 ? (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Нет квитанций для этого объекта</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {receipts.map(receipt => (
                <div key={receipt.id} className="card bg-base-100 shadow">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title">Квитанция #{receipt.id}</h3>
                      <span className={`badge ${
                        receipt.status === 'paid' ? 'badge-success' : 
                        receipt.status === 'overdue' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {receipt.status === 'paid' ? 'Оплачено' : 
                         receipt.status === 'overdue' ? 'Просрочено' : 'Ожидает оплаты'}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Номер:</span> {receipt.transaction_number}</p>
                      <p><span className="font-medium">Сумма:</span> {receipt.amount} ₽</p>
                      <p><span className="font-medium">Период:</span> {receipt.period_start} - {receipt.period_end}</p>
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                      <button
                        onClick={() => handleDownloadPdf(receipt.id)}
                        className={`btn btn-sm ${
                          receipt.status === 'paid' ? 'btn-primary' : 'btn-disabled'
                        }`}
                        disabled={receipt.status !== 'paid'}
                      >
                        Скачать PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};