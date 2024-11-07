const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Rutas para clientes
router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
