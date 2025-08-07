import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Table,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import SucursalForm from './SucursalForm';

export default function Sucursales() {
  const { auth } = useAuth();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sucursalEdit, setSucursalEdit] = useState(null);

  const fetchSucursales = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const res = await fetch('https://pos-system-t5am.onrender.com/api/sucursales', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await res.json();
      setSucursales(data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      alert('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, [auth]);

  const handleOpenNew = () => {
    setSucursalEdit(null);
    setShowForm(true);
  };

  const handleSaveSucursal = async (sucursal) => {
    const method = sucursal.id ? 'PUT' : 'POST';
    const url = sucursal.id
      ? `https://pos-system-t5am.onrender.com/api/sucursales/${sucursal.id}`
      : 'https://pos-system-t5am.onrender.com/api/sucursales';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(sucursal),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al guardar sucursal');
        return;
      }
      if (sucursal.id) {
        setSucursales(prev => prev.map(s => (s.id === data.id ? data : s)));
      } else {
        setSucursales(prev => [...prev, data]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      alert('Error al guardar sucursal');
    }
  };

  const handleEdit = (sucursal) => {
    setSucursalEdit(sucursal);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta sucursal?')) return;

    try {
      const res = await fetch(`https://pos-system-t5am.onrender.com/api/sucursales/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al eliminar sucursal');
        return;
      }
      setSucursales(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error al eliminar sucursal:', error);
      alert('Error al eliminar sucursal');
    }
  };

  return (
    <Container className="py-3" style={{ maxWidth: 900 }}>
      <Row className="mb-3 align-items-center">
        <Col>
          <h2>Sucursales</h2>
        </Col>
        <Col xs="auto">
          <Button onClick={handleOpenNew}>Nueva Sucursal</Button>
        </Col>
      </Row>

      {loading ? (
        <p>Cargando sucursales...</p>
      ) : sucursales.length === 0 ? (
        <p>No hay sucursales registradas.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th style={{ width: '110px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.map(s => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.direccion}</td>
                <td>{s.telefono}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(s)}
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(s.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <SucursalForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveSucursal}
        sucursal={sucursalEdit}
      />
    </Container>
  );
}
