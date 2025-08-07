import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TicketVenta from './TicketVenta';

const MostrarTicketVenta = ({ ventaId }) => {
  const [ventaCompleta, setVentaCompleta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ventaId) return;

    const fetchVenta = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:3001/api/ventas/${ventaId}/ticketinfo`, {
          headers: { Authorization: "Bearer TU_TOKEN" },
        });
        setVentaCompleta(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVenta();
  }, [ventaId]);

  if (loading) return <p>Cargando ticket...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!ventaCompleta) return null;

  return <TicketVenta venta={ventaCompleta} />;
};

export default MostrarTicketVenta;
