import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  Image,
} from 'react-bootstrap';
import { useConfiguracion } from '../contexts/useConfiguracion';

export default function ConfiguracionSucursal() {
  const {
    configSucursal,
    loading,
    error,
    updateConfigSucursal,
  } = useConfiguracion();

  const [form, setForm] = useState({
    nombre_fantasia: '',
    razon_social: '',
    cuit: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    condicion_iva: '',
    logo_base64: '',
  });

  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (configSucursal) {
      setForm((prev) => ({
        ...prev,
        ...configSucursal,
      }));
    }
  }, [configSucursal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        logo_base64: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateConfigSucursal(form);
    setMensaje('✅ Configuración de la sucursal guardada correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>🏢 Datos del Local</Card.Title>

        {mensaje && <Alert variant="success">{mensaje}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Datos generales */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="nombreFantasia">
                <Form.Label>Nombre Fantasía</Form.Label>
                <Form.Control
                  name="nombre_fantasia"
                  value={form.nombre_fantasia}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="razonSocial">
                <Form.Label>Razón Social</Form.Label>
                <Form.Control
                  name="razon_social"
                  value={form.razon_social}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="cuit">
                <Form.Label>CUIT</Form.Label>
                <Form.Control
                  name="cuit"
                  value={form.cuit}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="telefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="direccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="ciudad">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="provincia">
                <Form.Label>Provincia</Form.Label>
                <Form.Control
                  name="provincia"
                  value={form.provincia}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Group controlId="condicionIva">
                <Form.Label>Condición IVA</Form.Label>
                <Form.Control
                  name="condicion_iva"
                  value={form.condicion_iva}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="logo">
                <Form.Label>Logo</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Form.Group>
              {form.logo_base64 && (
                <div className="mt-2">
                  <Image
                    src={form.logo_base64}
                    thumbnail
                    style={{ maxWidth: '120px' }}
                    alt="Logo actual"
                  />
                </div>
              )}
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
