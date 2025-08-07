const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const auth = require('../middlewares/auth.middleware');

console.log('Stock Controller:', stockController);

// ✅ Más específicas primero

router.get('/sucursal', auth.verifyToken, stockController.getBySucursal);
router.get('/bajo', auth.verifyToken, stockController.getStockBajo);
router.get('/consulta/:producto_id', auth.verifyToken, stockController.getStockPuntual);
// Crear stock
router.post('/', auth.verifyToken, stockController.create);

// Actualizar stock
router.put('/:id', auth.verifyToken, stockController.update);

// Eliminar stock
router.delete('/:id', auth.verifyToken, stockController.delete);

router.post('/ajuste', auth.verifyToken, stockController.ajustarStockManual);

module.exports = router;
