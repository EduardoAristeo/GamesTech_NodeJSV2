const DetalleVenta = require('../models/DetalleVenta');
const mongoose = require('mongoose');
const Venta = require('../models/Venta');

// Obtener todos los detalles de venta
exports.getDetalleVentas = async (req, res) => {
  try {
    const detalles = await DetalleVenta.find(); // Obtiene todos los detalles
    res.status(200).json({ success: true, data: detalles });
  } catch (error) {
    console.error('Error al obtener los detalles de venta:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener los detalles de venta', error: error.message });
  }
};

// Obtener un detalle de venta por ID
exports.getDetalleVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await DetalleVenta.findById(id); // Busca el detalle por ID

    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle de venta no encontrado' });
    }

    res.status(200).json({ success: true, data: detalle });
  } catch (error) {
    console.error('Error al obtener el detalle de venta:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener el detalle de venta', error: error.message });
  }
};
// Obtener la cantidad de productos vendidos agrupados por tiempo PARA GRÁFICO
exports.getProductosVendidosPorTiempo = async (req, res) => {
    try {
      const productosVendidosPorTiempo = await DetalleVenta.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalProductosVendidos: { $sum: '$cantidad' },
          },
        },
        { $sort: { _id: 1 } }, // Ordenar por fecha
      ]);
  
      res.status(200).json({ success: true, data: productosVendidosPorTiempo });
    } catch (error) {
      console.error('Error al obtener los productos vendidos por tiempo:', error.message);
      res.status(500).json({ message: 'Error al obtener productos vendidos por tiempo', error: error.message });
    }
  };


  // DE AQUI PARA ABAJO SON EXTRAS PARA GRAFICOS

  // Obtener cantidad de productos vendidos por tiempo
  exports.getProductosVendidosPorFecha = async (req, res) => {
    try {
      const { producto_id, startDate, endDate, intervalo } = req.query;
  
      if (!producto_id || !startDate || !endDate || !intervalo) {
        return res.status(400).json({ success: false, message: 'Parámetros faltantes' });
      }
  
      const parsedProductoId = new mongoose.Types.ObjectId(producto_id);
  
      const pipeline = [
        {
          $match: {
            producto_id: parsedProductoId,
          },
        },
        {
          $lookup: {
            from: 'ventas',
            localField: 'venta_id',
            foreignField: '_id',
            as: 'venta',
          },
        },
        {
          $unwind: '$venta',
        },
        {
          $match: {
            'venta.fecha': { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: { $dateFromString: { dateString: '$venta.fecha' } },
                unit: intervalo,
              },
            },
            totalProductosVendidos: { $sum: '$cantidad' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];
  
      const resultado = await DetalleVenta.aggregate(pipeline);
  
      res.status(200).json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error al obtener productos vendidos:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener productos vendidos', error: error.message });
    }
  };
  

  // Obtener productos vendidos agrupados por categoría
  exports.getProductosPorCategoria = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      // Validar que las fechas sean proporcionadas
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Faltan los parámetros de fecha' });
      }
  
      const pipeline = [
        {
          $lookup: {
            from: 'ventas', // Colección de ventas
            localField: 'venta_id',
            foreignField: '_id',
            as: 'venta',
          },
        },
        {
          $unwind: '$venta',
        },
        {
          $match: {
            'venta.fecha': { $gte: startDate, $lte: endDate },
          },
        },
        {
          $lookup: {
            from: 'product', // Colección de productos
            localField: 'producto_id',
            foreignField: '_id',
            as: 'producto',
          },
        },
        {
          $unwind: '$producto',
        },
        {
          $lookup: {
            from: 'category', // Colección de categorías
            localField: 'producto.category',
            foreignField: '_id',
            as: 'categoria',
          },
        },
        {
          $unwind: '$categoria',
        },
        {
          $group: {
            _id: '$categoria.category',
            totalVendidos: { $sum: '$cantidad' },
          },
        },
        {
          $sort: { totalVendidos: -1 },
        },
      ];
  
      const resultado = await DetalleVenta.aggregate(pipeline);
  
      res.status(200).json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener productos por categoría', error: error.message });
    }
  };
  