import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReadingServiceAPI from './ReadingAPI';
import PropertyServiceAPI, { PropertyInterface } from '../properties/PropertyAPI';

interface Meter {
  id: number;
  type: string;
  meter_number: string;
  property_id: number;
}

const MetersPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyInterface[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const result = await PropertyServiceAPI.getProperties();

        if (result.status === 'success') {
          setProperties(result.data || []);
        } else {
          setError(result.message || 'Ошибка загрузки объектов недвижимости');
        }
      } catch (err) {
        setError('Ошибка сети при загрузке объектов');
        console.error('Ошибка сети:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) {
      setMeters([]);
      return;
    }

    const fetchMeters = async () => {
      try {
        setLoading(true);
        const result = await ReadingServiceAPI.getMetersByProperty(selectedPropertyId);
        
        if (result.status === 'success') {
          setMeters(result.data?.meters || []);
          setError(null);
        } else {
          setError(result.message || 'Ошибка загрузки счетчиков');
        }
      } catch (err) {
        setError('Ошибка при загрузке счетчиков');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, [selectedPropertyId]);

  if (loading) return <div className="p-4">Загрузка...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Управление приборами учета</h1>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Выберите объект недвижимости:</label>
        <select
          value={selectedPropertyId || ''}
          onChange={(e) => setSelectedPropertyId(e.target.value || null)}
          className="border p-2 rounded w-full max-w-md"
        >
          <option value="">-- Выберите объект --</option>
          {properties.map(property => (
            <option key={property.id} value={property.id.toString()}>
              {property.address} (счет: {property.account_number})
            </option>
          ))}
        </select>
      </div>

      {selectedPropertyId && (
        <div>
          <h2 className="text-lg mb-3">Приборы учета</h2>
          {meters.length === 0 ? (
            <p className="text-gray-500">Нет приборов учета для этого объекта</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meters.map(meter => (
                <Link
                  key={meter.id}
                  to={`/meters/${meter.id}`}
                  className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-lg mb-2">{meter.type}</h3>
                  <p className="text-gray-600">Номер: {meter.meter_number}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetersPage;