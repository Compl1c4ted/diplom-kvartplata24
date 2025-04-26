// Получение access токена
export const getAuthHeader = () => {
    try {
        // 1. Проверяем localStorage
        const localStorageToken = localStorage.getItem('access_token');
        
        // 2. Если нет в localStorage, проверяем sessionStorage
        const sessionStorageToken = !localStorageToken 
            ? sessionStorage.getItem('access_token')
            : null;
        
        const token = localStorageToken || sessionStorageToken;
        
        if (!token) {
            console.warn('Токен не найден в хранилище');
            return {
                'Content-Type': 'application/json'
            };
        }
        
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    } catch (error) {
        console.error('Ошибка доступа к хранилищу:', error);
        return {
            'Content-Type': 'application/json'
        };
    }
}

// Обработчик ошибки аутентификации
export const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
        // Очищаем все возможные места хранения
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        // Редирект с сохранением текущего пути
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
}