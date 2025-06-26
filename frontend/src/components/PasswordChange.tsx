import { useState } from 'react';

export const PasswordChange = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChange = () => {
    alert(`Пароль успешно изменён!`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Смена пароля</h1>
      <input
        type="password"
        placeholder="Старый пароль"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="password"
        placeholder="Новый пароль"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleChange} className="bg-blue-500 text-white p-2 w-full">
        Изменить пароль
      </button>
    </div>
  );
};
