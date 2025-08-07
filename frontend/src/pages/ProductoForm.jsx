import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; // ajusta la ruta si es distinta
import JsBarcode from 'jsbarcode';

function ProductoForm({ show, onHide, onSave, producto }) {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    unidad_id: '',
    codigo_barras: '',
  });

  const codigoBarrasRef = useRef(null);

useEffect(() => {
  if (show && codigoBarrasRef.current) {
    // Foco automático al abrir el modal
    setTimeout(() => {
      codigoBarrasRef.current.focus();
    }, 200);
  }
}, [show]);


  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
  if (formData.codigo_barras) {
    JsBarcode("#barcode", formData.codigo_barras, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      width: 2,
      height: 60,
    });
  }
}, [formData.codigo_barras]);

  useEffect(() => {
    if (producto) {
      setFormData({
        codigo: producto.codigo || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio !== undefined ? producto.precio.toString() : '',
        categoria_id: producto.categoria_id || '',
        unidad_id: producto.unidad_id || '',
        codigo_barras: producto.codigo_barras || '',
      });
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        categoria_id: '',
        unidad_id: '',
        codigo_barras: '',
      });
    }
  }, [producto]);

  useEffect(() => {
    if (!auth?.token) return;

    fetch('https://pos-system-t5am.onrender.com/api/categorias', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));

    fetch('https://pos-system-t5am.onrender.com/api/unidades', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(() => setUnidades([]));
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.codigo.trim()) return alert('El código es obligatorio');
    if (!formData.nombre.trim()) return alert('El nombre es obligatorio');
    if (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) < 0)
      return alert('Precio inválido');
    if (!formData.categoria_id) return alert('Debe seleccionar una categoría');
    if (!formData.unidad_id) return alert('Debe seleccionar una unidad');

    onSave({
      ...formData,
      precio: parseFloat(formData.precio),
      id: producto?.id,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{producto ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="codigo">
            <Form.Label>Código</Form.Label>
            <Form.Control
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              disabled={!!producto}
            />
          </Form.Group>

     <Form.Group className="mb-3" controlId="codigo_barras">
  <Form.Label>Código de Barras</Form.Label>
  <Form.Control
    type="text"
    name="codigo_barras"
    ref={codigoBarrasRef}
    placeholder="Escaneá aquí o dejalo en blanco para autogenerar"
    value={formData.codigo_barras}
    onChange={handleChange}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    }}
  />
  {formData.codigo_barras && (
    <div className="mt-2 text-center">
      <svg id="barcode" />
      <div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-1"
          onClick={() => window.print()}
        >
          Imprimir Etiqueta
        </Button>
      </div>
    </div>
  )}
</Form.Group>



          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="descripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="precio">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="categoria_id">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
            >
              <option value="">-- Seleccione categoría --</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="unidad_id">
            <Form.Label>Unidad</Form.Label>
            <Form.Select
              name="unidad_id"
              value={formData.unidad_id}
              onChange={handleChange}
            >
              <option value="">-- Seleccione unidad --</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>{producto ? 'Guardar' : 'Crear'}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductoForm;
