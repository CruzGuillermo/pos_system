const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');
const auth = require('../middlewares/auth.middleware');

// Listar todas (requiere token válido)
router.get('/', auth.verifyToken, categoriasController.listar);

// Crear categoría (sin restricción de rol, token requerido)
router.post('/', auth.verifyToken, categoriasController.crear);

// Editar categoría (sin restricción de rol, token requerido)
router.put('/:id', auth.verifyToken, categoriasController.editar);

// Eliminar categoría (sin restricción de rol, token requerido)
router.delete('/:id', auth.verifyToken, categoriasController.eliminar);

module.exports = router;
