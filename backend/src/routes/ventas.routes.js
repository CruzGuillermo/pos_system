const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');
const auth = require('../middlewares/auth.middleware');

// Crear venta (requiere autenticación)
router.post('/', auth.verifyToken, ventasController.create);

// Obtener todas las ventas (solo admin o supervisor)
router.get('/', auth.verifyToken,  ventasController.getAll);
// Anular venta (solo admin o supervisor)
router.put('/:id/anular', auth.verifyToken, ventasController.anularVenta);

// Obtener venta por ID (requiere autenticación)
router.get('/:id', auth.verifyToken, ventasController.getById);

// Obtener ventas de un cliente específico (requiere autenticación)
router.get('/cliente/:cliente_id', auth.verifyToken, ventasController.getByCliente);




module.exports = router;

