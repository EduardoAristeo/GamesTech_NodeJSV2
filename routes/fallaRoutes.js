const express = require('express');
const router = express.Router();
const fallaController = require('../controllers/fallaController');

// Rutas para fallas
router.get('/', fallaController.getFallas);
router.post('/', fallaController.createFalla);
router.put('/:id', fallaController.updateFalla);
router.delete('/:id', fallaController.deleteFalla);

module.exports = router;
