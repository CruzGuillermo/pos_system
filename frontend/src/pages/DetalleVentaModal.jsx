import React from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";
import { FaMoneyBillWave, FaUser, FaShoppingCart, FaCalendarAlt } from "react-icons/fa";

const DetalleVentaModal = ({ show, onHide, venta }) => {
  if (!venta) return null;

  const estadoColor = {
    activa: "success",
    anulada: "danger",
    pendiente: "warning",
  };

  // Fondo rojo claro si la venta está anulada
  const modalBodyStyle =
    venta.estado === "anulada"
      ? { backgroundColor: "#f8d7da" } // rojo claro
      : {};

  const textoEstado =
    venta.estado === "anulada" ? (
      <strong className="text-danger">{venta.estado}</strong>
    ) : (
      venta.estado
    );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaShoppingCart className="me-2" />
          Detalle de Venta #{venta.id}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={modalBodyStyle}>
        <p>
          <FaCalendarAlt className="me-2" />
          <strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}
        </p>
        <p>
          <FaUser className="me-2" />
          <strong>Cliente:</strong> {venta.cliente_nombre || "Consumidor final"}
        </p>
        <p>
          <strong>Usuario:</strong> {venta.usuario}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <Badge bg={estadoColor[venta.estado] || "secondary"}>
            {textoEstado}
          </Badge>
        </p>

        <h5 className="mt-4">🛒 Productos:</h5>
        {venta.detalle?.length ? (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalle.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.nombre_producto}</td>
                  <td>{item.cantidad}</td>
                  <td>${item.precio_unitario.toFixed(2)}</td>
                  <td>${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No hay productos para esta venta.</p>
        )}

        <h5 className="mt-4">💳 Pagos:</h5>
        {venta.pagos?.length ? (
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Método</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {venta.pagos.map((pago, idx) => (
                <tr key={idx}>
                  <td>
                    <FaMoneyBillWave className="me-2 text-success" />
                    {pago.tipo_pago || "Método desconocido"}
                  </td>
                  <td>${pago.monto?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No se registraron pagos.</p>
        )}

        <p className="mt-3 fs-5">
          <strong>Total:</strong>{" "}
          <span className="text-primary">${venta.total.toFixed(2)}</span>
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleVentaModal;
