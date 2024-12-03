const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');

// Endpoint para crear una orden
router.post('/create-order', paypalController.createOrder);

// Endpoint para capturar una orden
router.post('/capture-order', paypalController.captureOrder);

module.exports = router;
