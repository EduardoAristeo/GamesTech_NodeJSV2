const express = require('express');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const clientRoutes = require('./routes/clientRoutes');
const fallaRoutes = require('./routes/fallaRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const reparacionRoutes = require('./routes/reparacionRoutes');

const connectDB = require('./services/mongoose'); // Importar conexión desde mongoose.js
require('dotenv').config();
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());

// Crear la carpeta 'public/uploads/products' si no existe
const uploadsDir = path.join(__dirname, 'public/uploads/products');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Carpeta creada en: ${uploadsDir}`);
}

// Servir archivos estáticos desde la carpeta 'public/uploads/products'
app.use('/images/products', express.static(path.join(__dirname, 'public/uploads/products')));

// Prefijo de la API desde el archivo .env o por defecto '/api'
const API_PREFIX = process.env.API_PREFIX ;

// Conectar a la base de datos
connectDB()
  .then(() => {
    console.log('Database connected successfully.');

    // Rutas
    app.use(`${API_PREFIX}`, userRoutes);
    app.use(`${API_PREFIX}/products`, productRoutes);
    app.use(`${API_PREFIX}/categories`, categoryRoutes);
    app.use(`${API_PREFIX}/clients`, clientRoutes);
    app.use(`${API_PREFIX}/fallas`, fallaRoutes);
    app.use(`${API_PREFIX}/marcas`, marcaRoutes);
    app.use(`${API_PREFIX}/reparaciones`, reparacionRoutes);

    // Puerto desde el archivo .env o por defecto 4000
    const port = process.env.APP_PORT || 4000;

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Salir del proceso si no se puede conectar a la base de datos
  });
