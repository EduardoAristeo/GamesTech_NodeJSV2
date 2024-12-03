const paypal = require('@paypal/checkout-server-sdk');

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID, // Variable de entorno para Client ID
  process.env.PAYPAL_SECRET    // Variable de entorno para Secret
);

const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
