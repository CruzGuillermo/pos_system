import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Row,
  Col,
  Spinner,
  Table,
  Alert,
  Form,
  Button,
} from 'react-bootstrap';
import axios from 'axios';

export default function Gastos() {
  const { auth } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Formulario
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');

  if (!auth || !auth.sucursal_id) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2">Cargando sesión...</p>
      </Container>
    );
  }

  const sucursal_id = auth.sucursal_id;

  const obtenerGastos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/gastos/sucursal/${sucursal_id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setGastos(response.data);
    } catch (err) {
      console.error('Error al obtener gastos:', err);
      setError('Error al cargar los gastos');
    } finally {
      setCargando(false);
    }
  };

  const registrarGasto = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!categoria || !descripcion || !monto || isNaN(monto)) {
      setError('Por favor completá todos los campos correctamente.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:3001/api/gastos',
        { categoria, descripcion, monto: parseFloat(monto) },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setMensaje('Gasto registrado correctamente');
      setCategoria('');
      setDescripcion('');
      setMonto('');
      obtenerGastos(); // recarga la tabla
    } catch (err) {
      console.error('Error al registrar gasto:', err);
      setError(
        err.response?.data?.error ||
          'No se pudo registrar el gasto. Verifique caja abierta.'
      );
    }
  };

  useEffect(() => {
    obtenerGastos();
  }, [sucursal_id]);

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h3 className="text-center">📋 Gastos por sucursal</h3>
        </Col>
      </Row>

      <Row className="mb-3 mt-4">
        <Col md={8} lg={6} className="mx-auto">
          <Form onSubmit={registrarGasto}>
            <Form.Group className="mb-2">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ej: Insumos, Servicios..."
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Compra de papel"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 1500.00"
                min="0"
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Registrar Gasto
              </Button>
            </div>
          </Form>

          {mensaje && <Alert variant="success" className="mt-3">{mensaje}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>

      <hr />

      {cargando ? (
        <div className="text-center mt-3">
          <Spinner animation="grow" variant="secondary" />
          <p>Cargando gastos...</p>
        </div>
      ) : gastos.length === 0 ? (
        <Alert variant="info">No hay gastos registrados.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
                <td>{gasto.categoria}</td>
                <td>{gasto.descripcion}</td>
                <td>${parseFloat(gasto.monto).toFixed(2)}</td>
                <td>{gasto.usuario}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
