// import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './App.css';
import * as serviceWorkerRegistration from '././serviceWorkerRegistration'; // Если нет — создайте


ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

// Регистрируем Service Worker
serviceWorkerRegistration.register();
