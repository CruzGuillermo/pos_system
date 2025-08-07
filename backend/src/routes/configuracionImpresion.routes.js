const express = require('express');
const router = express.Router();
const {
  getConfiguracionImpresion,
  upsertConfiguracionImpresion,
  updateConfiguracionImpresion, // <--- nuevo
} = require('../controllers/configuracionImpresion.controller');

router.get('/:sucursal_id', getConfiguracionImpresion);
router.post('/:sucursal_id', upsertConfiguracionImpresion);
router.put('/:sucursal_id', updateConfiguracionImpresion); // <--- nuevo

module.exports = router;
