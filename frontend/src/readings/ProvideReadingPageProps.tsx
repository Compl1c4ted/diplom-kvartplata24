// // ProvideReadingPage.tsx
// import React, { useState } from 'react';

// interface ProvideReadingPageProps {
//   match: {
//     params: {
//       meterType: string;
//     };
//   };
// }

// const ProvideReadingPage: React.FC<ProvideReadingPageProps> = ({ match }) => {
//   const [meterValue, setMeterValue] = useState('');
//   const meterType = decodeURIComponent(match.params.meterType);

//   const handleSubmit = async () => {
//     if (!meterValue) {
//       alert('Введите показания!');
//       return;
//     }

//     try {
//       // Здесь можно добавить логику отправки данных через API
//       console.log(`Переданы показания для ${meterType}: ${meterValue}`);
//       alert(`Показания для ${meterType} успешно отправлены!`);
//       setMeterValue('');
//     } catch (error) {
//       console.error('Ошибка при отправке показаний:', error);
//       alert('Произошла ошибка при отправке показаний.');
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl mb-4">Передача показаний</h1>
//       <p className="mb-4">Вы передаете показания для: {meterType}</p>
//       <input
//         type="number"
//         placeholder="Введите показания"
//         value={meterValue}
//         onChange={(e) => setMeterValue(e.target.value)}
//         className="border p-2 w-full mb-4"
//       />
//       <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 w-full">
//         Отправить
//       </button>
//     </div>
//   );
// };

// export default ProvideReadingPage;