import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default function Dashboard() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />

      <main className="flex-grow-1 bg-light p-3" style={{ flex: 1 }}>
        <div style={{ marginTop: '60px' }}>
          <Container fluid>
            <Outlet />
          </Container>
        </div>
      </main>
    </div>
  );
}
