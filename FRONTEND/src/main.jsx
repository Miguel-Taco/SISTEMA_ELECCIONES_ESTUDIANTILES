// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './services/AuthContext'; // Importar AuthProvider
import App from './App'; // Importar el componente App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Aquí envolvemos App con AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
