import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyServiceAPI, { PropertyInterface } from './PropertyAPI';

export const HomePage = () => {
  const [properties, setProperties] = useState<PropertyInterface[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await PropertyServiceAPI.getProperties()

        if (result.status === 'success') {
          setProperties(result.data || []);
        } else {
          console.error('Ошибка загрузки:', result.message)
        }
      } catch (error) {
        console.error('Ошибка сети:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  if (loading) return <div>Загрузка...</div>

  return (
    <div className="p-4">
      {/* Отступ сверху для NavBара */}
      <div className="mt-8">
        <h1 className="text-xl mb-4">Ваши объекты</h1>
        {properties.length === 0 && <p>У вас пока нет объектов недвижимости</p>}

        {properties.map((property: any, index) => (
          // Кликабельная карточка
          <div
            key={index}
            className="border p-4 mb-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition duration-300"
            onClick={() => navigate(`/estate-object/${property.id}`)} // Открываем в новой вкладке
            role="button"
            tabIndex={0}
          >
            <p>🏠 Адрес: {property.address}</p>
            <p>Лицевой счет: {property.account_number}</p>
          </div>
        ))}
      </div>

      {/* Отступ снизу для NavBара */}
      <div style={{ marginBottom: '64px' }}></div>

      {/* Круглая кнопка "Добавить объект" */}
      <button
        className="bg-blue-500 text-white shadow-lg fixed bottom-20 right-4 z-10 rounded-full w-20 h-20 flex justify-center items-center font-bold"
        onClick={() => navigate('/add-property')}
      >
        +
      </button>
    </div>
  );
};