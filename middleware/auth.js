const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Modelo de usuario

const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extrae el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'No autorizado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
        req.user = await User.findById(decoded.id).select('-password'); // Agrega los datos del usuario al objeto de solicitud
        next();
    } catch (error) {
        console.error('Error al validar token:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = protect;
