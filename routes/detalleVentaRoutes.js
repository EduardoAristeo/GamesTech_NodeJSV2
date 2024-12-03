const express = require('express');
const router = express.Router();
const detalleVentaController = require('../controllers/detalleVentaController');

// Ruta para obtener productos vendidos agrupados por tiempo

router.get('/productos-vendidos', detalleVentaController.getProductosVendidosPorTiempo);

router.get('/productos-vendidos-tiempo', detalleVentaController.getProductosVendidosPorFecha);

router.get('/productos-por-categoria', detalleVentaController.getProductosPorCategoria);


// Ruta para obtener todos los detalles de ventas
router.get('/', detalleVentaController.getDetalleVentas);

// Ruta para obtener un detalle de venta por ID
router.get('/:id', detalleVentaController.getDetalleVentaById);

module.exports = router;
