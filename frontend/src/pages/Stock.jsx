import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from "../contexts/AuthContext";

function StockModal({ show, onHide, onSave, modalType, productos, form, setForm, error }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const isDisabled = !form.producto_id || form.stock === '' || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{modalType === 'crear' ? 'Agregar Stock' : 'Editar Stock'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3" controlId="producto_id">
            <Form.Label>Producto</Form.Label>
            <Form.Select
              name="producto_id"
              value={form.producto_id}
              onChange={handleChange}
              disabled={modalType === 'editar'}
            >
              <option value="">Seleccione un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="stock">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={isDisabled}>
          {modalType === 'crear' ? 'Agregar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function Stock() {
  const { auth } = useAuth();
  const [stock, setStock] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ producto_id: '', stock: '' });
  const [modalType, setModalType] = useState('crear');
  const [editId, setEditId] = useState(null);

  const fetchStock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/stock/sucursal', {
        headers: { Authorization: 'Bearer ' + auth.token }
      });
      if (!res.ok) throw new Error('Error cargando stock');
      const data = await res.json();
      setStock(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const fetchProductos = async () => {
    setLoadingProductos(true);
    try {
     const res = await fetch('http://localhost:3001/api/productos', {
  headers: { Authorization: `Bearer ${auth.token}` },
    })
      if (!res.ok) throw new Error('Error cargando productos');
      const data = await res.json();
      setProductos(data);
    } catch (e) {
      setError('Error cargando productos');
    }
    setLoadingProductos(false);
  };

  useEffect(() => {
    if (auth) {
      fetchStock();
      fetchProductos();
    }
  }, [auth]);

  const openCrearModal = () => {
    setModalType('crear');
    setForm({ producto_id: '', stock: '' });
    setEditId(null);
    setModalError('');
    setShowModal(true);
  };

  const openEditarModal = (item) => {
    setModalType('editar');
    setForm({ producto_id: item.producto_id, stock: item.stock.toString() });
    setEditId(item.id);
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setModalError('');
    if (!form.producto_id || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) {
      setModalError('Seleccioná producto y cantidad válida (no negativa)');
      return;
    }
    try {
      const url = modalType === 'crear'
  ? 'http://localhost:3001/api/stock'
  : `http://localhost:3001/api/stock/${editId}`;

      const method = modalType === 'crear' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        },
        body: JSON.stringify({ producto_id: form.producto_id, stock: parseInt(form.stock) }),
      });
      if (!res.ok) {
        const err = await res.json();
        setModalError(err.error || 'Error en la operación');
        return;
      }
      setShowModal(false);
      fetchStock();
    } catch {
      setModalError('Error comunicándose con el servidor');
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: 900 }}>
      <h3 className="mb-3">Stock de Productos</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button className="mb-3" onClick={openCrearModal} disabled={loadingProductos || loading}>
        {loadingProductos || loading ? (
          <>
            <Spinner animation="border" size="sm" /> Cargando...
          </>
        ) : (
          'Agregar nuevo stock'
        )}
      </Button>

      {loading ? (
        <p>Cargando stock...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad en stock</th>
              <th style={{ width: '120px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr><td colSpan="3" className="text-center">No hay stock registrado</td></tr>
            ) : (
              stock.map(item => (
                <tr key={item.id}>
                  <td>{item.producto}</td>
                  <td>{item.stock}</td>
                  <td className="text-center">
                    <Button size="sm" variant="outline-primary" onClick={() => openEditarModal(item)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      <StockModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSubmit}
        modalType={modalType}
        productos={productos}
        form={form}
        setForm={setForm}
        error={modalError}
      />
    </Container>
  );
}
