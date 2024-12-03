const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Obtener todos los productos con filtros y ordenamientos
exports.getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sortBy, search } = req.query;

        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            query.product = { $regex: new RegExp(search, 'i') };
        }

        let sort = {};
        if (sortBy) {
            if (sortBy === 'newest') sort.createdAt = -1;
            if (sortBy === 'priceAsc') sort.price = 1;
            if (sortBy === 'priceDesc') sort.price = -1;
            if (sortBy === 'discount') sort.discount = -1;
        }

        const products = await Product.find(query).sort(sort);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};

// Obtener un producto por su ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.status(200).json(product);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const { product, price, stock, cost, description, category, status, discount } = req.body;

        // Verificar si la categoría existe
        const existingCategory = await Category.findById(category);
        if (!existingCategory) return res.status(400).json({ message: 'Categoría no válida' });

        const newProduct = new Product({ product, price, stock, cost, description, category, status, discount });
        const result = await newProduct.save();
        res.status(201).json({ _id: result._id });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

// Actualizar un producto por su ID
exports.updateProduct = async (req, res) => {
    try {
        const { product, price, stock, cost, description, category, status, discount } = req.body;

        // Verificar si la categoría existe
        if (category) {
            const existingCategory = await Category.findById(category);
            if (!existingCategory) return res.status(400).json({ message: 'Categoría no válida' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { product, price, stock, cost, description, category, status, discount },
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

// Ruta para eliminar un producto por su ID
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};

// Subir imagen del producto
exports.uploadProductImage = (req, res) => {
    try {
        // Validar si se subió un archivo
        if (!req.file) {
            return res.status(400).json({ message: 'Imagen no proporcionada.' });
        }

        // Obtener el ID del producto desde el body de la solicitud
        const productId = req.body.productId;
        if (!productId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'ID de producto no proporcionado.' });
        }

        // Validar que el ID sea un ObjectId válido usando mongoose.Types.ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }

        // Crear la ruta final de la imagen
        const extension = req.file.mimetype.split('/')[1];
        const finalPath = path.join(__dirname, `../public/uploads/products/${productId}.png`);

        // Mover el archivo
        fs.rename(req.file.path, finalPath, (err) => {
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
};

exports.updateProductImage = (req, res) => {
    try {
        // Validar si se subió un archivo
        if (!req.file) {
            return res.status(400).json({ message: 'Imagen no proporcionada.' });
        }

        // Obtener el ID del producto desde el body de la solicitud
        const productId = req.body.productId;
        if (!productId) {
            fs.unlinkSync(req.file.path); // Eliminar el archivo temporal
            return res.status(400).json({ message: 'ID de producto no proporcionado.' });
        }

        // Validar que el ID sea un ObjectId válido usando mongoose.Types.ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            fs.unlinkSync(req.file.path); // Eliminar el archivo temporal
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }

        // Crear la ruta final de la imagen
        const finalPath = path.join(__dirname, `../public/uploads/products/${productId}.png`);

        // Verificar si ya existe una imagen para este producto
        if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath); // Eliminar la imagen existente
        }

        // Mover el archivo al destino final
        fs.rename(req.file.path, finalPath, (err) => {
            if (err) {
                console.error('Error al renombrar la imagen:', err);
                return res.status(500).json({ message: 'Error al procesar la imagen.' });
            }

            res.status(200).json({ message: 'Imagen actualizada exitosamente.' });
        });
    } catch (error) {
        console.error('Error al actualizar la imagen:', error);
        res.status(500).json({ message: 'Error al actualizar la imagen.', error: error.message });
    }
};
