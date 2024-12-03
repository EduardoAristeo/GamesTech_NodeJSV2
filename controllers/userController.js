const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Importa JWT

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }); // Expira en 7 días
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
};

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
    const { user, password, department, nombre, apellido, email, fecha_ingreso } = req.body;

    if (!user || !password || !department || !nombre || !apellido || !email || !fecha_ingreso) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ user: user.trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = new User({
            user: user.trim(),
            password: hashedPassword,
            department,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            fecha_ingreso
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

// Iniciar sesión
exports.loginUser = async (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.status(400).json({ message: 'El nombre de usuario y la contraseña son requeridos' });
    }

    try {
        const existingUser = await User.findOne({ user: user.trim() });
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar token
        const token = generateToken(existingUser._id);

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token, // Devuelve el token
            user: {
                id: existingUser._id,
                department: existingUser.department,
                nombre: existingUser.nombre,
                apellido: existingUser.apellido,
                email: existingUser.email,
                fecha_ingreso: existingUser.fecha_ingreso,
            },
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// Validar token
exports.validateToken = async (req, res) => {
    console.log('Authorization Header:', req.headers.authorization); 
    const token = req.headers.authorization?.split(' ')[1]; // Extrae el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'No autorizado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
        const user = await User.findById(decoded.id).select('-password'); // Obtén el usuario sin la contraseña

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: 'Token válido',
            user: {
                id: user._id,
                department: user.department,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                fecha_ingreso: user.fecha_ingreso,
            },
        });
    } catch (error) {
        console.error('Error al validar token:', error);
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
