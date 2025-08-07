import React, { useEffect, useRef } from "react";
import { Row, Col, Form, InputGroup } from "react-bootstrap";
import { Controller, useWatch } from "react-hook-form";

export default function PagoVenta({
  metodoPago,
  register,
  control,
  setValue,
  errors,
  totalFinal,
  setPagoValido,
  ventaCreada, // ← nuevo
}) {
  const metodos = ["efectivo", "tarjeta", "transferencia", "qr"];

  const pagosMixtos = useWatch({
    control,
    name: metodos.map((m) => `pagoMixto_${m}`),
  });

  const lastChanged = useRef(null);

  useEffect(() => {
    if (metodoPago !== "mixto") {
      setPagoValido(true);
      return;
    }

    let suma = pagosMixtos.reduce((acc, val) => acc + Number(val || 0), 0);
    const diferencia = suma - totalFinal;

    if (diferencia > 0.01 && lastChanged.current) {
      const index = metodos.indexOf(lastChanged.current);
      if (index !== -1) {
        const currentValue = Number(pagosMixtos[index] || 0);
        const nuevoValor = currentValue - diferencia;

        if (nuevoValor >= 0) {
          setValue(`pagoMixto_${lastChanged.current}`, Number(nuevoValor.toFixed(2)));
        }
      }
    }

    const valido = Math.abs(diferencia) < 0.01;
    setPagoValido(valido);
  }, [JSON.stringify(pagosMixtos), metodoPago, totalFinal]);

  return (
    <>
      <Row className="mt-3">
        <Col md={6}>
          <Form.Group controlId="metodoPago">
            <Form.Label>Método de Pago</Form.Label>
            <Form.Select {...register("metodoPago")} aria-label="Método de Pago">
              <option value="efectivo">Efectivo (F7)</option>
              <option value="tarjeta">Tarjeta (F11)</option>
              <option value="transferencia">Transferencia (F9)</option>
              <option value="qr">QR (F2)</option>
              <option value="mixto">Pago Mixto</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {metodoPago === "mixto" && (
          <Col md={6}>
            <Form.Label>Detalles Pago Mixto</Form.Label>
            <Row>
              {metodos.map((key) => (
                <Col key={key} xs={6} className="mb-2">
                  <InputGroup>
                    <InputGroup.Text>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </InputGroup.Text>
                    <Controller
                      name={`pagoMixto_${key}`}
                      control={control}
                      rules={{
                        min: 0,
                        validate: (value) => {
                          if (value < 0) return "No puede ser negativo";
                          return true;
                        },
                        valueAsNumber: true,
                      }}
                      render={({ field }) => (
                        <Form.Control
                          type="number"
                          step="0.01"
                          min={0}
                          {...field}
                          onChange={(e) => {
                            lastChanged.current = key;
                            field.onChange(e);
                          }}
                          isInvalid={!!errors[`pagoMixto_${key}`]}
                          aria-label={`Pago mixto ${key}`}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`pagoMixto_${key}`]?.message}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Col>
              ))}
            </Row>

            {/* Ocultar mensaje si ya se realizó la venta */}
            {!ventaCreada && (
              <Form.Text
                className={
                  Math.abs(pagosMixtos.reduce((a, v) => a + Number(v || 0), 0) - totalFinal) < 0.01
                    ? "text-success"
                    : "text-danger"
                }
              >
                {(() => {
                  const suma = pagosMixtos.reduce((a, v) => a + Number(v || 0), 0);
                  const diferencia = totalFinal - suma;

                  if (Math.abs(diferencia) < 0.01) {
                    return `✅ Pago completo: $${suma.toFixed(2)} / $${totalFinal.toFixed(2)}`;
                  } else if (diferencia > 0) {
                    return `💰 Aún faltan $${diferencia.toFixed(2)} para completar el total.`;
                  } else {
                    return `🧾 Exceso de pago: $${Math.abs(diferencia).toFixed(2)} (vuelto).`;
                  }
                })()}
              </Form.Text>
            )}
          </Col>
        )}
      </Row>
    </>
  );
}
