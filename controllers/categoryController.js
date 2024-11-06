// controllers/categoryController.js
const { getDB } = require('../services/database');

// Controlador para obtener todas las categorías
exports.getCategories = async (req, res) => {
    try {
        const db = getDB();
        const categories = await db.collection('category').find().toArray();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

// Controlador para agregar una nueva categoría
exports.addCategory = async (req, res) => {
    try {
        const db = getDB();
        const { category, description } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'La categoría y la descripción son requeridas.' });
        }

        const result = await db.collection('category').insertOne({ category, description });

        res.status(201).json({ _id: result.insertedId, category, description });
    } catch (error) {
        console.error('Error al agregar la categoría:', error);
        res.status(500).json({ message: 'Error al agregar la categoría', error: error.message });
    }
};
