import React from 'react';
import { Button } from 'react-bootstrap';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.vfs;

const TicketVenta = ({ venta }) => {
  if (!venta) return <p>No hay datos de la venta para mostrar.</p>;

  // Desestructuro según la estructura que envía el backend
  const {
    configuracion_impresion = {},
    configuracion_sucursal = {},
    venta: ventaData = {},
  } = venta;

  const {
    codigo = '---',
    fecha = new Date().toISOString(),
    total = 0,
    usuario = '---',
    cliente_nombre = null,
    detalle = [],
    pagos = [],
  } = ventaData;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? 'Fecha inválida' : d.toLocaleString();
  };

  const handlePrintPDF = () => {
    const content = [];

    // Logo
    if (configuracion_impresion.mostrar_logo && configuracion_sucursal.logo_base64) {
      content.push({
        image: configuracion_sucursal.logo_base64,
        width: 100,
        alignment: 'center',
        margin: [0, 0, 0, 10],
      });
    }

    // Datos comercio
    content.push(
      {
        text: configuracion_sucursal.nombre_fantasia || 'Nombre Comercio',
        style: 'header',
        alignment: 'center',
      },
      {
        text: [
          configuracion_sucursal.direccion || '',
          '\n',
          `${configuracion_sucursal.ciudad || ''} - ${configuracion_sucursal.provincia || ''}`,
          '\n',
          configuracion_impresion.mostrar_cuit && configuracion_sucursal.cuit
            ? `CUIT: ${configuracion_sucursal.cuit}\n`
            : '',
          configuracion_sucursal.telefono ? `Tel: ${configuracion_sucursal.telefono}` : '',
        ],
        alignment: 'center',
        margin: [0, 5, 0, 10],
        fontSize: 9,
      }
    );

    // Datos venta
    content.push(
      { text: `Venta: ${codigo}`, fontSize: 10 },
      { text: `Fecha: ${formatDate(fecha)}`, fontSize: 10 },
      { text: `Usuario: ${usuario}`, fontSize: 10 },
      cliente_nombre ? { text: `Cliente: ${cliente_nombre}`, fontSize: 10 } : null,
      { text: '\n' }
    );

    // Tabla detalle productos
    content.push({
      table: {
        widths: ['*', 'auto', 'auto', 'auto'],
        body: [
          ['Producto', 'Cant.', 'P. Unit', 'Total'],
          ...detalle.map(item => [
            item.nombre_producto || '---',
            item.cantidad || 0,
            `$${(item.precio_unitario || 0).toFixed(2)}`,
            `$${((item.precio_unitario || 0) * (item.cantidad || 0)).toFixed(2)}`,
          ]),
        ],
      },
      fontSize: 9,
      margin: [0, 5, 0, 10],
    });

    // Total y pagos
    content.push(
      {
        text: `Total: $${total.toFixed(2)}`,
        alignment: 'right',
        bold: true,
        margin: [0, 0, 0, 5],
      },
      {
        text: pagos.length ? 'Pagos:' : '',
        alignment: 'right',
        bold: true,
      },
      ...pagos.map(p => ({
        text: `${p.tipo_pago}: $${(p.monto || 0).toFixed(2)}`,
        alignment: 'right',
        fontSize: 9,
      }))
    );

    // Mensaje pie
    if (configuracion_impresion.mensaje_pie) {
      content.push({
        text: configuracion_impresion.mensaje_pie,
        alignment: 'center',
        fontSize: 9,
        margin: [0, 10, 0, 0],
      });
    }

    const docDefinition = {
      content,
      styles: {
        header: {
          fontSize: 12,
          bold: true,
        },
      },
      pageSize: configuracion_impresion.modo_impresion === 'A4' ? 'A4' : { width: 226, height: 'auto' },
      pageMargins: [10, 10, 10, 10],
    };

    pdfMake.createPdf(docDefinition).open();
  };

  return (
    <Button variant="primary" onClick={handlePrintPDF}>
      🖨️ Imprimir Ticket
    </Button>
  );
};

export default TicketVenta;
