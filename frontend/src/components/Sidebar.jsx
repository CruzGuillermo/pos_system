// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Nav, Button } from 'react-bootstrap';
import {
  FaHome, FaShoppingCart, FaWallet, FaUsers, FaTruck,
  FaBoxOpen, FaStore, FaBuilding, FaMoneyBillWave, FaChartBar,
  FaCog, FaSignOutAlt, FaBarcode
} from 'react-icons/fa';

const navItems = [
  { label: 'Inicio', icon: <FaHome />, path: '/dashboard' },
  { label: 'Ventas', icon: <FaShoppingCart />, path: '/dashboard/ventas' },
  { label: 'Caja', icon: <FaWallet />, path: '/dashboard/caja' },
  { label: 'Clientes', icon: <FaUsers />, path: '/dashboard/clientes' },
  { label: 'Proveedores', icon: <FaTruck />, path: '/dashboard/proveedores' },
  { label: 'Productos', icon: <FaBoxOpen />, path: '/dashboard/productos' },
  { label: 'Códigos de Barras', icon: <FaBarcode />, path: '/dashboard/codigos-barras' },
  { label: 'Stock', icon: <FaStore />, path: '/dashboard/stock' },
  { label: 'Sucursales', icon: <FaBuilding />, path: '/dashboard/sucursales' },
  { label: 'Gastos', icon: <FaMoneyBillWave />, path: '/dashboard/gastos' },
  { label: 'Reportes', icon: <FaChartBar />, path: '/dashboard/reportes' },
  { label: 'Configuraciones', icon: <FaCog />, path: '/dashboard/configuraciones' },
];

const disabledPaths = [
  '/dashboard/clientes',
  '/dashboard/sucursales',
  '/dashboard/gastos',
  '/dashboard/reportes',
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column bg-light vh-100 p-3 shadow-sm" style={{ width: '240px' }}>
      <h5 className="text-center mb-4">Punto de Venta</h5>

      <Nav className="flex-column">
        {navItems.map((item) => {
          const isDisabled = disabledPaths.includes(item.path);

          return (
            <NavLink
              key={item.path}
              to={isDisabled ? '#' : item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center mb-2 ${
                  isActive && !isDisabled
                    ? 'active bg-primary text-white rounded px-2 py-1'
                    : isDisabled
                    ? 'text-muted disabled'
                    : 'text-dark'
                }`
              }
              onClick={e => {
                if (isDisabled) e.preventDefault();
              }}
              tabIndex={isDisabled ? -1 : 0} // opcional, para que no se pueda tabular al item disabled
              aria-disabled={isDisabled}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </Nav>

      <div className="mt-auto">
        <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
