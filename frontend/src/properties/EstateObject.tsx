import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyServiceAPI from './PropertyAPI';
import ReadingServiceAPI from '../readings/ReadingAPI';

interface Property {
  id: number;
  address: string;
  account_number: string;
}

interface Meter {
  id: number;
  type: string;
  meter_number: string;
  property_id: number;
}

export const EstateObjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMeterModal, setShowAddMeterModal] = useState(false);
  const [meterType, setMeterType] = useState<string>('');
  const [meterNumber, setMeterNumber] = useState('');
  const [meters, setMeters] = useState<Meter[]>([]);
  const navigate = useNavigate();

  const meterTypeToLabel: Record<string, string> = {
    cold_water: 'Холодная вода',
    hot_water: 'Горячая вода',
    electricity_day: 'Электричество день',
    electricity_night: 'Электричество ночь'
  };

  const fetchData = async () => {
    if (!id) {
      setError('ID недвижимости не указан');
      setIsLoading(false);
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Загружаем данные объекта недвижимости
      const propertyResult = await PropertyServiceAPI.getPropertyById(id);
      
      if (propertyResult.status !== 'success' || !propertyResult.data) {
        throw new Error(propertyResult.message || 'Объект не найден');
      }
      
      setProperty(propertyResult.data);

      // 2. Загружаем счетчики для объекта
      const metersResult = await ReadingServiceAPI.getMetersByProperty(id);
      
      if (metersResult.status === 'success') {
        // Убедимся, что meters - это массив
        const metersArray = Array.isArray(metersResult.data?.meters) 
          ? metersResult.data.meters 
          : [];
        setMeters(metersArray);
      } else {
        console.error(metersResult.message);
        setMeters([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке данных';
      setError(errorMessage);
      
      // Перенаправляем на страницу входа если ошибка аутентификации
      if (errorMessage.includes('authentication')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddMeter = async () => {
    if (!meterType || !meterNumber || !id) {
      setError('Заполните все поля');
      return;
    }
  
    try {
      setError(null);
      const result = await ReadingServiceAPI.addMeter({
        property_id: Number(id),
        type: meterType,
        meter_number: meterNumber,
      });
  
      if (result.status === 'success' && result.data) {
        // Обновляем список счетчиков
        await fetchData();
        setShowAddMeterModal(false);
        setMeterType('');
        setMeterNumber('');
      } else {
        throw new Error(result.message || 'Ошибка при добавлении');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении счетчика');
      if (err.message.includes('authentication')) {
        navigate('/login');
      }
    }
  };

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 bg-gray-200 px-4 py-2 rounded"
        >
          Назад
        </button>
      </div>
    );
  }

  if (!property) {
    return <div className="p-4">Данные не найдены</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Объект недвижимости</h1>

      <div className="border p-4 mb-4 rounded-lg shadow-md">
        <p>🏠 Адрес: {property.address}</p>
        <p>Номер счета: {property.account_number}</p>
      </div>

      <div className="border p-4 mb-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg">Приборы учета</h2>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setShowAddMeterModal(true)}
          >
            + Добавить
          </button>
        </div>
        
        {meters.length === 0 ? (
          <p className="text-gray-500">Нет добавленных приборов учета</p>
        ) : (
          <ul className="divide-y">
            {meters.map((meter) => (
              <li key={meter.id} className="py-2 hover:bg-gray-50">
                <p>
                  <span className="font-medium">
                    {meterTypeToLabel[meter.type] || meter.type}:
                  </span>
                  <span className="ml-2">{meter.meter_number}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddMeterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg mb-4">Добавить прибор учета</h3>
            
            {error && <p className="text-red-500 mb-2">{error}</p>}
            
            <select
              value={meterType}
              onChange={(e) => setMeterType(e.target.value)}
              className="border p-2 w-full mb-4 rounded-lg"
              required
            >
              <option value="">Выберите тип счетчика</option>
              {Object.entries(meterTypeToLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              className="border p-2 w-full mb-4 rounded-lg"
              placeholder="Введите номер счетчика"
              required
            />
            
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowAddMeterModal(false);
                  setError(null);
                }}
              >
                Отмена
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleAddMeter}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};