// controllers/productController.js
const { getDB } = require('../services/database');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
// Obtener todos los productos con filtros y ordenamientos
exports.getProducts = async (req, res) => {
    try {
        const db = getDB();
        const { category, minPrice, maxPrice, sortBy, search } = req.query;

        let query = {};
        if (category && category !== 'All') {
            query.category = new ObjectId(category);
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
            if (sortBy === 'newest') sort.created = -1;
            if (sortBy === 'priceAsc') sort.price = 1;
            if (sortBy === 'priceDesc') sort.price = -1;
            if (sortBy === 'discount') sort.discount = -1;
        }

        const products = await db.collection('product').find(query).sort(sort).toArray();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};

// Obtener un producto por su ID
exports.getProductById = async (req, res) => {
    try {
        const db = getDB();
        const product = await db.collection('product').findOne({ _id: new ObjectId(req.params.id) });
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
        const db = getDB();
        const existingCategory = await db.collection('category').findOne({ _id: new ObjectId(category) });
        if (!existingCategory) return res.status(400).json({ message: 'Categoría no válida' });

        const newProduct = { product, price, stock, cost, description, category: new ObjectId(category), status, discount };
        const result = await db.collection('product').insertOne(newProduct);
        res.status(201).json({ _id: result.insertedId });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

// Actualizar un producto por su ID
exports.updateProduct = async (req, res) => {
    try {
        const { product, price, stock, cost, description, category, status, discount } = req.body;
        const db = getDB();

        // Verificar si la categoría existe
        if (category) {
            const existingCategory = await db.collection('category').findOne({ _id: new ObjectId(category) });
            if (!existingCategory) return res.status(400).json({ message: 'Categoría no válida' });
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
            { returnDocument: 'after', returnNewDocument: true }
        );

        if (!result) return res.status(404).json({ message: 'Producto no encontrado' });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

// Ruta para eliminar un producto por su ID
exports.deleteProduct = async (req, res) => {
    try {
        const db = getDB();
        const productId = req.params.id;
        console.log(`ID del producto a eliminar: ${productId}`);

        // Convertir el ID a ObjectId antes de usarlo en la consulta
        const result = await db.collection('product').findOneAndDelete({ _id: new ObjectId(productId) });

        console.log("Resultado de findOneAndDelete:", result);

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
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
            // Eliminar el archivo temporal si no se proporciona `productId`
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'ID de producto no proporcionado.' });
        }

        // Verificar que `productId` sea un ID válido
        if (!ObjectId.isValid(productId)) {
            fs.unlinkSync(req.file.path); // Eliminar el archivo temporal si el ID no es válido
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }

        // Crear la ruta final de la imagen en 'uploads/products' con el ID del producto
        const extension = req.file.mimetype.split('/')[1];
        const finalPath = path.join(__dirname, `../public/uploads/products/${productId}.png`);

        // Mover y renombrar el archivo
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
