const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); // Asegúrate de que la ruta es correcta

// Usa los métodos del controlador en las rutas
router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);

module.exports = router;
