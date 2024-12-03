const Venta = require('../models/Venta');
const DetalleVenta = require('../models/DetalleVenta');
const Product = require('../models/Product');

// Crear una nueva venta
exports.createVenta = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body); // Verificar datos
    const { userId, metodo_pago, products, total } = req.body;

    // Validar campos requeridos
    if (!userId || !metodo_pago || !products || products.length === 0 || !total) {
      return res.status(400).json({ message: 'Faltan campos obligatorios o productos inválidos.' });
    }

    let totalVenta = 0;

    // Procesar productos
    const detalles = await Promise.all(
      products.map(async (product) => {
        const { productId, quantity, price, discount, utility } = product;

        // Verificar existencia del producto
        const productInDb = await Product.findById(productId);
        if (!productInDb) {
          throw new Error(`Producto no encontrado: ${productId}`);
        }

        // Verificar stock
        if (productInDb.stock < quantity) {
          throw new Error(`Stock insuficiente para el producto: ${productInDb.product}`);
        }

        // Actualizar stock
        productInDb.stock -= quantity;
        await productInDb.save();

        // Calcular subtotal y utilidad
        const descuentoCalculado = (price * discount) / 100;
        const subtotal = price * quantity - descuentoCalculado;

        totalVenta += subtotal;

        return {
          venta_id: null,
          producto_id: productId,
          cantidad: quantity,
          precio_unitario: price,
          descuento: discount,
          subtotal,
          utilidad: parseFloat(utility),
        };
      })
    );

    // Crear venta
    const nuevaVenta = new Venta({
      usuario_id: userId,
      fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      hora: new Date().toLocaleTimeString('en-US', { hour12: false }), // HH:MM:SS
      metodo_pago,
      total: totalVenta,
    });
    await nuevaVenta.save();

    // Asignar ID de la venta a los detalles
    detalles.forEach((detalle) => {
      detalle.venta_id = nuevaVenta._id;
    });

    // Guardar detalles de la venta
    await DetalleVenta.insertMany(detalles);

    res.status(201).json({ message: 'Venta registrada exitosamente', venta: nuevaVenta, detalles });
  } catch (error) {
    console.error('Error al registrar la venta:', error.message);
    res.status(500).json({ message: 'Error al registrar la venta', error: error.message });
  }
};


// Obtener todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('usuario_id', 'nombre email')
      .sort({ fecha: -1 });
    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error.message);
    res.status(500).json({ message: 'Error al obtener las ventas', error: error.message });
  }
};

// Obtener detalles de una venta
exports.getDetallesByVentaId = async (req, res) => {
  const { id } = req.params;
  try {
    const detalles = await DetalleVenta.find({ venta_id: id })
      .populate('producto_id', 'product description');
    res.status(200).json(detalles);
  } catch (error) {
    console.error('Error al obtener los detalles de la venta:', error.message);
    res.status(500).json({ message: 'Error al obtener los detalles', error: error.message });
  }
};

// Eliminar una venta
exports.deleteVenta = async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar detalles de la venta
    await DetalleVenta.deleteMany({ venta_id: id });

    // Eliminar la venta
    const ventaEliminada = await Venta.findByIdAndDelete(id);

    if (!ventaEliminada) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    res.status(200).json({ message: 'Venta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la venta:', error.message);
    res.status(500).json({ message: 'Error al eliminar la venta', error: error.message });
  }
};

// Actualizar una venta
exports.updateVenta = async (req, res) => {
  const { id } = req.params;
  const { userId, metodo_pago, products, total } = req.body;

  try {
    // Validar campos requeridos
    if (!userId || !metodo_pago || !products || products.length === 0 || !total) {
      return res.status(400).json({ message: 'Faltan campos obligatorios o productos inválidos.' });
    }

    // Buscar la venta existente
    const ventaExistente = await Venta.findById(id);
    if (!ventaExistente) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // Eliminar detalles de la venta existente
    await DetalleVenta.deleteMany({ venta_id: id });

    let totalVenta = 0;

    // Procesar productos
    const detalles = await Promise.all(
      products.map(async (product) => {
        const { productId, quantity, price, discount, utility } = product;

        // Verificar existencia del producto
        const productInDb = await Product.findById(productId);
        if (!productInDb) {
          throw new Error(`Producto no encontrado: ${productId}`);
        }

        // Verificar stock
        if (productInDb.stock < quantity) {
          throw new Error(`Stock insuficiente para el producto: ${productInDb.product}`);
        }

        // Actualizar stock
        productInDb.stock -= quantity;
        await productInDb.save();

        // Calcular subtotal y utilidad
        const descuentoCalculado = (price * discount) / 100;
        const subtotal = price * quantity - descuentoCalculado;

        totalVenta += subtotal;

        return {
          venta_id: id,
          producto_id: productId,
          cantidad: quantity,
          precio_unitario: price,
          descuento: discount,
          subtotal,
          utilidad: parseFloat(utility),
        };
      })
    );

    // Actualizar venta
    ventaExistente.usuario_id = userId;
    ventaExistente.metodo_pago = metodo_pago;
    ventaExistente.total = totalVenta;
    await ventaExistente.save();

    // Guardar nuevos detalles de la venta
    await DetalleVenta.insertMany(detalles);

    res.status(200).json({ message: 'Venta actualizada exitosamente', venta: ventaExistente, detalles });
  } catch (error) {
    console.error('Error al actualizar la venta:', error.message);
    res.status(500).json({ message: 'Error al actualizar la venta', error: error.message });
  }
};