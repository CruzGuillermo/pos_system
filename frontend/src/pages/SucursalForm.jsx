import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function SucursalForm({ show, onHide, onSave, sucursal }) {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
  });

  useEffect(() => {
    if (sucursal) {
      setFormData(sucursal);
    } else {
      setFormData({ nombre: '', direccion: '', telefono: '' });
    }
  }, [sucursal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{sucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="direccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {sucursal ? 'Guardar' : 'Crear'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
