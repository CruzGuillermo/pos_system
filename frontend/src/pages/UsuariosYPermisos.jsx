import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Alert, Spinner,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

export default function UsuariosYPermisos() {
  const { auth } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermisos, setShowPermisos] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    rol: 'usuario',
  });
  const [alerta, setAlerta] = useState('');

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/auth/usuarios/sucursal', {
        headers: {
          'Authorization': `Bearer ${auth?.token}`,
        },
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCrearOActualizar = async (e) => {
    e.preventDefault();

    const url = usuarioSeleccionado
      ? `http://localhost:3001/api/auth/usuarios/${usuarioSeleccionado.id}`
      : 'http://localhost:3001/api/auth/register';

    const method = usuarioSeleccionado ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({
          ...form,
          sucursal_id: auth.sucursal_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar usuario');

      setAlerta(usuarioSeleccionado ? '✅ Usuario actualizado' : '✅ Usuario creado');
      setShowModal(false);
      setUsuarioSeleccionado(null);
      fetchUsuarios();
    } catch (err) {
      setAlerta('❌ ' + err.message);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este usuario?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/auth/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth?.token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar');
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert('Error al eliminar usuario');
    }
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setForm({
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      contrasena: '', // Dejar en blanco
      rol: usuario.rol,
    });
    setShowModal(true);
  };

  const abrirModalPermisos = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowPermisos(true);
  };

  return (
    <>
      <Row className="mb-3">
        <Col><h4>👥 Usuarios y Permisos</h4></Col>
        <Col className="text-end">
          <Button onClick={() => { setForm({ nombre: '', usuario: '', contrasena: '', rol: 'usuario' }); setUsuarioSeleccionado(null); setShowModal(true); }}>
            ➕ Crear Usuario
          </Button>
        </Col>
      </Row>

      {alerta && <Alert variant="info" onClose={() => setAlerta('')} dismissible>{alerta}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Sucursal</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.usuario}</td>
                <td>{u.rol}</td>
                <td>{u.sucursal_id}</td>
                <td>
                  <Button size="sm" variant="outline-secondary" onClick={() => abrirModalPermisos(u)}>Acciones</Button>
                </td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => abrirModalEditar(u)}>Editar</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => eliminarUsuario(u.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* MODAL CREAR / EDITAR USUARIO */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{usuarioSeleccionado ? '✏️ Editar Usuario' : '➕ Crear Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearOActualizar}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control name="usuario" value={form.usuario} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña {usuarioSeleccionado ? '(opcional)' : ''}</Form.Label>
              <Form.Control name="contrasena" type="password" value={form.contrasena} onChange={handleChange} required={!usuarioSeleccionado} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={form.rol} onChange={handleChange}>
                <option value="usuario">Usuario</option>
                <option value="supervisor">Supervisor</option>
                <option value="administrador">Administrador</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="success">Guardar</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL DE ACCIONES / PERMISOS */}
      <Modal show={showPermisos} onHide={() => setShowPermisos(false)}>
        <Modal.Header closeButton>
          <Modal.Title>⚙️ Acciones de {usuarioSeleccionado?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>✔️ Abrir caja</li>
            <li>✔️ Cerrar caja</li>
            <li>✔️ Realizar ventas</li>
            <li>✔️ Aplicar descuentos</li>
            <li>✔️ Anular ventas</li>
            <li>✔️ Ver reportes</li>
            {/* Más adelante: checkbox o switches editables */}
          </ul>
          <small className="text-muted">⚠️ Simulación: estos permisos no están vinculados aún a la lógica.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermisos(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
