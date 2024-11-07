const mongoose = require('mongoose');

const MarcaSchema = new mongoose.Schema({
  marca: { type: String, required: true }
}, { collection: 'marca' });

const Marca = mongoose.model('Marca', MarcaSchema);

module.exports = Marca;
