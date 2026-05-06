const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();

        res.status(201).json({
            success: true,
            order: createdOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if the order belongs to the user or user is admin
        if (order.user._id.toString() !== req.user.id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            orders,
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

        res.json({
            success: true,
            orders,
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email: req.body.email
        };

        const updatedOrder = await order.save();

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.orderStatus = 'delivered';

        const updatedOrder = await order.save();

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled (not shipped or delivered)
        if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order that has been shipped or delivered'
            });
        }

        order.orderStatus = 'cancelled';
        const updatedOrder = await order.save();

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order stats
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
    try {
        const orders = await Order.find();
        
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        const paidOrders = orders.filter(order => order.isPaid).length;
        const deliveredOrders = orders.filter(order => order.isDelivered).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
        const todayRevenue = todayOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue,
                paidOrders,
                deliveredOrders,
                todayOrders: todayOrders.length,
                todayRevenue
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
