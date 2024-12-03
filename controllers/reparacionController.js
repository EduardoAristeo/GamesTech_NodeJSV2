const Reparacion = require('../models/Reparacion');
const mongoose = require('mongoose');
const moment = require('moment'); // Para trabajar con fechas

// Obtener todas las reparaciones sin paginación
exports.getReparaciones = async (req, res) => {
  try {
    const populateFields = [
      { path: 'recepcion', select: 'nombre apellido' },
      { path: 'tecnico', select: 'nombre apellido' },
      { path: 'cliente', select: 'firstName lastName phone' },
      { path: 'marca', select: 'marca' },
    ];

    const reparaciones = await Reparacion.find().populate(populateFields);
    res.status(200).json({ data: reparaciones });
  } catch (error) {
    console.error('Error al obtener las reparaciones:', error);
    res.status(500).json({ message: 'Error al obtener las reparaciones', error: error.message });
  }
};

/// Obtener una reparación por ID
exports.getReparacionById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const reparacion = await Reparacion.findById(req.params.id)
      .populate('recepcion', 'nombre apellido')
      .populate('tecnico', 'nombre apellido')
      .populate('cliente', 'firstName lastName phone')
      .populate('marca', 'marca')
      .populate('fallas', 'falla'); // Agregar esta línea para incluir las descripciones de las fallas
      
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
    const {
      recepcion,
      tecnico = null,
      cliente,
      marca,
      modelo,
      descripcion = '',
      fallas = [],
      sim = false,
      manipulado = false,
      mojado = false,
      apagado = false,
      pantallaRota = false,
      tapaRota = false,
      cotizacion,
      adelanto = 0,
      password,
      fechaDiagnostico = null, // Diagnóstico enviado desde el frontend
      horaDiagnostico = null, // Diagnóstico enviado desde el frontend
      fechaReparado = null,
      horaReparado = null,
      fechaEntregado = null,
      horaEntregado = null,
    } = req.body;

    // Validar que los campos obligatorios existan
    if (!recepcion || !cliente || !marca || !modelo || !cotizacion || !password) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    // Generar automáticamente fecha y hora de ingreso
    const fechaIngreso = moment().toISOString();
    const horaIngreso = moment().format('hh:mm A');

    const nuevaReparacion = new Reparacion({
      recepcion,
      tecnico,
      cliente,
      marca,
      modelo,
      descripcion,
      fallas,
      sim,
      manipulado,
      mojado,
      apagado,
      pantallaRota,
      tapaRota,
      cotizacion,
      adelanto,
      password,
      fechaIngreso,
      horaIngreso,
      fechaDiagnostico,
      horaDiagnostico,
      fechaReparado,
      horaReparado,
      fechaEntregado,
      horaEntregado,
    });

    const result = await nuevaReparacion.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear la reparación:', error);
    res.status(500).json({ message: 'Error al crear la reparación', error: error.message });
  }
};

// Actualizar una reparación
exports.updateReparacion = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const updatedReparacion = await Reparacion.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('recepcion', 'nombre apellido')
      .populate('tecnico', 'nombre apellido')
      .populate('cliente', 'firstName lastName phone')
      .populate('marca', 'marca');

    if (!updatedReparacion) return res.status(404).json({ message: 'Reparación no encontrada' });
    res.status(200).json(updatedReparacion);
  } catch (error) {
    console.error('Error al actualizar la reparación:', error);
    res.status(500).json({ message: 'Error al actualizar la reparación', error: error.message });
  }
};

// Eliminar una reparación
exports.deleteReparacion = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const deletedReparacion = await Reparacion.findByIdAndDelete(req.params.id);
    if (!deletedReparacion) return res.status(404).json({ message: 'Reparación no encontrada' });
    res.status(200).json({ message: 'Reparación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la reparación:', error);
    res.status(500).json({ message: 'Error al eliminar la reparación', error: error.message });
  }
};


// Obtener reparaciones del día actual agrupadas por marca
exports.getReparacionesPorFechaYMarca = async (req, res) => {
  try {
    const hoyInicio = moment().startOf('day').toDate(); // Inicio del día actual como Date
    const hoyFin = moment().endOf('day').toDate(); // Fin del día actual como Date

    const reparaciones = await Reparacion.aggregate([
      {
        $match: {
          fechaIngreso: { $gte: hoyInicio, $lte: hoyFin }, // Filtrar por fechaIngreso en el rango de hoy
        },
      },
      {
        $lookup: {
          from: 'marca', // Asegúrate de que este sea el nombre correcto de tu colección de marcas
          localField: 'marca',
          foreignField: '_id',
          as: 'marca',
        },
      },
      {
        $unwind: '$marca',
      },
      {
        $group: {
          _id: '$marca.marca', // Agrupa por el nombre de la marca
          total: { $sum: 1 }, // Cuenta el total de reparaciones por marca
        },
      },
    ]);

    res.status(200).json({ success: true, data: reparaciones });
  } catch (error) {
    console.error('Error al obtener reparaciones por fecha y marca:', error.message);
    res.status(500).json({ message: 'Error al obtener reparaciones', error: error.message });
  }
};


