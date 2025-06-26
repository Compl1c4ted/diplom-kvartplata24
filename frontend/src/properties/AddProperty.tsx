import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyServiceAPI from './PropertyAPI';

export const AddPropertyPage = () => {
  const [address, setAddress] = useState('');
  const [inn_uk, setInnUk] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!address || !accountNumber) {
      alert('Введите адрес и номер счета!');
      return;
    }

    const result = await PropertyServiceAPI.addProperty({
      address: address,
      inn_uk: inn_uk, 
      account_number: accountNumber
    });

    if (result.status === 'success') {
      alert('Объект успешно добавлен!');
      navigate('/');
    } else {
      alert(result.message || 'Произошла ошибка');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Добавление объекта</h1>
      <input
        type="text"
        placeholder="Адрес объекта"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="number"
        placeholder="Инн УК"
        value={inn_uk}
        onChange={(e) => setInnUk(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="number"
        placeholder="Номер счета"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleAdd} className="bg-blue-500 text-white p-2 w-full">
        Добавить объект
      </button>
    </div>
  );
};
