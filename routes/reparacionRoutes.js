const express = require('express');
const router = express.Router();
const reparacionController = require('../controllers/reparacionController');

// Rutas para reparaciones
router.get('/por-fecha-y-marca', reparacionController.getReparacionesPorFechaYMarca); // Esta debe ir primero
router.get('/tabla', reparacionController.getTablaReparaciones); // Esta debe ir segundo
// Reparaciones por categoría respecto al tiempo
router.get('/reparaciones-por-categoria', reparacionController.getReparacionesPorCategoria);
// Reparaciones por estatus respecto al tiempo
router.get('/reparaciones-por-estatus', reparacionController.getReparacionesPorEstatus);
// Reparaciones realizadas por técnico respecto al tiempo
router.get('/reparaciones-por-tecnico', reparacionController.getReparacionesPorTecnico);
// Reparaciones por falla respecto al tiempo
router.get('/reparaciones-por-falla', reparacionController.getReparacionesPorFalla);
// Reparaciones por marca respecto al tiempo
router.get('/reparaciones-por-marca', reparacionController.getReparacionesPorMarca);
// Reeporte general
router.get('/reporte-general', reparacionController.getReporteCompleto);
router.get('/', reparacionController.getReparaciones);
router.put('/update-status', reparacionController.updateMultipleReparaciones);
router.get('/:id', reparacionController.getReparacionById);
router.post('/', reparacionController.createReparacion);
router.put('/:id', reparacionController.updateReparacion);
router.delete('/:id', reparacionController.deleteReparacion);

module.exports = router;
