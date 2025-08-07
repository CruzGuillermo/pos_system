const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/compras.controller');
const auth = require('../middlewares/auth.middleware');

// Crear compra con detalle
router.post('/', auth.verifyToken, comprasController.create);

// Listar compras - solo usuarios autenticados
router.get('/', auth.verifyToken, comprasController.getAll);

// Obtener compra por ID
router.get('/:id', auth.verifyToken, comprasController.getById);

// Actualizar estado de compra
router.put('/:id/estado', auth.verifyToken, comprasController.updateEstado);

module.exports = router;
