import React from 'react';
import { Card, Container, Badge, ListGroup } from 'react-bootstrap';

export default function Inicio() {
  const now = new Date();

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0">
        <Card.Body>
          <h2 className="mb-3">👋 Bienvenido al POS</h2>
          <p className="text-muted mb-4">
            {now.toLocaleDateString()} — {now.toLocaleTimeString()}
          </p>

          <p className="fw-bold">
            Tu sistema inteligente de ventas, rápido y simple.
          </p>

          <ListGroup variant="flush" className="mb-3">
            <ListGroup.Item><Badge bg="success">✔</Badge> Ventas con impresión automática</ListGroup.Item>
            <ListGroup.Item><Badge bg="info">✔</Badge> Stock y alertas por sucursal</ListGroup.Item>
            <ListGroup.Item><Badge bg="primary">✔</Badge> Cajas, usuarios y reportes</ListGroup.Item>
            <ListGroup.Item><Badge bg="warning">✔</Badge> Clientes y cuenta corriente</ListGroup.Item>
          </ListGroup>

          <p className="text-end text-muted small mt-4">
            Desarrollado por Guillermo · v1.0.0
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
