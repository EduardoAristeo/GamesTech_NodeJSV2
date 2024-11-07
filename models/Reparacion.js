const mongoose = require('mongoose');

const ReparacionSchema = mongoose.Schema({
  recepcion: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tecnico: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Inicialmente puede ser null
  marca: { type: mongoose.Schema.Types.ObjectId, ref: 'Marca', required: true },
  modelo: { type: String, required: true },
  fechaIngreso: { type: Date, required: true },
  horaIngreso: { type: String, required: true },
  fechaProgramada: { type: Date, required: true },
  horaProgramada: { type: String, required: true },
  fechaReparado: { type: Date, required: false, default: null },
  horaReparado: { type: String, required: false, default: null },
  fechaEntregado: { type: Date, required: false, default: null },
  horaEntregado: { type: String, required: false, default: null },
  estatus: { type: String, required: true, enum: ['PENDIENTE', 'REPARADO', 'ENTREGADO'] },
  cotizacion: { type: Number, required: true },
  adelanto: { type: Number, required: true },
  sim: { type: Boolean, required: true },
  manipulado: { type: Boolean, required: true },
  mojado: { type: Boolean, required: true },
  apagado: { type: Boolean, required: true },
  pantallaRota: { type: Boolean, required: true },
  tapaRota: { type: Boolean, required: true },
  descripcion: { type: String, required: true },
}, { collection: 'reparacion', timestamps: true });

const Reparacion = mongoose.model('Reparacion', ReparacionSchema);
module.exports = Reparacion;
