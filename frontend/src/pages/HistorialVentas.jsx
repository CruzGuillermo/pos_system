import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";
import DetalleVentaModal from "./DetalleVentaModal";

export default function HistorialVentas({ show, onClose }) {
  const { auth } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    if (!show) return;

    const cargarVentas = async () => {
      try {
        const res = await fetch("https://pos-system-t5am.onrender.com/api/ventas", {
          headers: { Authorization: "Bearer " + auth.token },
        });
        const data = await res.json();
        console.log("Ventas cargadas:", data);
        setVentas(data);
      } catch {
        setError("Error al cargar historial de ventas");
      }
    };

    cargarVentas();
  }, [show, auth.token]);

  const handleReimprimir = (id) => {
    window.open(`https://pos-system-t5am.onrender.com/api/ventas/${id}/ticket`, "_blank");
  };

  const handleAnularVenta = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Anular esta venta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`https://pos-system-t5am.onrender.com/api/ventas/${id}/anular`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Error al anular venta");

      setVentas((prev) =>
        prev.map((v) => (v.id === id ? { ...v, estado: "anulada" } : v))
      );

      Swal.fire({
        title: "Venta anulada",
        text: "La venta fue anulada correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo anular la venta", "error");
      console.error(error);
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const res = await fetch(`https://pos-system-t5am.onrender.com/api/ventas/${id}`, {
        headers: { Authorization: "Bearer " + auth.token },
      });
      const data = await res.json();
      console.log("Detalle de venta:", data);
      setVentaSeleccionada(data);
      setShowDetalle(true);
    } catch {
      Swal.fire("Error", "No se pudo cargar el detalle de la venta", "error");
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Historial de Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Cliente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr
                  key={v.id}
                  style={{
                    backgroundColor: v.estado === "anulada" ? "#f5c9cdff" : "transparent",
                  }}
                >
                  <td>
                    {new Date(v.fecha).toLocaleString()}
                    {v.estado === "anulada" && (
                      <div style={{ color: "red", fontWeight: "bold", fontSize: "0.85rem" }}>
                        ANULADA
                      </div>
                    )}
                  </td>
                  <td>{v.codigo}</td>
                  <td>${v.total}</td>
                  <td>{v.metodo_pago}</td>
                  <td>{v.cliente_nombre || "Consumidor Final"}</td>
                  <td>
                    <Button size="sm" variant="info" onClick={() => handleVerDetalle(v.id)}>
                      Detalle
                    </Button>{" "}
                    <Button size="sm" onClick={() => handleReimprimir(v.id)}>
                      Ticket
                    </Button>{" "}
                    {v.estado === "activa" && (
                      <Button size="sm" variant="danger" onClick={() => handleAnularVenta(v.id)}>
                        Anular
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {ventaSeleccionada && (
        <DetalleVentaModal
          show={showDetalle}
          onHide={() => setShowDetalle(false)}
          venta={ventaSeleccionada}
        />
      )}
    </>
  );
}
