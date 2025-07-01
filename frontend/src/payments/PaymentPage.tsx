import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PaymentApi, { Property, Receipt } from '../payments/PaymentAPI';

const PaymentPage = () => {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card' | null>(null);

    // 1. Загрузка всех недвижимостей пользователя
    const { 
        data: propertiesResponse, 
        isLoading: isPropertiesLoading, 
        error: propertiesError 
    } = useQuery({
        queryKey: ['userProperties'],
        queryFn: PaymentApi.getPropertiesWithUnpaidReceipts
    });

    // Получаем массив properties
    const properties = propertiesResponse?.status === 'success' 
        ? propertiesResponse.data?.properties || []
        : [];

    // 2. Загрузка неоплаченных квитанций с преобразованием amount
    const { 
        data: unpaidReceiptsResponse,
        isLoading: isReceiptsLoading,
        error: receiptsError
    } = useQuery({
        queryKey: ['unpaidReceipts', selectedProperty?.id],
        queryFn: async () => {
            if (!selectedProperty?.id) return { status: 'success', data: [] };
            
            const response = await PaymentApi.getUnpaidReceipts(selectedProperty.id);
            
            // Преобразуем amount в число для всех квитанций
            if (response.status === 'success' && response.data) {
                const receiptsWithNumbers = response.data.map(receipt => ({
                    ...receipt,
                    amount: typeof receipt.amount === 'string' 
                        ? parseFloat(receipt.amount) 
                        : receipt.amount
                }));
                return { ...response, data: receiptsWithNumbers };
            }
            
            return response;
        },
        enabled: !!selectedProperty?.id
    });

    // Получаем массив квитанций с числовыми amount
    const unpaidReceipts = unpaidReceiptsResponse?.status === 'success'
        ? unpaidReceiptsResponse.data || []
        : [];

    // 3. Общая сумма к оплате (с защитой от NaN)
    const totalAmount = unpaidReceipts.reduce(
        (sum, receipt) => sum + (Number(receipt.amount) || 0), 
        0
    );

    // 4. Обработка оплаты
    const handlePayment = async () => {
        if (!selectedProperty || !paymentMethod || unpaidReceipts.length === 0) return;
        
        try {
            // Оплачиваем каждую квитанцию по отдельности
            const paymentResults = await Promise.all(
                unpaidReceipts.map(receipt => 
                    PaymentApi.payReceipt(receipt.id, paymentMethod)
                )
            );

            // Проверяем результаты всех оплат
            const allSuccessful = paymentResults.every(
                result => result.status === 'success'
            );

            if (allSuccessful) {
                alert(`Успешно оплачено ${unpaidReceipts.length} квитанций на сумму ${totalAmount.toFixed(2)} руб.!`);
                
                // Можно добавить обновление данных после оплаты
                // queryClient.invalidateQueries(['unpaidReceipts', selectedProperty.id]);
            } else {
                const errorMessages = paymentResults
                    .filter(result => result.status === 'error')
                    .map(result => result.message)
                    .join('\n');
                
                alert(`Ошибки при оплате:\n${errorMessages}`);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Произошла ошибка при выполнении платежа');
        }
    };

    // Отображаем загрузку или ошибки
    if (isPropertiesLoading) return <div className="p-4 text-center">Загрузка недвижимостей...</div>;
    if (propertiesError) return <div className="p-4 text-center text-red-500">Ошибка загрузки недвижимостей</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Оплата квитанций</h1>
            
            {/* Выбор недвижимости */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите недвижимость
                </label>
                <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => {
                        const property = properties.find(p => p.id === Number(e.target.value));
                        setSelectedProperty(property || null);
                        setPaymentMethod(null);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">-- Не выбрано --</option>
                    {properties.map(property => (
                        <option key={property.id} value={property.id}>
                            {property.address}
                        </option>
                    ))}
                </select>
            </div>

            {/* Состояния загрузки квитанций */}
            {isReceiptsLoading && (
                <div className="p-4 text-center">Загрузка квитанций...</div>
            )}

            {receiptsError && (
                <div className="p-4 text-center text-red-500">Ошибка загрузки квитанций</div>
            )}

            {/* Список квитанций */}
            {selectedProperty && !isReceiptsLoading && !receiptsError && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Квитанции к оплате</h2>
                    
                    {unpaidReceipts.length === 0 ? (
                        <p className="text-gray-500">Нет неоплаченных квитанций</p>
                    ) : (
                        <div className="space-y-4">
                            {unpaidReceipts.map(receipt => (
                                <div key={receipt.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">Квитанция №{receipt.transaction_number}</h3>
                                            <p className="text-sm text-gray-600">
                                                Дата: {new Date(receipt.transaction_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="font-bold text-lg">
                                            {/* Гарантируем, что amount - число */}
                                            {typeof receipt.amount === 'number' 
                                                ? receipt.amount.toFixed(2)
                                                : parseFloat(receipt.amount || '0').toFixed(2)} руб.
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Итого к оплате:</span>
                                    <span>{totalAmount.toFixed(2)} руб.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Кнопка оплаты */}
            {selectedProperty && unpaidReceipts.length > 0 && (
                <button
                    onClick={handlePayment}
                    className={w-full py-3 px-4 rounded-md text-white font-medium text-lg bg-blue-600 hover:bg-blue-700 shadow-md}
                    >
                    Рассчитать {totalAmount.toFixed(2)} руб.
                </button>
            )}
        </div>
    );
};

export default PaymentPage;