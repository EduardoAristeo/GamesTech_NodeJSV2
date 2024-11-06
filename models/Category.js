// models/Category.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de Categoría
const CategorySchema = mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String }
}, { collection: 'category' });

// Modelo de Categoría
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
