const express = require('express');
const router = express.Router();
const sucursalesController = require('../controllers/sucursales.controller');

router.get('/', sucursalesController.getAll);
router.post('/', sucursalesController.create);
router.put('/:id', sucursalesController.update);
router.delete('/:id', sucursalesController.remove);

module.exports = router;
