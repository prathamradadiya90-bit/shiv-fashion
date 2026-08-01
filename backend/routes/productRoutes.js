const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  createProductReview
} = require('../controllers/productController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, superAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, superAdmin, updateProduct)
  .delete(protect, superAdmin, deleteProduct);

router.route('/:id/wishlist')
  .post(protect, toggleWishlist);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;
