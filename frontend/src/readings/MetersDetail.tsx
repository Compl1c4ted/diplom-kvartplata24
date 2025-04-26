import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReadingServiceAPI from './ReadingAPI';
import TariffServiceAPI from '../tarrifs/TariffAPI';

const MetersDetail: React.FC = () => {
  const { meterId } = useParams<{ meterId: string }>();
  const navigate = useNavigate();
  const [currentValue, setCurrentValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastReading, setLastReading] = useState<any>(null);
  const [tariff, setTariff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Загружаем последние показания и тариф при загрузке страницы
  useEffect(() => {
    if (!meterId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем последние показания
        const readingResult = await ReadingServiceAPI.getLastReading(meterId);
        if (readingResult.status === 'success') {
          setLastReading(readingResult.data?.last_reading || null);
        } else {
          setError(readingResult.message || 'Ошибка загрузки последних показаний');
        }

        // Загружаем тариф (предполагаем, что есть endpoint для получения тарифа по meterId)
        const tariffResult = await TariffServiceAPI.getTariffByMeter(meterId);
        if (tariffResult.status === 'success') {
          setTariff(tariffResult.data);
        }

      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meterId || isNaN(Number(meterId))) {
      setError('Неверный ID счетчика');
      return;
    }

    if (!currentValue) {
      setError('Введите текущие показания');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await ReadingServiceAPI.addReading({
        meter_id: Number(meterId),
        current_value: Number(currentValue),
        tariff: tariff?.rate || 0 // Используем тариф если он есть
      });

      if (result.status === 'success') {
        setSuccess('Показания успешно отправлены');
        setCurrentValue('');
        // Обновляем последние показания
        const newReadingResult = await ReadingServiceAPI.getLastReading(meterId);
        if (newReadingResult.status === 'success') {
          setLastReading(newReadingResult.data?.last_reading || null);
        }
      } else {
        setError(result.message || 'Ошибка при отправке показаний');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке данных');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция для расчета суммы (если нужно)
  const calculateAmount = () => {
    if (!lastReading || !tariff) return null;
    const consumption = lastReading.current_value - (lastReading.previous_value || 0);
    return (consumption * tariff.rate).toFixed(2);
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        &larr; Назад
      </button>

      <h1 className="text-xl font-bold mb-4">Передать показания</h1>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}

      {lastReading && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-bold mb-2">Последние показания</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-semibold">Текущие:</p>
              <p>{lastReading.current_value}</p>
            </div>
            <div>
              <p className="font-semibold">Предыдущие:</p>
              <p>{lastReading.previous_value || 'Нет данных'}</p>
            </div>
            <div>
              <p className="font-semibold">Дата подачи:</p>
              <p>{new Date(lastReading.updated_at).toLocaleString()}</p>
            </div>
            {tariff && (
              <>
                <div>
                  <p className="font-semibold">Тариф:</p>
                  <p>{tariff.rate} ₽/{tariff.unit || 'ед.'}</p>
                </div>
                {calculateAmount() && (
                  <div>
                    <p className="font-semibold">Сумма:</p>
                    <p>{calculateAmount()} ₽</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Текущие показания:</label>
          <input
            type="number"
            step="0.001"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить показания'}
        </button>
      </form>
    </div>
  );
};

export default MetersDetail;