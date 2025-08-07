// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Inicio from './pages/Inicio';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Productos from './pages/Productos';
import Stock from './pages/Stock';
import Sucursales from './pages/Sucursales';
import Gastos from './pages/Gastos';
import Reportes from './pages/Reportes';
import Configuraciones from './pages/Configuraciones';
import CodigosBarras from './pages/CodigosBarra';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path="codigos-barras" element={<CodigosBarras />} />
                <Route index element={<Inicio />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="caja" element={<Caja />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="productos" element={<Productos />} />
        <Route path="stock" element={<Stock />} />
        <Route path="sucursales" element={<Sucursales />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="configuraciones" element={<Configuraciones />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
