import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function ConfiguracionSistema() {
  const [form, setForm] = useState({
    simbolo_moneda: '',
    formato_decimal: '',
    redondeo: false,
    permitir_venta_sin_stock: false,
    permitir_venta_sin_caja: false,
    alerta_stock_bajo: false,
    stock_minimo_default: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfiguracion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('https://pos-system-t5am.onrender.com/api/configuracion/sistema'); // Asegurate que esta ruta sea la correcta
      setForm({
        simbolo_moneda: res.data.simbolo_moneda || '',
        formato_decimal: res.data.formato_decimal || '',
        redondeo: res.data.redondeo || false,
        permitir_venta_sin_stock: res.data.permitir_venta_sin_stock || false,
        permitir_venta_sin_caja: res.data.permitir_venta_sin_caja || false,
        alerta_stock_bajo: res.data.alerta_stock_bajo || false,
        stock_minimo_default: res.data.stock_minimo_default || 0,
      });
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al obtener configuración del sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://pos-system-t5am.onrender.com/api/configuracion/sistema', form); // Asegurate que esta ruta sea la correcta
      Swal.fire('Configuración guardada correctamente', '', 'success');
      fetchConfiguracion(); // Recarga los datos desde el backend
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      Swal.fire('Error al guardar configuración', err.response?.data?.error || 'Error desconocido', 'error');
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <h4 className="mb-4">Configuración del Sistema</h4>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="simbolo_moneda">
              <Form.Label>Símbolo de moneda</Form.Label>
              <Form.Control
                name="simbolo_moneda"
                value={form.simbolo_moneda}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formato_decimal">
              <Form.Label>Formato decimal</Form.Label>
              <Form.Control
                name="formato_decimal"
                value={form.formato_decimal}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Check
              type="switch"
              id="redondeo"
              name="redondeo"
              label="Redondeo"
              checked={form.redondeo}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Check
              type="switch"
              id="permitir_venta_sin_stock"
              name="permitir_venta_sin_stock"
              label="Permitir venta sin stock"
              checked={form.permitir_venta_sin_stock}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Check
              type="switch"
              id="permitir_venta_sin_caja"
              name="permitir_venta_sin_caja"
              label="Permitir venta sin caja"
              checked={form.permitir_venta_sin_caja}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Check
              type="switch"
              id="alerta_stock_bajo"
              name="alerta_stock_bajo"
              label="Alerta de stock bajo"
              checked={form.alerta_stock_bajo}
              onChange={handleChange}
            />
          </Col>
          <Col md={8}>
            <Form.Group controlId="stock_minimo_default">
              <Form.Label>Stock mínimo por defecto</Form.Label>
              <Form.Control
                type="number"
                name="stock_minimo_default"
                min={0}
                value={form.stock_minimo_default}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          Guardar
        </Button>
      </Form>
    </Container>
  );
}
