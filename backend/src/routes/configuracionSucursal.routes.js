// routes/configuracionSucursal.routes.js
const express = require('express');
const router = express.Router();
const { getConfiguracionSucursal, upsertConfiguracionSucursal } = require('../controllers/configuracionSucursal.controller');

router.get('/:sucursal_id', getConfiguracionSucursal);
router.put('/:sucursal_id', upsertConfiguracionSucursal);  // O POST según implementes

module.exports = router;
