const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema para Cliente
const ClientSchema = new Schema({
  firstName: { type: String, required: true }, // Primer nombre obligatorio
  secondName: { type: String }, // Segundo nombre opcional
  lastName: { type: String, required: true }, // Primer apellido obligatorio
  secondLastName: { type: String }, // Segundo apellido opcional
  phone: { type: String, required: true }, // Teléfono obligatorio
  secondPhone: { type: String }, // Teléfono secundario opcional
  dateInserted: { type: Date, default: Date.now }, // Fecha de inserción con valor por defecto
}, { collection: 'client' }); // Nombre exacto de la colección en MongoDB

// Modelo de Cliente
const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
