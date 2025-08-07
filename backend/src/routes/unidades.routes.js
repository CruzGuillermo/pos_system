const express = require('express');
const router = express.Router();
const unidadController = require('../controllers/unidad.controller');
const auth = require('../middlewares/auth.middleware');

// CRUD de unidades (requiere token, sin restricciones de rol)
router.get('/', auth.verifyToken, unidadController.getAll);
router.post('/', auth.verifyToken, unidadController.create);
router.put('/:id', auth.verifyToken, unidadController.update);
router.delete('/:id', auth.verifyToken, unidadController.delete);

module.exports = router;
