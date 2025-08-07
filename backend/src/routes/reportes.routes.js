const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const auth = require('../middlewares/auth.middleware');

// Reporte ventas por filtros
router.get('/ventas', auth.verifyToken, reportesController.ventasPorFechas);

router.get('/ventas-productos-categorias', auth.verifyToken, reportesController.ventasPorProductoCategoria);

router.get('/resumen-ventas', auth.verifyToken, reportesController.resumenVentasPorPeriodo);

router.get('/stock-bajo/:sucursal_id', auth.verifyToken, reportesController.productosConStockBajo);
router.get('/movimientos-stock/:sucursal_id', auth.verifyToken, reportesController.movimientosDeStock);

router.get('/cajas', auth.verifyToken, reportesController.cajasPorFechaUsuario);
router.get('/cajas/resumen', auth.verifyToken, reportesController.resumenIngresosEgresosPorCaja);
router.get('/cajas/conciliacion', auth.verifyToken, reportesController.conciliacionCaja);


router.get('/gastos/categoria', auth.verifyToken, reportesController.gastosPorCategoria);
router.get('/gastos/sucursal', auth.verifyToken, reportesController.gastosPorSucursalYPeriodo);


router.get('/cuentas_corrientes/:cliente_id', auth.verifyToken, reportesController.cuentasCorrientesPorCliente);
router.get('/cuentas_corrientes/ventas_pagos/:cliente_id', auth.verifyToken, reportesController.ventasFiadasYPagosPorCliente);


router.get('/compras', auth.verifyToken, reportesController.comprasPorPeriodo);
router.get('/compras/proveedores', auth.verifyToken, reportesController.comprasPorProveedor);

module.exports = router;
