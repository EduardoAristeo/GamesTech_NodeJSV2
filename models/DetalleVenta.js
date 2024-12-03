const mongoose = require('mongoose');

const DetalleVentaSchema = new mongoose.Schema({
  venta_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: true },
  producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  descuento: { type: Number, required: true }, // Porcentaje (0-100)
  subtotal: { type: Number, required: true },
  utilidad: { type: Number, required: true }
});

module.exports = mongoose.model('DetalleVenta', DetalleVentaSchema);
