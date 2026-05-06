const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        name: {
            type: String,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'USA'
        },
        phone: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'paypal', 'cod']
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email: String
    },
    itemsPrice: {
        type: Number,
        required: true
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
