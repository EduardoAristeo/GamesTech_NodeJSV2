const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema para Falla
const FallaSchema = new Schema({
  falla: { type: String, required: true }, // Campo requerido
}, { collection: 'falla' }); // Nombre exacto de la colección en MongoDB

// Modelo de Falla
const Falla = mongoose.model('Falla', FallaSchema);

module.exports = Falla;
