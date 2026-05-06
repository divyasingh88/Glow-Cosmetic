const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.page) || 1;
        
        const keyword = req.query.keyword 
            ? { name: { $regex: req.query.keyword, $options: 'i' } }
            : {};
            
        const category = req.query.category 
            ? { category: req.query.category }
            : {};
            
        const count = await Product.countDocuments({ ...keyword, ...category });
        
        const products = await Product.find({ ...keyword, ...category })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ featured: true }).limit(8);

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get bestseller products
// @route   GET /api/products/bestsellers
// @access  Public
exports.getBestsellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ bestseller: true }).limit(8);

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get new arrival products
// @route   GET /api/products/newarrivals
// @access  Public
exports.getNewArrivalProducts = async (req, res) => {
    try {
        const products = await Product.find({ newArrival: true }).limit(8);

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });

        res.json({
            success: true,
            products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;

        // Create slug from name
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const product = await Product.create({
            name,
            slug,
            description,
            price,
            category,
            stock,
            images: images || [],
            brand: 'GLOW Cosmetics'
        });

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, images, featured, bestseller, newArrival } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (images) product.images = images;
        if (featured !== undefined) product.featured = featured;
        if (bestseller !== undefined) product.bestseller = bestseller;
        if (newArrival !== undefined) product.newArrival = newArrival;

        // Update slug if name changed
        if (name) {
            product.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const updatedProduct = await product.save();

        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            review => review.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'Product already reviewed'
            });
        }

        const review = {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();

        res.json({
            success: true,
            message: 'Review added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Seed initial products
// @route   POST /api/products/seed
// @access  Public
exports.seedProducts = async (req, res) => {
    try {
        // Check if products already exist
        const count = await Product.countDocuments();
        
        if (count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Products already seeded'
            });
        }

        const products = [
            {
                name: 'Rose Glow Serum',
                slug: 'rose-glow-serum',
                description: 'A luxurious serum infused with pure rose extracts and vitamin C to give your skin a radiant, glowing complexion. Perfect for all skin types.',
                price: 29.99,
                originalPrice: 39.99,
                category: 'skincare',
                stock: 100,
                ratings: 4.8,
                numReviews: 156,
                featured: true,
                bestseller: true,
                newArrival: false,
                images: [{ public_id: 'rose-glow', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500' }]
            },
            {
                name: 'Gentle Cleansing Milk',
                slug: 'gentle-cleansing-milk',
                description: 'A mild, moisturizing cleansing milk that gently removes impurities while preserving your skin natural moisture barrier.',
                price: 24.99,
                originalPrice: 0,
                category: 'skincare',
                stock: 150,
                ratings: 4.6,
                numReviews: 89,
                featured: true,
                bestseller: false,
                newArrival: true,
                images: [{ public_id: 'cleansing-milk', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500' }]
            },
            {
                name: 'Hydrating Face Cream',
                slug: 'hydrating-face-cream',
                description: 'Deeply hydrating cream with hyaluronic acid and aloe vera for plump, dewy skin. Lightweight formula absorbs instantly.',
                price: 34.99,
                originalPrice: 44.99,
                category: 'skincare',
                stock: 80,
                ratings: 4.9,
                numReviews: 203,
                featured: true,
                bestseller: true,
                newArrival: false,
                images: [{ public_id: 'face-cream', url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500' }]
            },
            {
                name: 'Detox Clay Mask',
                slug: 'detox-clay-mask',
                description: 'Purifying clay mask that draws out toxins and excess oil while minimizing pores. Infused with tea tree and green tea.',
                price: 27.99,
                originalPrice: 0,
                category: 'skincare',
                stock: 60,
                ratings: 4.5,
                numReviews: 67,
                featured: false,
                bestseller: false,
                newArrival: true,
                images: [{ public_id: 'clay-mask', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500' }]
            },
            {
                name: 'Vitamin C Brightening Cream',
                slug: 'vitamin-c-brightening-cream',
                description: 'Powerful vitamin C cream that brightens skin tone and reduces dark spots. Protects against environmental damage.',
                price: 42.99,
                originalPrice: 52.99,
                category: 'skincare',
                stock: 90,
                ratings: 4.7,
                numReviews: 124,
                featured: true,
                bestseller: true,
                newArrival: false,
                images: [{ public_id: 'vit-c-cream', url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500' }]
            },
            {
                name: 'Nourishing Hair Mask',
                slug: 'nourishing-hair-mask',
                description: 'Deep conditioning hair mask with argan oil and keratin. Repairs damaged hair and adds shine.',
                price: 32.99,
                originalPrice: 0,
                category: 'haircare',
                stock: 70,
                ratings: 4.6,
                numReviews: 78,
                featured: false,
                bestseller: false,
                newArrival: true,
                images: [{ public_id: 'hair-mask', url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500' }]
            },
            {
                name: 'Luxury Body Lotion',
                slug: 'luxury-body-lotion',
                description: 'Ultra-moisturizing body lotion with shea butter and almond oil. Leaves skin silky smooth and lightly scented.',
                price: 28.99,
                originalPrice: 35.99,
                category: 'bodycare',
                stock: 120,
                ratings: 4.8,
                numReviews: 156,
                featured: true,
                bestseller: true,
                newArrival: false,
                images: [{ public_id: 'body-lotion', url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500' }]
            },
            {
                name: 'Signature Perfume - Rose',
                slug: 'signature-perfume-rose',
                description: 'Our signature fragrance featuring notes of damask rose, jasmine, and sandalwood. Long-lasting and elegant.',
                price: 65.99,
                originalPrice: 0,
                category: 'fragrance',
                stock: 50,
                ratings: 4.9,
                numReviews: 234,
                featured: true,
                bestseller: true,
                newArrival: false,
                images: [{ public_id: 'perfume', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500' }]
            },
            {
                name: 'Glow Highlighter Palette',
                slug: 'glow-highlighter-palette',
                description: '4-shade highlighter palette with champagne, rose gold, bronze, and golden shades. Highly pigmented and blendable.',
                price: 36.99,
                originalPrice: 45.99,
                category: 'makeup',
                stock: 85,
                ratings: 4.7,
                numReviews: 189,
                featured: true,
                bestseller: true,
                newArrival: true,
                images: [{ public_id: 'highlighter', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500' }]
            },
            {
                name: 'Silk Pillowcase',
                slug: 'silk-pillowcase',
                description: '100% mulberry silk pillowcase that reduces friction and helps prevent hair breakage and skin creases.',
                price: 45.99,
                originalPrice: 55.99,
                category: 'tools',
                stock: 40,
                ratings: 4.8,
                numReviews: 98,
                featured: false,
                bestseller: true,
                newArrival: false,
                images: [{ public_id: 'pillowcase', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500' }]
            },
            {
                name: 'Retinol Night Serum',
                slug: 'retinol-night-serum',
                description: 'Advanced anti-aging serum with retinol and peptides. Reduces fine lines and wrinkles while you sleep.',
                price: 54.99,
                originalPrice: 64.99,
                category: 'skincare',
                stock: 65,
                ratings: 4.6,
                numReviews: 112,
                featured: true,
                bestseller: false,
                newArrival: false,
                images: [{ public_id: 'retinol', url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500' }]
            },
            {
                name: 'Hydrating Lip Balm Set',
                slug: 'hydrating-lip-balm-set',
                description: 'Set of 4 nourishing lip balms in assorted flavors. Ultra-moisturizing with vitamin E and shea butter.',
                price: 16.99,
                originalPrice: 0,
                category: 'makeup',
                stock: 200,
                ratings: 4.9,
                numReviews: 345,
                featured: false,
                bestseller: true,
                newArrival: true,
                images: [{ public_id: 'lip-balm', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500' }]
            }
        ];

        const createdProducts = await Product.insertMany(products);

        res.json({
            success: true,
            message: 'Products seeded successfully',
            count: createdProducts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
