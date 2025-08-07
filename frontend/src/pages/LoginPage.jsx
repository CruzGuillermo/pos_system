import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, login } = useAuth();

  const [inputUsuario, setInputUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  // Redirige si ya está logueado y está en /login
  useEffect(() => {
    if (auth && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [auth, location.pathname, navigate]);

  const handleLogin = async () => {
    if (!inputUsuario || !contrasena) {
      setError('Ingrese usuario y contraseña');
      return;
    }

    try {
      const res = await fetch('https://pos-system-t5am.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: inputUsuario, contrasena }),
      });

      const data = await res.json();
      console.log(data)

      if (!res.ok) {
        setError(data.error || 'Error desconocido al iniciar sesión');
        return;
      }

      login({
        token: data.token,
        usuario: data.usuario,
        rol: data.rol,
        sucursal_id: data.sucursal_id,
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <Container
      fluid
      className="d-flex vh-100 justify-content-center align-items-center"
    >
      <Card style={{ width: '320px', padding: '2rem' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Iniciar Sesión</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="usuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={inputUsuario}
                onChange={(e) => setInputUsuario(e.target.value)}
                placeholder="Ingrese usuario"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contrasena">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingrese contraseña"
              />
            </Form.Group>

            <Button
              variant="primary"
              className="w-100 mt-3"
              onClick={handleLogin}
            >
              Ingresar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
