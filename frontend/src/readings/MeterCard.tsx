// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import ReadingServiceAPI from './ReadingAPI';

// const MetersDetail: React.FC = () => {
//   const { meterId } = useParams<{ meterId: string }>();
//   const navigate = useNavigate();
//   const [currentValue, setCurrentValue] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [lastReading, setLastReading] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   // Загружаем последние показания при загрузке страницы
//   useEffect(() => {
//     if (!meterId) return;

//     const fetchLastReading = async () => {
//       try {
//         const result = await ReadingServiceAPI.getLastReading(meterId);
        
//         if (result.status === 'success') {
//           setLastReading(result.data?.last_reading || null);
//         } else {
//           setError(result.message || 'Ошибка загрузки последних показаний');
//         }
//       } catch (err) {
//         setError('Ошибка при загрузке данных');
//         console.error('Ошибка:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLastReading();
//   }, [meterId]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!meterId || isNaN(Number(meterId))) {
//       setError('Неверный ID счетчика');
//       return;
//     }

//     if (!currentValue) {
//       setError('Введите текущие показания');
//       return;
//     }

//     setIsSubmitting(true);
//     setError('');
//     setSuccess('');

//     try {
//       const result = await ReadingServiceAPI.addReading({
//         meter_id: Number(meterId),
//         current_value: Number(currentValue),
//         tariff: 0 // Так как tariff не нужен, передаем 0
//       });

//       if (result.status === 'success') {
//         setSuccess('Показания успешно отправлены');
//         setCurrentValue('');
//         // Обновляем последние показания
//         const newReadingResult = await ReadingServiceAPI.getLastReading(meterId);
//         if (newReadingResult.status === 'success') {
//           setLastReading(newReadingResult.data?.last_reading || null);
//         }
//       } else {
//         setError(result.message || 'Ошибка при отправке показаний');
//       }
//     } catch (err) {
//       setError('Произошла ошибка при отправке данных');
//       console.error(err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) return <div className="p-4">Загрузка...</div>;

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <button 
//         onClick={() => navigate(-1)}
//         className="mb-4 text-blue-600 hover:text-blue-800"
//       >
//         &larr; Назад
//       </button>

//       <h1 className="text-xl font-bold mb-4">Передать показания</h1>
      
//       {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
//       {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}

//       {lastReading && (
//         <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//           <h2 className="font-bold mb-2">Последние показания</h2>
//           <p>Текущие показания: {lastReading.current_value}</p>
//           <p>Предыдущие показания: {lastReading.previous_value}</p>
//           <p>Дата подачи: {new Date(lastReading.updated_at).toLocaleString()}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block mb-1">Текущие показания:</label>
//           <input
//             type="number"
//             step="0.001"
//             value={currentValue}
//             onChange={(e) => setCurrentValue(e.target.value)}
//             className="w-full p-2 border rounded"
//             disabled={isSubmitting}
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           {isSubmitting ? 'Отправка...' : 'Отправить показания'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default MetersDetail;