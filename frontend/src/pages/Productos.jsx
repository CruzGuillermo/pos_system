import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
} from 'react-bootstrap';
import ProductoForm from './ProductoForm';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function Productos() {
  const { auth } = useAuth();
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const cargarProductos = () => {
    if (!auth?.token) return;
    setLoading(true);
    setError('');
    fetch('https://pos-system-t5am.onrender.com/api/productos', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('No autorizado o error al cargar productos');
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, [auth]);

  const filteredProductos = productos.filter(p =>
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.codigo_barras || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenNew = () => {
    setProductoEdit(null);
    setShowForm(true);
  };

  const handleSaveProducto = (producto) => {
    if (!auth?.token) return alert('No autorizado');

    const method = producto.id ? 'PUT' : 'POST';
    const url = producto.id
      ? `https://pos-system-t5am.onrender.com/api/productos/${producto.id}`
      : 'https://pos-system-t5am.onrender.com/api/productos';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(producto),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || 'Error desconocido');
          });
        }
        return res.json();
      })
      .then(() => {
        setShowForm(false);
        cargarProductos();
      })
      .catch(err => {
        alert('Error al guardar producto: ' + err.message);
      });
  };

  const handleDelete = (id) => {
    if (!auth?.token) return alert('No autorizado');
    if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;

    fetch(`https://pos-system-t5am.onrender.com/api/productos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al eliminar producto');
        return res.json();
      })
      .then(() => cargarProductos())
      .catch(err => alert(err.message));
  };

  const handleEdit = (producto) => {
    setProductoEdit(producto);
    setShowForm(true);
  };

  return (
    <Container className="py-3" style={{ maxWidth: 900 }}>
      <Row className="mb-2 align-items-center">
        
        <Col xs={6} sm={4}>
          <Form.Control
            ref={searchInputRef}
            placeholder="Escaneá o buscá por código, nombre o código de barras"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            disabled={loading}
            autoFocus
          />
        </Col>
        <Col xs={12} sm={4} className="text-end mt-2 mt-sm-0">
          <Button onClick={handleOpenNew} disabled={loading}>Nuevo Producto</Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {loading ? (
        <div>Cargando productos...</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Código</th>
              <th>Código Barras</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Precio</th>
              <th style={{ width: '110px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No se encontraron productos</td>
              </tr>
            ) : (
              filteredProductos.map(p => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.codigo_barras || '-'}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.categoria}</td>
                  <td>{p.unidad}</td>
                  <td>${p.precio.toFixed(2)}</td>
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
      )}

      <ProductoForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveProducto}
        producto={productoEdit}
      />
    </Container>
  );
}
