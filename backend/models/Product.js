const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [100, 'Product name cannot be more than 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Please provide a product category'],
        enum: ['skincare', 'makeup', 'haircare', 'bodycare', 'fragrance', 'tools']
    },
    subcategory: {
        type: String,
        default: ''
    },
    images: [{
        public_id: String,
        url: String
    }],
    brand: {
        type: String,
        default: 'GLOW Cosmetics'
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    ratings: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    featured: {
        type: Boolean,
        default: false
    },
    bestseller: {
        type: Boolean,
        default: false
    },
    newArrival: {
        type: Boolean,
        default: false
    },
    ingredients: {
        type: String,
        default: ''
    },
    howToUse: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
