import React, { useEffect, useState, useLayoutEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { useAuth } from "../contexts/AuthContext";

export default function CodigosBarras() {
  const { auth } = useAuth();
  const [productosAutoGenerados, setProductosAutoGenerados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.token) return;
    setLoading(true);
    fetch('https://pos-system-t5am.onrender.com/api/productos', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('No autorizado o error al cargar productos');
        return res.json();
      })
      .then(data => {
        // Cambié filtro para incluir todos que tengan código de barras
        const generados = data.filter(p => p.codigo_barras && p.codigo_barras.length > 0);
        setProductosAutoGenerados(generados);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [auth]);

  useLayoutEffect(() => {
    productosAutoGenerados.forEach(producto => {
      const svgElement = document.getElementById(`barcode-${producto.id}`);
      if (svgElement) {
        JsBarcode(svgElement, producto.codigo_barras, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 14,
          width: 2,
          height: 60,
          margin: 0,
        });
      }
    });
  }, [productosAutoGenerados]);

  if (loading) return <p>Cargando códigos de barras...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <div className="print-container" style={{ padding: 20 }}>
        <h2>Códigos de Barras Generados</h2>
        {productosAutoGenerados.length === 0 ? (
          <p>No hay códigos de barras generados automáticamente.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {productosAutoGenerados.map(producto => (
              <div key={producto.id} style={{ textAlign: 'center', minWidth: 150 }}>
                <svg id={`barcode-${producto.id}`} style={{ width: 180, height: 80, margin: '0 auto' }} />
                <div style={{ fontSize: 12, marginTop: 5 }}>{producto.nombre}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => window.print()} style={{ marginTop: 20 }}>
          Imprimir
        </button>
      </div>
    </>
  );
}
