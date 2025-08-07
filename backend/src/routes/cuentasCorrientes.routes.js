const express = require('express');
const router = express.Router();
const cuentasController = require('../controllers/cuentasCorrientes.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth.verifyToken, cuentasController.create);

router.get('/cliente/:cliente_id', auth.verifyToken, cuentasController.getByCliente);

module.exports = router;
