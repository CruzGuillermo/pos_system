import React from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";

export default function BuscadorProductos({
  busqueda,
  productosFiltrados,
  loadingProductos,
  handleBusquedaChange,
  agregarProducto,
  lectorActivo,
  setLectorActivo,
  inputBusquedaRef,
}) {
  return (
    <Row className="mb-3">
      <Col md={8} style={{ position: "relative" }}>
        <Form.Group controlId="busqueda_producto">
          <Form.Label>Buscar producto (F2)</Form.Label>
          <Form.Control
            ref={inputBusquedaRef}
            type="text"
            placeholder="Buscar producto"
            value={busqueda}
            onChange={handleBusquedaChange}
            disabled={lectorActivo}
            autoComplete="off"
          />
        </Form.Group>
        {loadingProductos && (
          <Spinner
            animation="border"
            size="sm"
            className="position-absolute top-50 end-0 translate-middle-y me-2"
          />
        )}
        {busqueda && productosFiltrados.length > 0 && (
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #ccc",
              marginTop: 2,
              padding: 5,
              background: "white",
              position: "absolute",
              zIndex: 1000,
              width: "100%",
              borderRadius: 4,
            }}
          >
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderBottom: "1px solid #eee",
                  transition: "background-color 0.15s",
                }}
                onClick={() => agregarProducto(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") agregarProducto(p);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Agregar producto ${p.nombre}`}
              >
                <strong>{p.nombre}</strong> - ${p.precio?.toFixed(2) || "0.00"}
              </div>
            ))}
          </div>
        )}
      </Col>
      <Col md={4} className="d-flex align-items-center mt-4">
        <Form.Check
          type="checkbox"
          label="Lector Código Barras (F3)"
          checked={lectorActivo}
          onChange={() => setLectorActivo(!lectorActivo)}
        />
      </Col>
    </Row>
  );
}
