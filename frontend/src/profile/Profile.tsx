import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const [formData, setFormData] = useState({
    email: 'user@mail.ru',
    phone: '',
    name: '',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Здесь будет логика сохранения данных
    setIsEditing(false);
    alert('Данные успешно сохранены!');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-8">
        <img 
          src={formData.avatar} 
          alt="Аватар" 
          className="h-24 w-24 rounded-full object-cover border-4 border-blue-100 mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-800">Профиль пользователя</h1>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-3 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="+7 (XXX) XXX-XX-XX"
            className="w-full p-3 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Введите ваше имя"
            className="w-full p-3 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на аватар</label>
            <input
              name="avatar"
              type="url"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Введите URL изображения"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
            >
              Отмена
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Выйти
            </button>
          </>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Настройки</h2>
        <button
          onClick={() => navigate('/change-password')}
          className="w-full text-left py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          Сменить пароль
        </button>
        <button
          onClick={() => alert('Уведомления отключены')}
          className="w-full text-left py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          Настройки уведомлений
        </button>
      </div>
    </div>
  );
};