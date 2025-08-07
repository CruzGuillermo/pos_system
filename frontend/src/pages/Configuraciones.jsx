import React, { useState } from 'react';
import { Container, ButtonGroup, Button, Card } from 'react-bootstrap';
import ConfiguracionSistema from './ConfiguracionSistema';
import ConfiguracionSucursal from './ConfiguracionSucursal';
import ConfiguracionImpresion from './ConfiguracionImpresion';
// import UsuariosYPermisos from './UsuariosYPermisos'; // Lo dejás importado si planeás habilitarlo después

export default function Configuraciones() {
  const [seccion, setSeccion] = useState('');

  const renderContenido = () => {
    switch (seccion) {
      // case 'usuarios': return <UsuariosYPermisos />; // Desactivado por ahora
      case 'sucursal': return <ConfiguracionSucursal />;
      case 'impresion': return <ConfiguracionImpresion />;
      case 'sistema': return <ConfiguracionSistema />;
      default:
        return (
          <Card body className="text-center">
            <p>Seleccioná una opción para comenzar a configurar el sistema POS.</p>
          </Card>
        );
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-center">⚙️ Configuraciones del Sistema POS</h2>

      <ButtonGroup className="mb-4 d-flex justify-content-center flex-wrap gap-2">
        <Button
          variant="outline-secondary"
          disabled
        >
          👥 Usuarios y Permisos (deshabilitado)
        </Button>

        <Button
          variant={seccion === 'sucursal' ? 'primary' : 'outline-primary'}
          onClick={() => setSeccion('sucursal')}
        >
          🏪 Datos del Local
        </Button>

        <Button
          variant={seccion === 'impresion' ? 'primary' : 'outline-primary'}
          onClick={() => setSeccion('impresion')}
        >
          🖨️ Configuración de Impresión
        </Button>

        <Button
          variant={seccion === 'sistema' ? 'primary' : 'outline-primary'}
          onClick={() => setSeccion('sistema')}
        >
          ⚙️ Configuración del Sistema
        </Button>
      </ButtonGroup>

      {renderContenido()}
    </Container>
  );
}
