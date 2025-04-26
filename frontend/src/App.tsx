import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './users/Login';
import { RegisterPage } from './pages/Register';
import { HomePage } from './properties/Home';
import MetersPage from './readings/Meters';
import { ReceiptsPage } from './receipts/Receipt';
import PaymentPage from './payments/PaymentPage';
import { ProfilePage } from './profile/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavBar } from './components/Navbar';
import { AddPropertyPage } from './properties/AddProperty';
import MetersDetail from './readings/MetersDetail';
import { EstateObjectPage } from './properties/EstateObject';

// Создаем клиент для react-query
const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищенные маршруты */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <HomePage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meters"
            element={
              <ProtectedRoute>
                <>
                  <MetersPage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meters/:meterId"
            element={
              <ProtectedRoute>
                <>
                  <MetersDetail />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-property"
            element={
              <ProtectedRoute>
                <>
                  <AddPropertyPage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <>
                  <ReceiptsPage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <>
                  <PaymentPage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <ProfilePage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estate-object/:id"
            element={
              <ProtectedRoute>
                <>
                  <EstateObjectPage />
                  <NavBar />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};