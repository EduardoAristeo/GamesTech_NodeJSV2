// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { getDB } = require('../services/database');

// Ruta para obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const db = getDB(); // Obtener la instancia de la base de datos
        const categories = await db.collection('category').find().toArray();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
});

// Ruta para agregar una nueva categoría
router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { category, description } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'La categoría y la descripción son requeridas.' });
        }

        // Insertar la nueva categoría en la base de datos
        const result = await db.collection('category').insertOne({ category, description });

        // Obtener el ID del nuevo documento insertado
        const newCategory = {
            _id: result.insertedId,
            category,
            description,
        };

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error al agregar la categoría:', error);
        res.status(500).json({ message: 'Error al agregar la categoría', error: error.message });
    }
});

module.exports = router;
