const mongoose = require('mongoose');

// Esquema de Categoría
const CategorySchema = mongoose.Schema(
  {
    category: { type: String, required: true }, // Nombre de la categoría
    description: { type: String, required: true }, // Descripción de la categoría
  },
  { collection: 'category' } // Nombre exacto de la colección en MongoDB
);

// Modelo de Categoría
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
