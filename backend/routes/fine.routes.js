const express = require('express');
const router = express.Router();
const { calculateFine } = require('../controllers/fine.controller');

router.post('/fine', calculateFine);

module.exports = router;
