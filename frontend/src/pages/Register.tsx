import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserServiceAPI from '../users/UserAPI';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    const result = await UserServiceAPI.register(email, password);
    if (result.status === 'success') {
      alert('Вы успешно зарегистрированы!');
      navigate('/login');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Регистрация</h1>
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
      <input
        type="password"
        placeholder="Подтвердите пароль"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleRegister} className="bg-blue-500 text-white p-2 w-full">
        Зарегистрироваться
      </button>
      <button onClick={() => navigate('/login')} className="mt-2 text-blue-500">
        Войти
      </button>
    </div>
  );
};
