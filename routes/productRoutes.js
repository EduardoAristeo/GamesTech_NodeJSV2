// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const productController = require('../controllers/productController');

// Rutas para productos
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/upload', upload.single('image'), productController.uploadProductImage);

module.exports = router;
