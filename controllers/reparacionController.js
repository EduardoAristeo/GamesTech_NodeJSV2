const Reparacion = require('../models/Reparacion');

// Obtener todas las reparaciones
exports.getReparaciones = async (req, res) => {
  try {
    const reparaciones = await Reparacion.find()
      .populate('recepcion', 'nombre apellido')
      .populate('tecnico', 'nombre apellido')
      .populate('marca', 'marca');
    res.status(200).json(reparaciones);
  } catch (error) {
    console.error('Error al obtener las reparaciones:', error);
    res.status(500).json({ message: 'Error al obtener las reparaciones', error: error.message });
  }
};

// Obtener una reparación por ID
exports.getReparacionById = async (req, res) => {
  try {
    const reparacion = await Reparacion.findById(req.params.id)
      .populate('recepcion', 'nombre apellido')
      .populate('tecnico', 'nombre apellido')
      .populate('marca', 'marca');
    if (!reparacion) return res.status(404).json({ message: 'Reparación no encontrada' });
    res.status(200).json(reparacion);
  } catch (error) {
    console.error('Error al obtener la reparación:', error);
    res.status(500).json({ message: 'Error al obtener la reparación', error: error.message });
  }
};

// Crear una nueva reparación
exports.createReparacion = async (req, res) => {
  try {
    const nuevaReparacion = new Reparacion(req.body);
    const result = await nuevaReparacion.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear la reparación:', error);
    res.status(500).json({ message: 'Error al crear la reparación', error: error.message });
  }
};

// Actualizar una reparación
exports.updateReparacion = async (req, res) => {
  try {
    const updatedReparacion = await Reparacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReparacion) return res.status(404).json({ message: 'Reparación no encontrada' });
    res.status(200).json(updatedReparacion);
  } catch (error) {
    console.error('Error al actualizar la reparación:', error);
    res.status(500).json({ message: 'Error al actualizar la reparación', error: error.message });
  }
};

// Eliminar una reparación
exports.deleteReparacion = async (req, res) => {
  try {
    const deletedReparacion = await Reparacion.findByIdAndDelete(req.params.id);
    if (!deletedReparacion) return res.status(404).json({ message: 'Reparación no encontrada' });
    res.status(200).json({ message: 'Reparación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la reparación:', error);
    res.status(500).json({ message: 'Error al eliminar la reparación', error: error.message });
  }
};
