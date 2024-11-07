const express = require('express');
const router = express.Router();
const reparacionController = require('../controllers/reparacionController');

// Rutas para reparaciones
router.get('/', reparacionController.getReparaciones);
router.get('/:id', reparacionController.getReparacionById);
router.post('/', reparacionController.createReparacion);
router.put('/:id', reparacionController.updateReparacion);
router.delete('/:id', reparacionController.deleteReparacion);

module.exports = router;
