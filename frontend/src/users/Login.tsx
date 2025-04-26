import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserServiceAPI from './UserAPI';
// import ApiService from '../services/apiService';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const result = await UserServiceAPI.login(email, password);
    console.log('Login response:', result);

    if (result.status === 'success' && result.data) {
      console.log('Прошли условие')
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);
      console.log('Сохранили токены')
      navigate('/');
      console.log('Навигейт на хом')
    } else {
        alert(result.message);
      }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Вход</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 w-full">
        Войти
      </button>
      <button onClick={() => navigate('/register')} className="mt-2 text-blue-500">
        Регистрация
      </button>
    </div>
  );
};