exports.getTablaReparaciones = async (req, res) => {
  try {
    const reparaciones = await Reparacion.aggregate([
      {
        $lookup: {
          from: 'marca',
          localField: 'marca',
          foreignField: '_id',
          as: 'marca',
        },
      },
      { $unwind: '$marca' },
      {
        $lookup: {
          from: 'client',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente',
        },
      },
      { $unwind: '$cliente' },
      {
        $lookup: {
          from: 'falla',
          localField: 'fallas',
          foreignField: '_id',
          as: 'fallas', // Devuelve el arreglo completo de fallas
        },
      },
      {
        $addFields: {
          diasPendientes: {
            $cond: [
              { $eq: ['$estatus', 'PENDIENTE'] },
              {
                $subtract: [
                  { $dateDiff: { startDate: new Date(), endDate: '$fechaDiagnostico', unit: 'day' } },
                  1,
                ],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          modelo: 1,
          estatus: 1,
          marca: '$marca.marca',
          cliente: {
            nombre: '$cliente.firstName',
            apellido: '$cliente.lastName',
          },
          cotizacion: 1,
          adelanto: 1,
          sim: 1,
          manipulado: 1,
          mojado: 1,
          apagado: 1,
          pantallaRota: 1,
          tapaRota: 1,
          descripcion: 1,
          password: 1,
          fallas: { falla: 1 }, // Devuelve el arreglo completo de fallas
          diasPendientes: 1,
          fechaIngreso: {
            $dateToString: { format: '%Y-%m-%d', date: '$fechaIngreso' },
          },
          horaIngreso: 1,
          fechaDiagnostico: {
            $dateToString: { format: '%Y-%m-%d', date: '$fechaDiagnostico' },
          },
          horaDiagnostico: 1,
          fechaReparado: {
            $cond: [
              { $ne: ['$fechaReparado', null] },
              { $dateToString: { format: '%Y-%m-%d', date: '$fechaReparado' } },
              null,
            ],
          },
          horaReparado: 1,
          fechaEntregado: {
            $cond: [
              { $ne: ['$fechaEntregado', null] },
              { $dateToString: { format: '%Y-%m-%d', date: '$fechaEntregado' } },
              null,
            ],
          },
          horaEntregado: 1,
        },
      },
    ]);

    // Procesar el resultado final para formatear las fechas con moment si es necesario
    const reparacionesFormateadas = reparaciones.map((reparacion) => ({
      ...reparacion,
      fechaIngreso: reparacion.fechaIngreso
        ? moment(reparacion.fechaIngreso).format('YYYY-MM-DD')
        : null,
      fechaDiagnostico: reparacion.fechaDiagnostico
        ? moment(reparacion.fechaDiagnostico).format('YYYY-MM-DD')
        : null,
      fechaReparado: reparacion.fechaReparado
        ? moment(reparacion.fechaReparado).format('YYYY-MM-DD')
        : null,
      fechaEntregado: reparacion.fechaEntregado
        ? moment(reparacion.fechaEntregado).format('YYYY-MM-DD')
        : null,
    }));

    res.status(200).json({ success: true, data: reparacionesFormateadas });
  } catch (error) {
    console.error('Error al obtener las reparaciones:', error.message);
    res.status(500).json({ message: 'Error al obtener las reparaciones', error: error.message });
  }
};


// Actualizar múltiples reparaciones
exports.updateMultipleReparaciones = async (req, res) => {
  console.log('Body:', req.body);
  
  const { ids, newStatus, tecnicoId } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Debe proporcionar una lista de IDs' });
  }

  try {
    const now = new Date();
    const updates = ids.map((id) => {
      const updateData = { tecnico: tecnicoId, estatus: newStatus };

      // Establecer fechas y horas según el nuevo estatus
      if (newStatus === 'COMPLETADO') {
        updateData.fechaReparado = now.toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
        updateData.horaReparado = now.toLocaleTimeString(); // Hora local
      } else if (newStatus === 'ENTREGADO') {
        updateData.fechaEntregado = now.toISOString().split('T')[0];
        updateData.horaEntregado = now.toLocaleTimeString();
      }

      return Reparacion.findByIdAndUpdate(id, updateData, { new: true });
    });

    // Ejecutar todas las actualizaciones en paralelo
    const updatedReparaciones = await Promise.all(updates);

    res.status(200).json({ success: true, data: updatedReparaciones });
  } catch (error) {
    console.error('Error al actualizar las reparaciones:', error.message);
    res.status(500).json({ message: 'Error al actualizar las reparaciones', error: error.message });
  }
};


exports.getReparacionesPorCategoria = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Se requieren los parámetros fechaInicio y fechaFin' });
  }

  try {
    // Convertir fechas al formato `Date`
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T23:59:59Z`);

    const reparaciones = await Reparacion.aggregate([
      {
        $match: {
          fechaIngreso: { 
            $gte: inicio, 
            $lte: fin 
          },
        },
      },
      {
        $lookup: {
          from: 'marca',
          localField: 'marca',
          foreignField: '_id',
          as: 'marca',
        },
      },
      { $unwind: '$marca' },
      {
        $group: {
          _id: '$marca.marca',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ success: true, data: reparaciones });
  } catch (error) {
    console.error('Error al obtener reparaciones por categoría:', error.message);
    res.status(500).json({ message: 'Error al obtener datos', error: error.message });
  }
};

// Reparaciones por estatus
exports.getReparacionesPorEstatus = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Se requieren los parámetros fechaInicio y fechaFin' });
  }

  try {
    // Convertir fechas al formato `Date`
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T23:59:59Z`);
    const reparaciones = await Reparacion.aggregate([
      {
        $match: {
          fechaIngreso: { 
            $gte: new Date(fechaInicio), 
            $lte: new Date(fechaFin) 
          },
        },
      },
      {
        $group: {
          _id: '$estatus',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ success: true, data: reparaciones });
  } catch (error) {
    console.error('Error al obtener reparaciones por estatus:', error.message);
    res.status(500).json({ message: 'Error al obtener datos', error: error.message });
  }
};

// Reparaciones por técnico
exports.getReparacionesPorTecnico = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Se requieren los parámetros fechaInicio y fechaFin' });
  }

  try {
    // Convertir fechas al formato `Date`
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T23:59:59Z`);

    const reparaciones = await Reparacion.aggregate([
      {
        $match: {
          fechaReparado: { 
            $gte: inicio, 
            $lte: fin 
          },
        },
      },
      {
        $lookup: {
          from: 'user', // Asegúrate de que el nombre de la colección es correcto
          localField: 'tecnico',
          foreignField: '_id',
          as: 'tecnico',
        },
      },
      { $unwind: '$tecnico' },
      {
        $group: {
          _id: { nombre: '$tecnico.nombre', apellido: '$tecnico.apellido' },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } }, // Ordenar por el total de reparaciones, de mayor a menor
    ]);

    res.status(200).json({ success: true, data: reparaciones });
  } catch (error) {
    console.error('Error al obtener reparaciones por técnico:', error.message);
    res.status(500).json({ message: 'Error al obtener datos', error: error.message });
  }
};


// Reparaciones por falla
exports.getReparacionesPorFalla = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Se requieren los parámetros fechaInicio y fechaFin' });
  }

  try {
    // Convertir fechas al formato `Date`
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T23:59:59Z`);
    const reparaciones = await Reparacion.aggregate([
      {
        $match: {
          fechaIngreso: { 
            $gte: new Date(fechaInicio), 
            $lte: new Date(fechaFin) 
          },
        },
      },
      {
        $lookup: {
          from: 'falla',
          localField: 'fallas',
          foreignField: '_id',
          as: 'fallas',
        },
      },
      { $unwind: '$fallas' },
      {
        $group: {
          _id: '$fallas.falla',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ success: true, data: reparaciones });
  } catch (error) {
    console.error('Error al obtener reparaciones por falla:', error.message);
    res.status(500).json({ message: 'Error al obtener datos', error: error.message });
  }
};


