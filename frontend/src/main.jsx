import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Importar estilos de Bootstrap
import { AuthProvider } from './contexts/AuthContext';
import { HashRouter } from 'react-router-dom'; // ✅ Para soporte en Electron
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
