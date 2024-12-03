const paypal = require('@paypal/checkout-server-sdk');
const client = require('../config/paypal'); // Cliente PayPal configurado en Sandbox

// Crear una orden
exports.createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Se requiere un monto para crear la orden' });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: amount,
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.status(201).json({ id: order.result.id });
  } catch (error) {
    console.error('Error al crear la orden:', error);
    res.status(500).json({ error: 'Error al crear la orden', details: error.message });
  }
};

// Capturar una orden
exports.captureOrder = async (req, res) => {
  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ message: 'Se requiere el ID de la orden para capturar el pago' });
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.status(200).json({ success: true, data: capture.result });
  } catch (error) {
    console.error('Error al capturar la orden:', error);
    res.status(500).json({ error: 'Error al capturar la orden', details: error.message });
  }
};
