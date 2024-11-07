const Category = require('../models/Category'); // Importa el modelo Category

// Controlador para obtener todas las categorías
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // Utiliza Mongoose para obtener todas las categorías
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

// Controlador para agregar una nueva categoría
exports.addCategory = async (req, res) => {
    try {
        const { category, description } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'La categoría y la descripción son requeridas.' });
        }

        const newCategory = new Category({ category, description });
        const result = await newCategory.save(); // Guarda la nueva categoría en la base de datos

        res.status(201).json(result);
    } catch (error) {
        console.error('Error al agregar la categoría:', error);
        res.status(500).json({ message: 'Error al agregar la categoría', error: error.message });
    }
};
