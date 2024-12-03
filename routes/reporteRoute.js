const express = require('express');
const { obtenerReporteVentas } = require('../controllers/reporteController'); // Asegúrate de usar el nombre correcto

const router = express.Router();

router.post('/ventas', obtenerReporteVentas);

module.exports = router;
