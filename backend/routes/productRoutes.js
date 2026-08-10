const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  createProductReview,
  getAllReviews,
  deleteReview
} = require('../controllers/productController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, superAdmin, createProduct);

// Place /reviews/all before /:id so it doesn't get matched as an ID
router.route('/reviews/all')
  .get(protect, superAdmin, getAllReviews);

router.route('/reviews/:id')
  .delete(protect, superAdmin, deleteReview);

router.route('/:id')
  .get(getProductById)
  .put(protect, superAdmin, updateProduct)
  .delete(protect, superAdmin, deleteProduct);

router.route('/:id/wishlist')
  .post(protect, toggleWishlist);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;
