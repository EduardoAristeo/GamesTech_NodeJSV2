const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Crear una nueva venta
router.post('/', ventasController.createVenta);

// Obtener todas las ventas
router.get('/', ventasController.getVentas);

// Obtener detalles de una venta por ID
router.get('/:id/detalles', ventasController.getDetallesByVentaId);

router.delete('/:id', ventasController.deleteVenta);

router.put('/:id', ventasController.updateVenta);
module.exports = router;
