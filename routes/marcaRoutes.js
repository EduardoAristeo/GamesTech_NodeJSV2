const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');

// Rutas para las marcas
router.get('/', marcaController.getMarcas);
router.get('/:id', marcaController.getMarcaById);
router.post('/', marcaController.createMarca);
router.put('/:id', marcaController.updateMarca);
router.delete('/:id', marcaController.deleteMarca);

module.exports = router;
