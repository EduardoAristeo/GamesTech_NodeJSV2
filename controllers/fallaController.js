const Falla = require('../models/Falla');

// Obtener todas las fallas
exports.getFallas = async (req, res) => {
    try {
        const fallas = await Falla.find(); // Obtener todas las fallas
        res.status(200).json(fallas);
    } catch (error) {
        console.error('Error al obtener las fallas:', error);
        res.status(500).json({ message: 'Error al obtener las fallas', error: error.message });
    }
};

// Crear una nueva falla
exports.createFalla = async (req, res) => {
    try {
        const { falla } = req.body;

        if (!falla) {
            return res.status(400).json({ message: 'El campo "falla" es requerido.' });
        }

        const newFalla = new Falla({ falla });
        const result = await newFalla.save(); // Guardar en la base de datos
        res.status(201).json({ _id: result._id, falla: result.falla });
    } catch (error) {
        console.error('Error al crear la falla:', error);
        res.status(500).json({ message: 'Error al crear la falla', error: error.message });
    }
};

// Actualizar una falla por ID
exports.updateFalla = async (req, res) => {
    try {
        const { falla } = req.body;

        if (!falla) {
            return res.status(400).json({ message: 'El campo "falla" es requerido.' });
        }

        const updatedFalla = await Falla.findByIdAndUpdate(
            req.params.id,
            { falla },
            { new: true } // Retornar el documento actualizado
        );

        if (!updatedFalla) {
            return res.status(404).json({ message: 'Falla no encontrada' });
        }

        res.status(200).json(updatedFalla);
    } catch (error) {
        console.error('Error al actualizar la falla:', error);
        res.status(500).json({ message: 'Error al actualizar la falla', error: error.message });
    }
};

// Eliminar una falla por ID
exports.deleteFalla = async (req, res) => {
    try {
        const deletedFalla = await Falla.findByIdAndDelete(req.params.id);

        if (!deletedFalla) {
            return res.status(404).json({ message: 'Falla no encontrada' });
        }

        res.status(200).json({ message: 'Falla eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la falla:', error);
        res.status(500).json({ message: 'Error al eliminar la falla', error: error.message });
    }
};
