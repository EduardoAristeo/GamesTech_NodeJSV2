const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/auth'); // Middleware para proteger rutas

// Rutas para usuarios
router.get('/', userController.getUsers); // Obtener todos los usuarios
router.post('/register', userController.registerUser); // Registrar un usuario
router.post('/login', userController.loginUser); // Iniciar sesión
router.post('/validateToken', userController.validateToken); // Validar token

module.exports = router;
