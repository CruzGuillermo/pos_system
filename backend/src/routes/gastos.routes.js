const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastos.controller');
const auth = require('../middlewares/auth.middleware');

// Crear gasto con movimiento de caja (requiere caja abierta)
router.post('/', auth.verifyToken, gastosController.create);

// Listar gastos por sucursal
router.get('/sucursal/:sucursal_id', auth.verifyToken, gastosController.getBySucursal);

// Editar gasto (si la caja está abierta)
router.put('/:id', auth.verifyToken, gastosController.update);

// Eliminar gasto (si la caja está abierta)
router.delete('/:id', auth.verifyToken, gastosController.remove);

module.exports = router;
