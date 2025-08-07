import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

export default function CajaDashboard() {
  const { auth } = useAuth();
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [ultimaCajaCerrada, setUltimaCajaCerrada] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState("ingreso");

  const [modalAbrirCaja, setModalAbrirCaja] = useState(false);
  const [modalCerrarCaja, setModalCerrarCaja] = useState(false);
  const [dineroRendido, setDineroRendido] = useState("");

  useEffect(() => {
    if (auth?.token) {
      cargarCaja();
    }
  }, [auth]);

  const cargarCaja = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/cajas", {
        headers: {
          Authorization: "Bearer " + auth.token,
        },
      });
      if (!res.ok) throw new Error("Error al obtener cajas");
      const cajas = await res.json();
      const abierta = cajas.find((c) => c.fecha_cierre === null);
      if (abierta) {
        setCajaAbierta(abierta);
        setUltimaCajaCerrada(null);
        await cargarMovimientos(abierta.id);
      } else {
        // Si no hay caja abierta, buscamos la última caja cerrada
        const res2 = await fetch(
          "http://localhost:3001/api/cajas/ultima-cerrada",
          {
            headers: {
              Authorization: "Bearer " + auth.token,
            },
          }
        );
        if (!res2.ok) throw new Error("Error al obtener última caja cerrada");
        const ultimaCerrada = await res2.json();
        setUltimaCajaCerrada(ultimaCerrada);
        setCajaAbierta(null);
        if (ultimaCerrada?.id) {
          await cargarMovimientos(ultimaCerrada.id);
        } else {
          setMovimientos([]);
        }
      }
    } catch (e) {
      console.error("Error en cargarCaja:", e);
      setError("Error al verificar caja");
      setMovimientos([]);
      setCajaAbierta(null);
      setUltimaCajaCerrada(null);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async (caja_id) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/cajas/${caja_id}/movimientos`,
        {
          headers: {
            Authorization: "Bearer " + auth.token,
          },
        }
      );
      if (!res.ok) throw new Error("Error al obtener movimientos");
      const data = await res.json();
      setMovimientos(data);
    } catch (e) {
      console.error("Error en cargarMovimientos:", e);
      setError("Error al cargar movimientos");
      setMovimientos([]);
    }
  };

  // Variables resumen
  const caja = cajaAbierta || ultimaCajaCerrada;
  const montoInicialNum = Number(caja?.monto_inicial) || 0;
  const totalIngresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + Number(m.monto), 0);
  const totalEgresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((acc, m) => acc + Number(m.monto), 0);
  const montoCalculado = montoInicialNum + totalIngresos - totalEgresos;

  const dineroRendidoValor =
    cajaAbierta
      ? dineroRendido !== ""
        ? Number(dineroRendido)
        : ""
      : caja?.dinero_rendido || "";

  const diferencia =
    dineroRendidoValor !== ""
      ? Number(dineroRendidoValor) - montoCalculado
      : null;

  const confirmarCerrarCaja = async () => {
    if (
      dineroRendido === "" ||
      isNaN(dineroRendido) ||
      Number(dineroRendido) < 0
    ) {
      alert("Ingrese un monto válido para dinero rendido");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3001/api/cajas/cerrar/${cajaAbierta.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify({
            monto_final: montoCalculado,
            dinero_rendido: Number(dineroRendido),
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No se pudo cerrar la caja");
      }
      setSuccess("Caja cerrada correctamente");
      setCajaAbierta(null);
      setMovimientos([]);
      setError("");
      setModalCerrarCaja(false);
      setDineroRendido("");
      cargarCaja();
    } catch (e) {
      console.error("Error en cerrarCaja:", e);
      setError("Error al cerrar la caja");
    }
  };

  const exportarPDF = () => {
    alert("Función de exportar PDF - próximamente integrada");
  };

  if (loading)
    return (
      <Container className="py-4" style={{ maxWidth: 900, textAlign: "center" }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando información de caja...</p>
      </Container>
    );

  if (!caja && !ultimaCajaCerrada && !cajaAbierta) {
    return (
      <Container className="py-4" style={{ maxWidth: 900 }}>
        <h3>Gestión de Caja</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <p>No hay cajas abiertas ni registros de caja cerrada.</p>

        <Button variant="primary" onClick={() => setModalAbrirCaja(true)}>
          Abrir Caja
        </Button>

        <Modal
          show={modalAbrirCaja}
          onHide={() => setModalAbrirCaja(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Abrir Caja</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormAperturaCaja
              token={auth.token}
              onSuccess={() => {
                setModalAbrirCaja(false);
                cargarCaja();
              }}
              setError={setError}
            />
          </Modal.Body>
        </Modal>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: 900 }}>
      <h3 className="mb-4">Gestión de Caja</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Alert variant="info" className="mb-3" style={{ fontSize: "1rem" }}>
        {cajaAbierta ? (
          <>
            <strong>Caja abierta:</strong> Turno: {caja.turno} - Monto inicial: $
            {montoInicialNum.toFixed(2)}
          </>
        ) : (
          <>
            <strong>Última caja cerrada:</strong> Turno: {caja.turno} - Monto
            inicial: ${montoInicialNum.toFixed(2)} <br />
            Fecha cierre: {new Date(caja.fecha_cierre).toLocaleString()}

            <Row className="mt-3">
              <Col>
                <Button variant="primary" onClick={() => setModalAbrirCaja(true)}>
                  Abrir Caja
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Alert>

      <div className="mb-4 p-3 border rounded bg-light">
        <h5>Resumen Arqueo</h5>
        <Row>
          <Col md={6}>
            <p>
              <strong>Monto inicial:</strong> ${montoInicialNum.toFixed(2)}
            </p>
            <p className="text-success">
              <strong>Total ingresos:</strong> +${totalIngresos.toFixed(2)}
            </p>
            <p className="text-danger">
              <strong>Total egresos:</strong> -${totalEgresos.toFixed(2)}
            </p>
          </Col>
          <Col md={6}>
            <p>
              <strong>Monto calculado:</strong> ${montoCalculado.toFixed(2)}
            </p>
            <p>
              <strong>Dinero rendido:</strong>{" "}
              {dineroRendidoValor !== ""
                ? `$${Number(dineroRendidoValor).toFixed(2)}`
                : "-"}
            </p>
            <p>
              <strong>Diferencia:</strong>{" "}
              {diferencia !== null ? (
                <span style={{ color: diferencia >= 0 ? "green" : "red" }}>
                  {diferencia >= 0 ? "+" : ""}
                  ${diferencia.toFixed(2)}
                </span>
              ) : (
                "-"
              )}
            </p>
          </Col>
        </Row>
      </div>

      {cajaAbierta && (
        <Row className="mb-3">
          <Col>
            <Button
              variant="success"
              className="me-2"
              onClick={() => {
                setTipoMovimiento("ingreso");
                setModalMovimiento(true);
              }}
            >
              Registrar Ingreso
            </Button>
            <Button
              variant="danger"
              className="me-2"
              onClick={() => {
                setTipoMovimiento("egreso");
                setModalMovimiento(true);
              }}
            >
              Registrar Egreso
            </Button>
            <Button
              variant="warning"
              onClick={() => setModalCerrarCaja(true)}
            >
              Cerrar Caja
            </Button>
          </Col>
        </Row>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Descripción</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Sin movimientos
              </td>
            </tr>
          ) : (
            movimientos.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.fecha).toLocaleString()}</td>
                <td
                  className={
                    m.tipo === "ingreso"
                      ? "text-success"
                      : m.tipo === "egreso"
                      ? "text-danger"
                      : ""
                  }
                >
                  {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
                </td>
                <td>${Number(m.monto).toFixed(2)}</td>
                <td>{m.descripcion || "-"}</td>
                <td>{m.usuario_nombre}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {cajaAbierta && (
        <>
          <ModalMovimientoCaja
            show={modalMovimiento}
            tipo={tipoMovimiento}
            onHide={() => setModalMovimiento(false)}
            caja_id={cajaAbierta.id}
            onSuccess={() => {
              setModalMovimiento(false);
              cargarMovimientos(cajaAbierta.id);
            }}
            token={auth.token}
          />

          <Modal
            show={modalCerrarCaja}
            onHide={() => setModalCerrarCaja(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Cerrar Caja</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3 p-2 border rounded bg-light">
                <h5>Resumen Arqueo</h5>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Monto inicial:</strong> $
                      {montoInicialNum.toFixed(2)}
                    </p>
                    <p className="text-success">
                      <strong>Total ingresos:</strong> +${totalIngresos.toFixed(2)}
                    </p>
                    <p className="text-danger">
                      <strong>Total egresos:</strong> -${totalEgresos.toFixed(2)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Monto calculado:</strong> $
                      {montoCalculado.toFixed(2)}
                    </p>
                    <p>
                      <strong>Dinero rendido:</strong>{" "}
                      {dineroRendido !== ""
                        ? `$${Number(dineroRendido).toFixed(2)}`
                        : "-"}
                    </p>
                    <p>
                      <strong>Diferencia:</strong>{" "}
                      {diferencia !== null ? (
                        <span style={{ color: diferencia >= 0 ? "green" : "red" }}>
                          {diferencia >= 0 ? "+" : ""}
                          ${diferencia.toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </p>
                  </Col>
                </Row>
              </div>

              <Form.Group>
                <Form.Label>Dinero Rendido</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={dineroRendido}
                  onChange={(e) => setDineroRendido(e.target.value)}
                  placeholder="Ingrese el monto de dinero rendido"
                  autoFocus
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalCerrarCaja(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmarCerrarCaja}>
                Confirmar Cierre
              </Button>
              <Button variant="info" onClick={exportarPDF}>
                Exportar PDF
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {/* Modal apertura caja para cuando no hay caja abierta */}
      <Modal
        show={modalAbrirCaja}
        onHide={() => setModalAbrirCaja(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Abrir Caja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormAperturaCaja
            token={auth.token}
            onSuccess={() => {
              setModalAbrirCaja(false);
              cargarCaja();
            }}
            setError={setError}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

function FormAperturaCaja({ token, onSuccess, setError }) {
  const [turno, setTurno] = useState("Mañana");
  const [montoInicial, setMontoInicial] = useState("");

  const abrirCaja = async () => {
    setError("");
    if (montoInicial === "" || isNaN(montoInicial) || Number(montoInicial) < 0) {
      setError("Ingrese un monto inicial válido");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/cajas/abrir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          turno,
          monto_inicial: parseFloat(montoInicial),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al abrir caja");
      }
      setError("");
      onSuccess();
    } catch (e) {
      console.error("Error en abrirCaja:", e);
      setError(e.message);
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Turno</Form.Label>
        <Form.Select value={turno} onChange={(e) => setTurno(e.target.value)}>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Monto Inicial</Form.Label>
        <Form.Control
          type="number"
          min="0"
          step="0.01"
          value={montoInicial}
          onChange={(e) => setMontoInicial(e.target.value)}
          placeholder="Ej: 1000.00"
          autoFocus
        />
      </Form.Group>
      <Button variant="primary" onClick={abrirCaja} className="w-100">
        Abrir Caja
      </Button>
    </Form>
  );
}

function ModalMovimientoCaja({ show, onHide, tipo, caja_id, token, onSuccess }) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const registrar = async () => {
    if (monto === "" || isNaN(monto) || Number(monto) <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/cajas/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          tipo,
          caja_id,
          monto: parseFloat(monto),
          descripcion,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al registrar movimiento");
      }

      onSuccess();
      setMonto("");
      setDescripcion("");
    } catch (e) {
      console.error("Error en registrar movimiento:", e);
      alert(e.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <Form.Control
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 500.00"
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Opcional"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={registrar}>
          Registrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
