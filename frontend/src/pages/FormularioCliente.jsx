import React from "react";
import { Row, Col, Form } from "react-bootstrap";

export default function FormularioCliente({ register, errors }) {
  return (
    <Row className="mb-3">
      <Col md={4}>
        <Form.Group controlId="cliente_nombre">
          <Form.Label>Nombre Cliente</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre completo"
            isInvalid={!!errors.cliente_nombre}
            {...register("cliente_nombre")}
          />
          <Form.Control.Feedback type="invalid">
            {errors.cliente_nombre?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group controlId="cliente_domicilio">
          <Form.Label>Domicilio</Form.Label>
          <Form.Control
            type="text"
            placeholder="Domicilio"
            isInvalid={!!errors.cliente_domicilio}
            {...register("cliente_domicilio")}
          />
          <Form.Control.Feedback type="invalid">
            {errors.cliente_domicilio?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group controlId="cliente_dni">
          <Form.Label>DNI</Form.Label>
          <Form.Control
            type="text"
            placeholder="Documento"
            isInvalid={!!errors.cliente_dni}
            {...register("cliente_dni")}
          />
          <Form.Control.Feedback type="invalid">
            {errors.cliente_dni?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  );
}
