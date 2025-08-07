import React from "react";
import { Table, Form, Button } from "react-bootstrap";

export default function TablaCarrito({
  carrito,
  quitarProducto,
  cambiarCantidad,
  totalBruto,
  register,
  errors,
  tipoDescuento,
  totalFinal,
}) {
  return (
    <div
      style={{
        flex: "1 1 auto",
        overflowY: "auto",
        marginTop: "10px",
        backgroundColor: "white",
        borderRadius: "6px",
        border: "1px solid #ddd",
        maxHeight: 350,
      }}
    >
      <Table
        striped
        bordered
        hover
        responsive
        style={{ minWidth: "100%", tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <th>Producto</th>
            <th style={{ width: 100 }}>Cantidad</th>
            <th style={{ width: 130 }}>Precio Unitario</th>
            <th style={{ width: 130 }}>Subtotal</th>
            <th style={{ width: 90 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
  {carrito.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center py-4">
        No hay productos agregados
      </td>
    </tr>
  ) : (
    carrito.map((p) => {
      // Conversión segura a número, fallback 0 o 1 para cantidad
      const cantidad = Number(p?.cantidad) > 0 ? Number(p.cantidad) : 1;
      const precioUnitario = Number(p?.precio) || 0;
      const nombre = p?.nombre || p?.nombre_producto || "Sin nombre";

      // Debug para ver valores en consola

      return (
        <tr key={p.id}>
          <td>{nombre}</td>
          <td>
            <Form.Control
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) =>
                cambiarCantidad(
                  p.id,
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              aria-label={`Cantidad de ${nombre}`}
            />
          </td>
          <td>${precioUnitario.toFixed(2)}</td>
          <td>${(precioUnitario * cantidad).toFixed(2)}</td>
          <td>
            <Button
              size="sm"
              variant="danger"
              onClick={() => quitarProducto(p.id)}
              aria-label={`Quitar producto ${nombre}`}
            >
              Quitar
            </Button>
          </td>
        </tr>
      );
    })
  )}
</tbody>

        <tfoot>
         <tr>
    <td colSpan="3" className="text-end fw-bold">
      Total bruto:
    </td>
    <td colSpan="2" className="fw-bold">
      ${Number(totalBruto ?? 0).toFixed(2)}
    </td>
  </tr>
          <tr>
            <td colSpan="2" className="text-end fw-bold">
              Descuento:
            </td>
            <td colSpan="1">
              <Form.Control
                type="number"
                min="0"
                max={tipoDescuento === "%" ? 100 : totalBruto}
                {...register("descuento", {
                  min: 0,
                  max: tipoDescuento === "%" ? 100 : totalBruto,
                  valueAsNumber: true,
                })}
                isInvalid={!!errors.descuento}
              />
              <Form.Control.Feedback type="invalid">
                {errors.descuento?.message}
              </Form.Control.Feedback>
            </td>
            <td colSpan="2">
              <Form.Select {...register("tipoDescuento")} aria-label="Tipo de descuento">
                <option value="%">Porcentaje (%)</option>
                <option value="$">Monto ($)</option>
              </Form.Select>
            </td>
          </tr>
         <tr>
    <td colSpan="3" className="text-end fw-bold">
      Total final:
    </td>
    <td colSpan="2" className="fw-bold">
      ${Number(totalFinal ?? 0).toFixed(2)}
    </td>
  </tr>
        </tfoot>
      </Table>
    </div>
  );
}
