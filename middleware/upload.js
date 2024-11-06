// middlewares/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/products'));
    },
    filename: (req, file, cb) => {
        // Usar un nombre temporal para la imagen
        cb(null, `temp-${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
});

const upload = multer({ storage });

// Middleware para renombrar el archivo después de la carga
const renameFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Imagen no proporcionada.' });
    }

    const productId = req.body.productId;
    if (!productId) {
        // Eliminar el archivo temporal si no se proporciona productId
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'ID de producto no proporcionado.' });
    }

    // Ruta final de la imagen con el nombre correcto
    const extension = req.file.mimetype.split('/')[1];
    const newFilePath = path.join(__dirname, `../public/uploads/products/${productId}.png`);

    // Renombrar el archivo temporal al nombre correcto
    fs.rename(req.file.path, newFilePath, (err) => {
        if (err) {
            console.error('Error al renombrar la imagen:', err);
            return res.status(500).json({ message: 'Error al procesar la imagen.' });
        }
        req.file.path = newFilePath; // Actualizar la ruta en req.file para el controlador
        next();
    });
};

module.exports = { upload, renameFile };
