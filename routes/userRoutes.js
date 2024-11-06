const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { getDB } = require('../services/database');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Middleware para manejar form-data
const upload = multer();

// Lista de departamentos válidos
const validDepartments = ['admin', 'tecnico', 'recepcion'];

// Obtener todos los usuarios
router.get('/user', async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('user').find().toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { user, password, department, nombre, apellido, email, fecha_ingreso } = req.body;

    // Verificar que todos los campos requeridos no sean undefined
    if (!user || !password || !department || !nombre || !apellido || !email || !fecha_ingreso) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el departamento proporcionado es válido
    if (!validDepartments.includes(department)) {
        return res.status(400).json({ message: 'Departamento inválido' });
    }

    try {
        const db = getDB();
        
        // Verificar si el usuario ya existe
        const existingUser = await db.collection('user').findOne({ user: user.trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
        }
        
        // Cifrar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Guardar el usuario en la base de datos
        const newUser = {
            user: user.trim(),
            password: hashedPassword,
            department: department,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            fecha_ingreso: fecha_ingreso
        };

        await db.collection('user').insertOne(newUser);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error registrando usuario', error: error.message });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    const { user, password } = req.body;

    // Verificar que user y password no sean undefined
    if (!user || !password) {
        return res.status(400).json({ message: 'El nombre de usuario y la contraseña son requeridos' });
    }

    try {
        const db = getDB();
        const existingUser = await db.collection('user').findOne({ user: user.trim() });

        if (!existingUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        res.status(200).json({ 
            message: 'Inicio de sesión exitoso', 
            department: existingUser.department,
            nombre: existingUser.nombre,
            apellido: existingUser.apellido,
            email: existingUser.email,
            fecha_ingreso: existingUser.fecha_ingreso
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
});

module.exports = router;
