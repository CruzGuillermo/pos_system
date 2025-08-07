import { useEffect } from "react";

export default function GeneradorTicket({ venta }) {
  useEffect(() => {
    if (!venta || !Array.isArray(venta.detalle)) return; // <-- así, sin retornar nada

    const { configuracion_sucursal, configuracion_impresion } = venta;
    if (!configuracion_sucursal || !configuracion_impresion) return;

    const productosHTML = venta.detalle
      .map(
        (p) => `
          <tr>
            <td>${p.nombre_producto || "Prod"}</td>
            <td style="text-align:center;">${p.cantidad}</td>
            <td style="text-align:right;">$${p.precio_unitario?.toFixed(2) || "0.00"}</td>
            <td style="text-align:right;">$${(p.cantidad * p.precio_unitario)?.toFixed(2) || "0.00"}</td>
          </tr>
        `
      )
      .join("");

    const mostrarLogo = configuracion_impresion.mostrar_logo && configuracion_sucursal.logo_base64;
    const mostrarCUIT = configuracion_impresion.mostrar_cuit && configuracion_sucursal.cuit;

    const html = `
      <html>
        <head>
          <title>Ticket</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; text-align: center; margin: 0; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 4px; font-size: 11px; }
            th { background-color: #eee; }
            hr { border: 1px dashed #000; margin: 10px 0; }
            .header { margin-bottom: 10px; }
            .header p { margin: 2px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            ${mostrarLogo ? `<img src="${configuracion_sucursal.logo_base64}" width="100" />` : ""}
            <h3>${configuracion_sucursal.nombre_fantasia || "Mi Negocio"}</h3>
            <p>${configuracion_sucursal.direccion || ""}</p>
            <p>Tel: ${configuracion_sucursal.telefono || ""}</p>
            ${mostrarCUIT ? `<p>CUIT: ${configuracion_sucursal.cuit}</p>` : ""}
            <p>${new Date(venta.fecha).toLocaleString()}</p>
            <p>Venta: ${venta.codigo || "Sin Código"}</p>
          </div>
          <hr/>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align:center;">Cant</th>
                <th style="text-align:right;">PU</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${productosHTML}</tbody>
          </table>
          <hr/>
          <p><strong>Total: $${venta.total?.toFixed(2) || "0.00"}</strong></p>
          <p>${configuracion_impresion.mensaje_pie || "¡Gracias por su compra!"}</p>
        </body>
      </html>
    `;

    if (window.electronAPI && window.electronAPI.generarPDFTicket) {
      window.electronAPI.generarPDFTicket(html).then((pdfPath) => {
        const shell = window.require ? window.require("electron").shell : null;
        if (shell) {
          shell.openPath(pdfPath);
        } else {
          window.open(`file://${pdfPath}`);
        }
      });
    } else {
      alert("Función de generar PDF solo disponible en Electron");
    }

    // No retornamos nada aquí
  }, [venta]);

  return null;
}
