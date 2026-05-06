const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getFeaturedProducts,
    getBestsellerProducts,
    getNewArrivalProducts,
    getProductsByCategory,
    addProductReview,
    getCategories,
    seedProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestsellerProducts);
router.get('/newarrivals', getNewArrivalProducts);
router.get('/categories', getCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/seed', seedProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/:id/reviews', protect, addProductReview);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
