const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');

// Configuración global del sistema
router.get('/sistema', configuracionController.getConfiguracionSistema);
router.put('/sistema', configuracionController.updateConfiguracionSistema);

module.exports = router;
