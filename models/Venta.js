const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  total: { type: Number, required: true },
  metodo_pago: { type: String, required: true }, // Nuevo campo
});

module.exports = mongoose.model('Venta', VentaSchema);
