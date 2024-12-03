const mongoose = require('mongoose');
const ReparacionSchema = new mongoose.Schema({
  recepcion: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tecnico: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Asegúrate que ambos apunten a 'User'
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  marca: { type: mongoose.Schema.Types.ObjectId, ref: 'Marca', required: true },
  modelo: { type: String, required: true },
  fechaIngreso: { type: Date, required: true },
  horaIngreso: { type: String, required: true },
  fechaDiagnostico: { type: Date },
  horaDiagnostico: { type: String },
  fechaReparado: { type: Date },
  horaReparado: { type: String },
  fechaEntregado: { type: Date },
  horaEntregado: { type: String },
  estatus: { type: String, enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO', 'GARANTIA','SIN REPARACION','ENTREGADO'], default: 'PENDIENTE' },
  cotizacion: { type: Number, required: true },
  adelanto: { type: Number },
  sim: { type: Boolean },
  manipulado: { type: Boolean },
  mojado: { type: Boolean },
  apagado: { type: Boolean },
  pantallaRota: { type: Boolean },
  tapaRota: { type: Boolean },
  descripcion: { type: String },
  password: {
    tipo: { type: String, enum: ['texto', 'digitos', 'patron'], required: true },
    valor: { type: String, required: true } // Guardará texto, dígitos o el patrón como JSON
  },
  fallas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Falla' }] // Nuevo campo fallas como arreglo de ObjectId referenciando la colección 'Falla'
});

module.exports = mongoose.model('Reparacion', ReparacionSchema, 'reparacion');
