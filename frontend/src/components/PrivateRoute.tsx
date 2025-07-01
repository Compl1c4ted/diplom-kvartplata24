// components/ProtectedRoute.tsx
import { JSX, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token_access');
    if (!token) {
      setIsAuth(false);
      return;
    }

    // Простая проверка токена без API запроса
    setIsAuth(true);
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? children : <Navigate to="/login" replace />;
};