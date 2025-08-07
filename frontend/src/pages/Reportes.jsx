import React, { useState } from 'react';

const resumenVentas = {
  totalVentas: 123450,
  ventasPorDia: [15000, 12000, 17000, 14000, 13000, 16000, 19000],
};

const resumenGastos = {
  totalGastos: 45000,
  gastosPorCategoria: {
    Luz: 12000,
    Agua: 8000,
    Insumos: 15000,
    Otros: 10000,
  },
};

const stockBajo = [
  { id: 1, nombre: 'Producto A', stock: 3 },
  { id: 2, nombre: 'Producto B', stock: 2 },
  { id: 3, nombre: 'Producto C', stock: 1 },
];

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <div style={{ padding: '16px' }}>{children}</div>;
}

export default function Reportes() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Reportes</h1>

      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: 24 }}>
        {['Ventas', 'Gastos', 'Stock Bajo'].map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            style={{
              flex: 1,
              padding: '12px 0',
              cursor: 'pointer',
              backgroundColor: tab === i ? '#1976d2' : 'transparent',
              color: tab === i ? 'white' : 'black',
              border: 'none',
              borderBottom: tab === i ? '3px solid #115293' : '3px solid transparent',
              fontWeight: tab === i ? 'bold' : 'normal',
              outline: 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <TabPanel value={tab} index={0}>
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4 }}>
          <h2>Resumen de Ventas</h2>
          <p>Total ventas: ${resumenVentas.totalVentas.toLocaleString()}</p>
          <p>Ventas últimos 7 días:</p>
          <ul>
            {resumenVentas.ventasPorDia.map((v, i) => (
              <li key={i}>Día {i + 1}: ${v.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4 }}>
          <h2>Resumen de Gastos</h2>
          <p>Total gastos: ${resumenGastos.totalGastos.toLocaleString()}</p>
          <p>Gastos por categoría:</p>
          <ul>
            {Object.entries(resumenGastos.gastosPorCategoria).map(([cat, monto]) => (
              <li key={cat}>{cat}: ${monto.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4 }}>
          <h2>Productos con stock bajo</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Producto</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {stockBajo.map(({ id, nombre, stock }) => (
                <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{nombre}</td>
                  <td style={{ padding: '8px' }}>{stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabPanel>
    </div>
  );
}
