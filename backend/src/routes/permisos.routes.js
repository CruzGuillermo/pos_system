const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisos.controller');

router.get('/usuario/:id', permisosController.getPermisosPorUsuario);
router.post('/usuario/:id', permisosController.setPermisosPorUsuario);

module.exports = router;
