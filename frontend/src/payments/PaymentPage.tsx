import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PaymentApi, { Property, Receipt } from '../payments/PaymentAPI';

const PaymentPage = () => {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [calculationResult, setCalculationResult] = useState<string | null>(null);

    // Загрузка недвижимостей
    const { 
        data: propertiesResponse, 
        isLoading: isPropertiesLoading, 
        error: propertiesError 
    } = useQuery({
        queryKey: ['userProperties'],
        queryFn: PaymentApi.getPropertiesWithUnpaidReceipts
    });

    const properties = propertiesResponse?.status === 'success' 
        ? propertiesResponse.data || []
        : [];

    // Загрузка квитанций для выбранной недвижимости
    const { 
        data: unpaidReceiptsResponse,
        isLoading: isReceiptsLoading,
        error: receiptsError,
        refetch: refetchReceipts
    } = useQuery({
        queryKey: ['unpaidReceipts', selectedProperty?.id],
        queryFn: async () => {
            if (!selectedProperty?.id) return { status: 'success', data: [] };
            return await PaymentApi.getUnpaidReceipts(selectedProperty.id);
        },
        enabled: !!selectedProperty?.id
    });

    const unpaidReceipts = unpaidReceiptsResponse?.status === 'success'
        ? unpaidReceiptsResponse.data || []
        : [];

    // Расчет общей суммы
    const totalAmount = unpaidReceipts.reduce(
        (sum, receipt) => sum + (receipt.amount || 0), 
        0
    );

    // Обработчик расчета
    const handleCalculate = async () => {
        if (!selectedProperty) {
            alert('Выберите недвижимость');
            return;
        }
        if (unpaidReceipts.length === 0) {
            alert('Нет квитанций для расчета');
            return;
        }
        
        try {
            // Здесь можно добавить вызов API для сохранения расчета
            // Например:
            // const result = await apiClient.post('/calculations/', {
            //     property_id: selectedProperty.id,
            //     total_amount: totalAmount,
            //     receipt_ids: unpaidReceipts.map(r => r.id)
            // });
            
            setCalculationResult(`Успешно рассчитано ${unpaidReceipts.length} квитанций на сумму ${totalAmount.toFixed(2)} руб.`);
            
            // Обновляем список квитанций после расчета
            await refetchReceipts();
            
        } catch (error) {
            console.error('Calculation error:', error);
            setCalculationResult('Ошибка при расчете');
        }
    };

    if (isPropertiesLoading) return <div className="p-4 text-center">Загрузка недвижимостей...</div>;
    if (propertiesError) return <div className="p-4 text-center text-red-500">Ошибка загрузки недвижимостей</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Расчет квитанций</h1>
            
            {/* Выбор недвижимости */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите недвижимость
                </label>
                <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => {
                        const prop = properties.find(p => p.id === Number(e.target.value));
                        setSelectedProperty(prop || null);
                        setCalculationResult(null);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">-- Выберите недвижимость --</option>
                    {properties.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.address} ({p.account_number})
                        </option>
                    ))}
                </select>
            </div>

            {/* Состояние загрузки квитанций */}
            {isReceiptsLoading && <div className="p-4 text-center">Загрузка квитанций...</div>}
            {receiptsError && <div className="p-4 text-center text-red-500">Ошибка загрузки квитанций</div>}

            {/* Список квитанций */}
            {selectedProperty && !isReceiptsLoading && !receiptsError && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">
                        Квитанции для {selectedProperty.address}
                    </h2>
                    
                    {unpaidReceipts.length === 0 ? (
                        <p className="text-gray-500">Нет квитанций для отображения</p>
                    ) : (
                        <div className="space-y-3">
                            {unpaidReceipts.map(receipt => (
                                <div key={receipt.id} className="p-3 border border-gray-200 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Квитанция №{receipt.transaction_number}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(receipt.transaction_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="font-bold">
                                            {receipt.amount.toFixed(2)} руб.
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex justify-between font-bold">
                                    <span>Итого к оплате:</span>
                                    <span>{totalAmount.toFixed(2)} руб.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Кнопка расчета и результат */}
            <div className="space-y-4">
                {selectedProperty && unpaidReceipts.length > 0 && (
                    <button
                        onClick={handleCalculate}
                        disabled={isReceiptsLoading}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium text-lg ${
                            isReceiptsLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        } transition-colors`}
                    >
                        {isReceiptsLoading ? 'Загрузка...' : `Рассчитать (${totalAmount.toFixed(2)} руб.)`}
                    </button>
                )}
                
                {calculationResult && (
                    <div className={`p-3 rounded-md ${
                        calculationResult.includes('Ошибка') 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                    }`}>
                        {calculationResult}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;