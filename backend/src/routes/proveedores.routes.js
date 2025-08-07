const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedores.controller');
const auth = require('../middlewares/auth.middleware');

// Listar proveedores - cualquier usuario autenticado
router.get('/', auth.verifyToken, proveedoresController.getAll);

// Obtener proveedor por ID
router.get('/:id', auth.verifyToken, proveedoresController.getById);

// Crear proveedor
router.post('/', auth.verifyToken, proveedoresController.create);

// Actualizar proveedor
router.put('/:id', auth.verifyToken, proveedoresController.update);

// Eliminar proveedor
router.delete('/:id', auth.verifyToken, proveedoresController.delete);

module.exports = router;
