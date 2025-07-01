// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('access_token');
  console.log('ProtectedRoute check - token exists:', !!token);
  
  if (!token) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Rendering protected content');
  return <>{children}</>;
};