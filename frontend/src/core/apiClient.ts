import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://diplom-kvartplata24.onrender.com',
});

// Очередь для запросов, ожидающих обновления токена
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Добавляем токен к каждому запросу
apiClient.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Обрабатываем ответы и 401 ошибки
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      try {
        const { data } = await apiClient.post('/user/refresh-token/', 
          { refresh_token: refreshToken },  // <-- Формат JSON тела
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        localStorage.setItem('access_token', data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (e) {
        logoutUser();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

function logoutUser() {
  localStorage.removeItem('access_token');  // <-- Исправлено на access_token
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}

async function checkTimeSync() {
  try {
    const response = await axios.get('https://diplom-kvartplata24.onrender.com/user/server-time/');
    const serverTime = new Date(response.data.server_time).getTime();
    const clientTime = Date.now();
    const diff = Math.abs(serverTime - clientTime);
    
    if (diff > 300000) { // 5 минут разницы
      console.error(`Внимание: Рассинхронизация времени! Сервер: ${serverTime}, Клиент: ${clientTime}`);
      alert('Пожалуйста, синхронизируйте время на вашем компьютере');
    }
    console.log('Со временем все ок!')
  } catch (e) {
    console.warn('Не удалось проверить синхронизацию времени', e);
  }
}

// Вызывайте при старте приложения
checkTimeSync();

export default apiClient;