import { NavLink } from 'react-router-dom';
import { Home, Droplets, Receipt, CreditCard, User } from 'lucide-react';

export const NavBar = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-white p-2 flex justify-around border-t shadow-lg">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-gray-600 ${isActive ? 'text-blue-500 font-bold' : ''}`
        }
      >
        <Home size={24} />
        Главная
      </NavLink>
      <NavLink
        to="/meters"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-gray-600 ${isActive ? 'text-blue-500 font-bold' : ''}`
        }
      >
        <Droplets size={24} />
        Показания
      </NavLink>
      <NavLink
        to="/bills"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-gray-600 ${isActive ? 'text-blue-500 font-bold' : ''}`
        }
      >
        <Receipt size={24} />
        Квитанции
      </NavLink>
      <NavLink
        to="/payment"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-gray-600 ${isActive ? 'text-blue-500 font-bold' : ''}`
        }
      >
        <CreditCard size={24} />
        Оплата
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-gray-600 ${isActive ? 'text-blue-500 font-bold' : ''}`
        }
      >
        <User size={24} />
        Профиль
      </NavLink>
    </nav>
  );
};