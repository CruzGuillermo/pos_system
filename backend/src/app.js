const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categoriasRoutes = require('./routes/categorias.routes');
const sucursalesRoutes = require('./routes/sucursales.routes');
const authRoutes = require('./routes/auth.routes');
const unidadesRoutes = require('./routes/unidades.routes');
const productosRoutes = require('./routes/productos.routes');
const stockRoutes = require('./routes/stock.routes');
const ventasRoutes = require('./routes/ventas.routes'); 
const clientesRoutes = require('./routes/clientes.routes');
const cajasRoutes = require('./routes/cajas.routes'); // ✅ Nueva línea
const proveedoresRoutes = require('./routes/proveedores.routes');
const comprasRoutes = require('./routes/compras.routes');
const gastosRoutes = require('./routes/gastos.routes');
const cuentasCorrientesRoutes = require('./routes/cuentasCorrientes.routes');
const reportesRoutes = require('./routes/reportes.routes');  // <-- Importamos reportes
const permisosRoutes = require('./routes/permisos.routes');
const configuracionRoutes = require('./routes/configuracion.routes');
const configuracionSucursalRoutes = require('./routes/configuracionSucursal.routes');
const configuracionImpresionRoutes = require('./routes/configuracionImpresion.routes');
const afipRoutes = require('./afip/afip.routes');

const app = express();

app.use(cors());
app.use(express.json());
const fs = require('fs');

console.log('Certificado:', fs.readFileSync('./src/afip/certs/certificado.pem', 'utf8').slice(0, 100));
console.log('Clave privada:', fs.readFileSync('./src/afip/certs/clave-privada.key', 'utf8').slice(0, 100));


app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cajas', cajasRoutes); // ✅ Nueva línea
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/cuentas_corrientes', cuentasCorrientesRoutes);
app.use('/api/reportes', reportesRoutes); // <-- Montamos rutas de reportes
app.use('/api/permisos', permisosRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/configuracion/sucursal', configuracionSucursalRoutes);
app.use('/api/configuracion/impresion', configuracionImpresionRoutes);
app.use('/api/afip', afipRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API POS funcionando correctamente');
});

module.exports = app;