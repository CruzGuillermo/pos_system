import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
} from 'react-bootstrap';
import { useConfiguracion } from '../contexts/useConfiguracion';

export default function ConfiguracionImpresion() {
  const {
    configImpresion,
    loading,
    error,
    updateConfigImpresion,
  } = useConfiguracion();

  const [form, setForm] = useState({
    modo_impresion: 'ticket',
    tipo_ticket: 'detallado',
    mostrar_logo: true,
    mostrar_cuit: true,
    mensaje_pie: '',
    impresora_nombre: '',
  });

  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (configImpresion) {
      setForm({
        modo_impresion: configImpresion.modo_impresion || 'ticket',
        tipo_ticket: configImpresion.tipo_ticket || 'detallado',
        mostrar_logo: configImpresion.mostrar_logo ?? true,
        mostrar_cuit: configImpresion.mostrar_cuit ?? true,
        mensaje_pie: configImpresion.mensaje_pie || '',
        impresora_nombre: configImpresion.impresora_nombre || '',
      });
    }
  }, [configImpresion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateConfigImpresion(form);
    setMensaje('✅ Configuración de impresión guardada');
    setTimeout(() => setMensaje(''), 3000);
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>🖨️ Configuración de Impresión</Card.Title>

        {mensaje && <Alert variant="success">{mensaje}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="modoImpresion">
                <Form.Label>Modo de Impresión</Form.Label>
                <Form.Select
                  name="modo_impresion"
                  value={form.modo_impresion}
                  onChange={handleChange}
                >
                  <option value="ticket">Ticket</option>
                  <option value="A4">A4</option>
                  <option value="pdf">PDF</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="tipoTicket">
                <Form.Label>Tipo de Ticket</Form.Label>
                <Form.Select
                  name="tipo_ticket"
                  value={form.tipo_ticket}
                  onChange={handleChange}
                >
                  <option value="simple">Simple</option>
                  <option value="detallado">Detallado</option>
                  <option value="cocina">Cocina</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="switch"
                id="mostrarLogo"
                name="mostrar_logo"
                label="Mostrar logo en ticket"
                checked={form.mostrar_logo}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="mostrarCuit"
                name="mostrar_cuit"
                label="Mostrar CUIT en ticket"
                checked={form.mostrar_cuit}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="mensajePie">
                <Form.Label>Mensaje en el pie del ticket</Form.Label>
                <Form.Control
                  as="textarea"
                  name="mensaje_pie"
                  rows={3}
                  value={form.mensaje_pie}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group controlId="impresoraNombre">
                <Form.Label>Nombre de la impresora</Form.Label>
                <Form.Control
                  name="impresora_nombre"
                  value={form.impresora_nombre}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button type="submit" variant="primary">
              💾 Guardar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
