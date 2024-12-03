const Venta = require('../models/Venta');
const DetalleVenta = require('../models/DetalleVenta');
const Product = require('../models/Product');
const Category = require('../models/Category');

const obtenerReporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debe proporcionar un rango de fechas' });
    }

    // Buscar ventas en el rango de fechas
    const ventas = await Venta.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    }).populate('usuario_id');

    if (!ventas.length) {
      return res.json({ success: true, data: {}, message: 'No hay ventas en este rango de fechas.' });
    }

    // Obtener detalles de ventas
    const detallesVentas = await DetalleVenta.find({
      venta_id: { $in: ventas.map((venta) => venta._id) }
    }).populate({
      path: 'producto_id',
      populate: { path: 'category' }
    });

    // Variables acumulativas
    let totalProductosVendidos = 0;
    let totalUtilidad = 0; // Variable para acumular la utilidad total
    let utilidadPorProducto = {};
    let utilidadPorCategoria = {};
    let productosPorCategoria = {};
    let productosVendidos = {};
    let ventasPorUsuario = {};
    let totalVentas = 0;
    let metodoPagoTotales = {};

    // Procesar detalles de ventas
    detallesVentas.forEach((detalle) => {
      const producto = detalle.producto_id;
      const categoria = producto.category;

      // Total de productos vendidos
      totalProductosVendidos += detalle.cantidad;

      // Acumular utilidad total
      totalUtilidad += detalle.utilidad;

      // Acumular utilidad por producto
      if (!utilidadPorProducto[producto._id]) {
        utilidadPorProducto[producto._id] = {
          producto: producto.product,
          utilidad: 0,
          cantidadVendida: 0,
        };
      }
      utilidadPorProducto[producto._id].utilidad += detalle.utilidad;
      utilidadPorProducto[producto._id].cantidadVendida += detalle.cantidad;

      // Acumular utilidad por categoría
      if (!utilidadPorCategoria[categoria._id]) {
        utilidadPorCategoria[categoria._id] = {
          categoria: categoria.category,
          utilidad: 0,
        };
      }
      utilidadPorCategoria[categoria._id].utilidad += detalle.utilidad;

      // Acumular productos vendidos por categoría
      if (!productosPorCategoria[categoria._id]) {
        productosPorCategoria[categoria._id] = {
          categoria: categoria.category,
          cantidadVendida: 0,
        };
      }
      productosPorCategoria[categoria._id].cantidadVendida += detalle.cantidad;

      // Contar productos vendidos
      if (!productosVendidos[producto._id]) {
        productosVendidos[producto._id] = {
          producto: producto.product,
          cantidadVendida: 0,
        };
      }
      productosVendidos[producto._id].cantidadVendida += detalle.cantidad;

      // Acumular productos vendidos por usuario
      const venta = ventas.find((v) => v._id.equals(detalle.venta_id));
      if (venta) {
        const usuario = venta.usuario_id;
        if (!ventasPorUsuario[usuario._id]) {
          ventasPorUsuario[usuario._id] = {
            usuario: usuario.nombre,
            totalVentas: 0,
            totalProductosVendidos: 0,
          };
        }
        ventasPorUsuario[usuario._id].totalProductosVendidos += detalle.cantidad;
      }
    });

    // Procesar ventas
    ventas.forEach((venta) => {
      totalVentas += venta.total;

      // Contar por método de pago
      if (!metodoPagoTotales[venta.metodo_pago]) {
        metodoPagoTotales[venta.metodo_pago] = 0;
      }
      metodoPagoTotales[venta.metodo_pago] += venta.total;

      // Sumar total de ventas por usuario
      const usuario = venta.usuario_id;
      if (ventasPorUsuario[usuario._id]) {
        ventasPorUsuario[usuario._id].totalVentas += venta.total;
      }
    });

    // Calcular el top 3 productos más vendidos
    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 3);

    // Calcular la categoría más vendida
    const topCategoria = Object.values(productosPorCategoria).sort(
      (a, b) => b.cantidadVendida - a.cantidadVendida
    )[0];

    // Respuesta final
    res.json({
      success: true,
      data: {
        totalProductosVendidos,
        utilidadPorProducto: Object.values(utilidadPorProducto),
        utilidadPorCategoria: Object.values(utilidadPorCategoria),
        productosPorCategoria: Object.values(productosPorCategoria),
        totalUtilidad,
        totalVentas,
        metodoPagoTotales,
        ventasPorUsuario: Object.values(ventasPorUsuario),
        topProductos,
        topCategoria,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte de ventas' });
  }
};

module.exports = {
  obtenerReporteVentas,
};
