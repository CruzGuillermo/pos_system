import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

function ProveedorForm({ show, onHide, onSave, proveedor }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: '',           // agregado
  });

  useEffect(() => {
    if (proveedor) {
      setFormData(proveedor);
    } else {
      setFormData({ nombre: '', telefono: '', email: '', direccion: '', notas: '' });
    }
  }, [proveedor]);

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
        <Modal.Title>{proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} autoFocus />
          </Form.Group>
          <Form.Group className="mb-3" controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="direccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
          </Form.Group>

          {/* Campo Notas */}
          <Form.Group className="mb-3" controlId="notas">
            <Form.Label>Notas</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              name="notas" 
              value={formData.notas} 
              onChange={handleChange} 
              placeholder="Escribe alguna nota adicional sobre el proveedor" 
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>{proveedor ? 'Guardar' : 'Crear'}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function Proveedores() {
  const { auth } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(null);

  useEffect(() => {
    if (!auth?.token) return;
    fetch('http://localhost:3001/api/proveedores', {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProveedores(data))
      .catch(err => console.error('Error al cargar proveedores:', err));
  }, [auth]);

  const handleOpenNew = () => {
    setProveedorEdit(null);
    setShowForm(true);
  };

  const handleSaveProveedor = async (proveedor) => {
    const method = proveedor.id ? 'PUT' : 'POST';
    const url = proveedor.id
      ? `http://localhost:3001/api/proveedores/${proveedor.id}`
      : 'http://localhost:3001/api/proveedores';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(proveedor),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al guardar proveedor');
        return;
      }

      if (proveedor.id) {
        setProveedores(prev => prev.map(p => (p.id === data.id ? data : p)));
      } else {
        setProveedores(prev => [...prev, data]);
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este proveedor?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/proveedores/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al eliminar proveedor');
        return;
      }

      setProveedores(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
    }
  };

  const handleEdit = (proveedor) => {
    setProveedorEdit(proveedor);
    setShowForm(true);
  };

  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.telefono.includes(search)
  );

  return (
    <Container className="py-3" style={{ maxWidth: 900 }}>
      <Row className="mb-3 align-items-center">
        <Col xs={8} sm={6}>
          <Form.Control
            placeholder="Buscar por nombre o teléfono"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={4} sm={6} className="text-end">
          <Button onClick={handleOpenNew}>Nuevo Proveedor</Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Notas</th> {/* agregado */}
            <th style={{ width: '110px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProveedores.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">No se encontraron proveedores</td>
            </tr>
          ) : (
            filteredProveedores.map(p => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td>{p.email}</td>
                <td>{p.direccion}</td>
                <td>{p.notas}</td> {/* agregado */}
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(p)}
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <ProveedorForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveProveedor}
        proveedor={proveedorEdit}
      />
    </Container>
  );
}
