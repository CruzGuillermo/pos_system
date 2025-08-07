const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const auth = require('../middlewares/auth.middleware');

// Crear cliente
router.post('/', auth.verifyToken, clientesController.create);

// Listar todos
router.get('/', auth.verifyToken, clientesController.getAll);

// Obtener por ID
router.get('/:id', auth.verifyToken, clientesController.getById);

// Actualizar cliente
router.put('/:id', auth.verifyToken, clientesController.update);

// Eliminar cliente
router.delete('/:id', auth.verifyToken, clientesController.delete);

// Ventas del cliente
router.get('/:id/ventas', auth.verifyToken, clientesController.getVentas);

// Búsqueda paginada con filtro
router.get('/search', auth.verifyToken, clientesController.search);

// Historial financiero del cliente
router.get('/:id/historial', auth.verifyToken, clientesController.getHistorial);

// Exportar clientes a CSV
router.get('/export', auth.verifyToken, clientesController.exportCSV);

module.exports = router;
