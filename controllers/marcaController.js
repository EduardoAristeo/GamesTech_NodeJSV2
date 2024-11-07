const Marca = require('../models/Marca');

// Obtener todas las marcas
exports.getMarcas = async (req, res) => {
    try {
        const marcas = await Marca.find();
        res.status(200).json(marcas);
    } catch (error) {
        console.error('Error al obtener las marcas:', error);
        res.status(500).json({ message: 'Error al obtener las marcas', error: error.message });
    }
};

// Obtener una marca por su ID
exports.getMarcaById = async (req, res) => {
    try {
        const marca = await Marca.findById(req.params.id);
        if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
        res.status(200).json(marca);
    } catch (error) {
        console.error('Error al obtener la marca:', error);
        res.status(500).json({ message: 'Error al obtener la marca', error: error.message });
    }
};

// Crear una nueva marca
exports.createMarca = async (req, res) => {
    try {
        const { marca } = req.body;
        if (!marca) {
            return res.status(400).json({ message: 'El campo marca es obligatorio.' });
        }

        const nuevaMarca = new Marca({ marca });
        const resultado = await nuevaMarca.save();
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear la marca:', error);
        res.status(500).json({ message: 'Error al crear la marca', error: error.message });
    }
};

// Actualizar una marca por su ID
exports.updateMarca = async (req, res) => {
    try {
        const { marca } = req.body;
        const updatedMarca = await Marca.findByIdAndUpdate(
            req.params.id,
            { marca },
            { new: true }
        );

        if (!updatedMarca) return res.status(404).json({ message: 'Marca no encontrada' });

        res.status(200).json(updatedMarca);
    } catch (error) {
        console.error('Error al actualizar la marca:', error);
        res.status(500).json({ message: 'Error al actualizar la marca', error: error.message });
    }
};

// Eliminar una marca por su ID
exports.deleteMarca = async (req, res) => {
    try {
        const deletedMarca = await Marca.findByIdAndDelete(req.params.id);
        if (!deletedMarca) return res.status(404).json({ message: 'Marca no encontrada' });
        res.status(200).json({ message: 'Marca eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la marca:', error);
        res.status(500).json({ message: 'Error al eliminar la marca', error: error.message });
    }
};
