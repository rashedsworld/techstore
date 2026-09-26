const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router
  .route('/')
  .get(getProducts)
  .post(protectRoute, adminOnly, upload.array('images', 5), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .delete(protectRoute, adminOnly, deleteProduct);

module.exports = router;