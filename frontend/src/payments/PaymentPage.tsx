import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PaymentApi, { Property, Receipt } from '../payments/PaymentAPI';

const PaymentPage = () => {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // 1. Загрузка всех недвижимостей
    const { 
        data: propertiesResponse, 
        isLoading: isPropertiesLoading, 
        error: propertiesError 
    } = useQuery({
        queryKey: ['userProperties'],
        queryFn: PaymentApi.getPropertiesWithUnpaidReceipts
    });

    const properties = propertiesResponse?.status === 'success' 
        ? propertiesResponse.data?.properties || []
        : [];

    // 2. Загрузка квитанций
    const { 
        data: unpaidReceiptsResponse,
        isLoading: isReceiptsLoading,
        error: receiptsError
    } = useQuery({
        queryKey: ['unpaidReceipts', selectedProperty?.id],
        queryFn: async () => {
            if (!selectedProperty?.id) return { status: 'success', data: [] };
            
            const response = await PaymentApi.getUnpaidReceipts(selectedProperty.id);
            
            if (response.status === 'success' && response.data) {
                return {
                    ...response,
                    data: response.data.map(receipt => ({
                        ...receipt,
                        amount: typeof receipt.amount === 'string' 
                            ? parseFloat(receipt.amount) 
                            : receipt.amount
                    }))
                };
            }
            return response;
        },
        enabled: !!selectedProperty?.id
    });

    const unpaidReceipts = unpaidReceiptsResponse?.status === 'success'
        ? unpaidReceiptsResponse.data || []
        : [];

    // 3. Расчет общей суммы
    const totalAmount = unpaidReceipts.reduce(
        (sum, receipt) => sum + (Number(receipt.amount) || 0), 
        0
    );

    // 4. Обработчик расчета
    const handleCalculate = async () => {
        if (!selectedProperty || unpaidReceipts.length === 0) return;
        
        try {
            // Здесь может быть ваша логика подготовки данных
            // Например, формирование документа или экспорт
            alert(`Рассчитано ${unpaidReceipts.length} квитанций на сумму ${totalAmount.toFixed(2)} руб.`);
            
            // Можно добавить вызов API для сохранения расчета
            // const result = await PaymentApi.saveCalculation(unpaidReceipts);
            
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Ошибка при расчете');
        }
    };

    if (isPropertiesLoading) return <div className="p-4 text-center">Загрузка...</div>;
    if (propertiesError) return <div className="p-4 text-center text-red-500">Ошибка загрузки</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Расчет квитанций</h1>
            
            {/* Выбор недвижимости */}
            <div className="mb-6">
                <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => setSelectedProperty(
                        properties.find(p => p.id === Number(e.target.value)) || null
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">-- Выберите недвижимость --</option>
                    {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.address}</option>
                    ))}
                </select>
            </div>

            {/* Список квитанций */}
            {isReceiptsLoading && <div className="p-4 text-center">Загрузка квитанций...</div>}
            {receiptsError && <div className="p-4 text-center text-red-500">Ошибка загрузки</div>}

            {selectedProperty && !isReceiptsLoading && !receiptsError && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Квитанции</h2>
                    
                    {unpaidReceipts.length === 0 ? (
                        <p className="text-gray-500">Нет квитанций</p>
                    ) : (
                        <>
                            {unpaidReceipts.map(receipt => (
                                <div key={receipt.id} className="p-4 border border-gray-200 rounded-lg mb-2">
                                    <div className="flex justify-between">
                                        <span>№{receipt.transaction_number}</span>
                                        <span className="font-bold">
                                            {receipt.amount.toFixed(2)} руб.
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="p-3 bg-gray-50 rounded-lg mt-4">
                                <div className="flex justify-between font-bold">
                                    <span>Итого:</span>
                                    <span>{totalAmount.toFixed(2)} руб.</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Кнопка расчета */}
            {selectedProperty && unpaidReceipts.length > 0 && (
                <button
                    onClick={handleCalculate}
                    className="w-full py-3 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
                >
                    Рассчитать ({totalAmount.toFixed(2)} руб.)
                </button>
            )}
        </div>
    );
};

export default PaymentPage;