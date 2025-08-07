const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const auth = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación, pero sin restricción por rol
router.get('/', auth.verifyToken, productosController.getAll);
router.get('/:id', auth.verifyToken, productosController.getOne);
router.post('/', auth.verifyToken, productosController.create);
router.put('/:id', auth.verifyToken, productosController.update);
router.delete('/:id', auth.verifyToken, productosController.delete);
router.get('/codigo-barras/:codigo_barras', auth.verifyToken, productosController.getByCodigoBarras);

module.exports = router;
