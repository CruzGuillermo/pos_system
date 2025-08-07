const express = require('express');
const { pingAfip } = require('./afip.controller');

const router = express.Router();

router.get('/ping', pingAfip);

module.exports = router;
