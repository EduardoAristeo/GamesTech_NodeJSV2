const express = require('express');
const router = express.Router();
const { getDB } = require('../services/database');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para almacenar las imágenes en la carpeta 'public/uploads/products'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/products')); // Ruta donde se almacenarán las imágenes
    },
    filename: (req, file, cb) => {
        // Usar un nombre temporal para la imagen
        cb(null, `temp-${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
});

const upload = multer({ storage });

// Ruta para obtener todos los productos con filtros y ordenamientos
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { category, minPrice, maxPrice, sortBy, search } = req.query;

        let query = {};

        // Filtrar por categoría
        if (category && category !== 'All') {
            query.category = new ObjectId(category);
        }

        // Filtrar por rango de precios
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = parseFloat(maxPrice);
            }
        }

        // Filtrar por búsqueda de texto en el nombre del producto
        if (search) {
            query.product = { $regex: new RegExp(search, 'i') };
        }

        // Configuración de ordenamiento
        let sort = {};
        if (sortBy) {
            if (sortBy === 'newest') {
                sort.created = -1; // Ordenar por fecha de creación (descendente)
            } else if (sortBy === 'priceAsc') {
                sort.price = 1; // Ordenar por precio ascendente
            } else if (sortBy === 'priceDesc') {
                sort.price = -1; // Ordenar por precio descendente
            } else if (sortBy === 'discount') {
                sort.discount = -1; // Ordenar por descuento descendente
            }
        }

        const products = await db.collection('product').find(query).sort(sort).toArray();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
});


// Ruta para obtener un producto por su ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const product = await db.collection('product').findOne({ _id: new ObjectId(req.params.id) });
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
});

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { product, price, stock, cost, description, category, status,discount } = req.body;
        const db = getDB();
        
        // Verificar si la categoría existe
        const existingCategory = await db.collection('category').findOne({ _id: new ObjectId(category) });
        if (!existingCategory) {
            return res.status(400).json({ message: 'Categoría no válida' });
        }

        // Crear el producto
        const newProduct = {
            product,
            price,
            stock,
            cost,
            description,
            category: new ObjectId(category),
            status,
            discount
        };

        const result = await db.collection('product').insertOne(newProduct);

        // Devuelve solo el ID del producto insertado
        res.status(201).json({ _id: result.insertedId });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
});

// Ruta para actualizar un producto por su ID
router.put('/:id', async (req, res) => {
    try {
        const { product, price, stock, cost, description, category, status, discount } = req.body;
        const db = getDB();
        
        // Verificar si la categoría existe
        if (category) {
            const existingCategory = await db.collection('category').findOne({ _id: new ObjectId(category) });
            if (!existingCategory) {
                return res.status(400).json({ message: 'Categoría no válida' });
            }
        }

        const updatedProduct = {
            product,
            price,
            stock,
            cost,
            description,
            category: new ObjectId(category),
            status,
            discount
        };

        const result = await db.collection('product').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedProduct },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(result.value);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
});

// Ruta para eliminar un producto por su ID
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('product').findOneAndDelete({ _id: new ObjectId(req.params.id) });

        if (!result.value) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
});

// Ruta para subir la imagen del producto
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Imagen no proporcionada.' });
        }

        const productId = req.body.productId;
        if (!productId) {
            // Eliminar el archivo temporal si no hay productId
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

            res.status(200).json({ message: 'Imagen subida exitosamente.' });
        });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ message: 'Error al subir la imagen.', error: error.message });
    }
});

module.exports = router;
