const mongoose = require('mongoose');
const Category = require('./Category')
const Schema = mongoose.Schema;

// Esquema de Producto
const ProductSchema = mongoose.Schema({
  product: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  cost: { type: Number, required: true },
  description: { type: String },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', // Debe coincidir con el nombre del modelo de categoría, no de la colección
    required: true 
  },
  status:{type: String, required: true}
}, { collection: 'product' }); // Nombre exacto de la colección en MongoDB

// Modelo de Producto
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
