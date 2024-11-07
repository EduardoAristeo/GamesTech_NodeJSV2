const mongoose = require('mongoose');

// Esquema de Usuario
const UserSchema = mongoose.Schema({
  user: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { 
    type: String, 
    enum: ['admin', 'tecnico', 'recepcion'], 
    required: true 
  },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fecha_ingreso: { type: Date, required: true }
}, { collection: 'user' });

// Modelo de Usuario
const User = mongoose.model('User', UserSchema);

module.exports = User;
