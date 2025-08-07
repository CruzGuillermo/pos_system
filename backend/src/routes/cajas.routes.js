const express = require('express');
const router = express.Router();
const cajasController = require('../controllers/cajas.controller');
const auth = require('../middlewares/auth.middleware');

// Abrir caja
router.post(
  '/abrir',
  auth.verifyToken,
  cajasController.abrirCaja
);

// Registrar movimiento
router.post(
  '/movimientos',
  auth.verifyToken,
  cajasController.registrarMovimiento
);

// Cerrar caja
router.put(
  '/cerrar/:id',
  auth.verifyToken,
  cajasController.cerrarCaja
);

// Obtener cajas de su sucursal (forzado con middleware)
router.get(
  '/',
  auth.verifyToken,
  auth.enforceSucursalUsuario,
  cajasController.getCajas
);

// Obtener movimientos por caja
router.get(
  '/:caja_id/movimientos',
  auth.verifyToken,
  cajasController.getMovimientosPorCaja
);
router.get('/abierta', auth.verifyToken, cajasController.getCajaAbierta);

// Obtener última caja cerrada
router.get(
  '/ultima-cerrada',
  auth.verifyToken,
  cajasController.getUltimaCajaCerrada
);

module.exports = router;