// Reparaciones agrupadas por marca y fecha
exports.getReparacionesPorMarca = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Se requieren los parámetros fechaInicio y fechaFin' });
  }

  try {
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T23:59:59Z`);

    const reparaciones = await Reparacion.aggregate([
      {
        $match: {
          fechaIngreso: { $gte: inicio, $lte: fin }, // Filtrar por rango de fechas
        },
      },
      {
        $lookup: {
          from: 'marca', // Nombre de la colección de marcas
          localField: 'marca',
          foreignField: '_id',
          as: 'marca',
        },
      },
      { $unwind: '$marca' },
      {
        $group: {
          _id: '$marca.marca', // Agrupar por nombre de la marca
          total: { $sum: 1 }, // Contar reparaciones por marca
        },
      },
      { $sort: { total: -1 } }, // Ordenar por la cantidad descendente
    ]);

    res.status(200).json({ success: true, data: reparaciones });
  } catch (error) {
    console.error('Error al obtener reparaciones por marca:', error.message);
    res.status(500).json({ message: 'Error al obtener datos', error: error.message });
  }
};


exports.getReporteCompleto = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Se requieren los parámetros fechaInicio y fechaFin' });
  }

  try {
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T23:59:59Z`);

    // Sumatoria de cotizaciones por estatus
    const cotizacionesEntregadas = await Reparacion.aggregate([
      {
        $match: {
          estatus: 'ENTREGADO',
          fechaIngreso: { $gte: inicio, $lte: fin },
        },
      },
      { $group: { _id: null, total: { $sum: '$cotizacion' } } },
    ]);

    const cotizacionesCompletadas = await Reparacion.aggregate([
      {
        $match: {
          estatus: 'COMPLETADO',
          fechaIngreso: { $gte: inicio, $lte: fin },
        },
      },
      { $group: { _id: null, total: { $sum: '$cotizacion' } } },
    ]);

    // Cantidad de reparaciones ingresadas
    const cantidadIngresadas = await Reparacion.countDocuments({
      fechaIngreso: { $gte: inicio, $lte: fin },
    });

    // Cantidad de reparaciones por falla
    const reparacionesPorFalla = await Reparacion.aggregate([
      {
        $match: { fechaIngreso: { $gte: inicio, $lte: fin } },
      },
      { $unwind: '$fallas' },
      {
        $lookup: {
          from: 'falla',
          localField: 'fallas',
          foreignField: '_id',
          as: 'falla',
        },
      },
      { $unwind: '$falla' },
      {
        $group: {
          _id: '$falla.falla',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Cantidad de reparaciones por técnico
    const reparacionesPorTecnico = await Reparacion.aggregate([
      {
        $match: { fechaIngreso: { $gte: inicio, $lte: fin } },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'tecnico',
          foreignField: '_id',
          as: 'tecnico',
        },
      },
      { $unwind: { path: '$tecnico', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { nombre: '$tecnico.nombre', apellido: '$tecnico.apellido' },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Cantidad de reparaciones por estatus
    const reparacionesPorEstatus = await Reparacion.aggregate([
      {
        $match: { fechaIngreso: { $gte: inicio, $lte: fin } },
      },
      {
        $group: {
          _id: '$estatus',
          total: { $sum: 1 },
        },
      },
    ]);

    // Top 5 fallas más recurrentes
    const top5Fallas = reparacionesPorFalla.slice(0, 5);

    // Reparaciones segmentadas por estatus
    const reparacionesSegmentadas = await Reparacion.aggregate([
      {
        $match: { fechaIngreso: { $gte: inicio, $lte: fin } },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'recepcion',
          foreignField: '_id',
          as: 'recepcion',
        },
      },
      { $unwind: '$recepcion' },
      {
        $lookup: {
          from: 'user',
          localField: 'tecnico',
          foreignField: '_id',
          as: 'tecnico',
        },
      },
      { $unwind: { path: '$tecnico', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'client',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente',
        },
      },
      { $unwind: '$cliente' },
      {
        $lookup: {
          from: 'marca',
          localField: 'marca',
          foreignField: '_id',
          as: 'marca',
        },
      },
      { $unwind: '$marca' },
      {
        $lookup: {
          from: 'falla',
          localField: 'fallas',
          foreignField: '_id',
          as: 'fallas',
        },
      },
      {
        $project: {
          recepcion: { nombre: '$recepcion.nombre', apellido: '$recepcion.apellido' },
          tecnico: { nombre: '$tecnico.nombre', apellido: '$tecnico.apellido' },
          cliente: { nombre: '$cliente.firstName', apellido: '$cliente.lastName' },
          marca: '$marca.marca',
          modelo: 1,
          fechaIngreso: 1,
          fechaDiagnostico: 1,
          fechaEntregado: 1,
          estatus: 1,
          cotizacion: 1,
          fallas: { falla: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        cotizacionesEntregadas: cotizacionesEntregadas[0]?.total || 0,
        cotizacionesCompletadas: cotizacionesCompletadas[0]?.total || 0,
        cantidadIngresadas,
        reparacionesPorFalla,
        reparacionesPorTecnico,
        reparacionesPorEstatus,
        top5Fallas,
        reparacionesSegmentadas,
      },
    });
  } catch (error) {
    console.error('Error al generar el reporte completo:', error.message);
    res.status(500).json({ message: 'Error al generar el reporte', error: error.message });
  }
};
