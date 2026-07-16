import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import imageUpload from '../middleware/imageUpload.js';

const router = express.Router();

// Place order (Public)
router.post('/', imageUpload.single('receiptImage'), async (req, res) => {
    try {
        let { customer, items, totalAmount, paymentMethod, paymentStatus, transactionId } = req.body;

        // Parse JSON strings from multipart form data if needed
        if (typeof customer === 'string') {
            try {
                customer = JSON.parse(customer);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid customer data format.' });
            }
        }
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid items data format.' });
            }
        }

        // Validation
        if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
            return res.status(400).json({ message: 'Customer details (name, phone, address, city) are required.' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required to place an order.' });
        }

        // Validate items and decrement stock levels
        const updatedProducts = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found.` });
            }

            if (product.hasVariants && item.selectedSize) {
                // Find matching variant size
                const variant = product.variants.find(v => v.size === item.selectedSize);
                if (!variant) {
                    return res.status(400).json({ 
                        message: `Size "${item.selectedSize}" for product "${product.itemCode}" is not available.` 
                    });
                }

                if (variant.stock < item.quantity) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for product "${product.itemCode}" (Size: ${item.selectedSize}). Available: ${variant.stock}, Ordered: ${item.quantity}.` 
                    });
                }

                // Decrement stock
                variant.stock -= item.quantity;
                
                // Recalculate base product stock
                product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                
                // Keep base price synced to first variant
                if (product.variants.length > 0) {
                    product.price = product.variants[0].price;
                    product.compareAtPrice = product.variants[0].compareAtPrice || 0;
                }
            } else {
                // Standard product stock decrement
                if (product.stock < item.quantity) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for product "${product.itemCode}". Available: ${product.stock}, Ordered: ${item.quantity}.` 
                    });
                }
                product.stock -= item.quantity;
            }

            updatedProducts.push(product);
        }

        // Save updated product stock levels
        for (const product of updatedProducts) {
            await product.save();
        }

        // Create the order
        const newOrder = await Order.create({
            customer,
            items: items.map(item => ({
                product: item.product,
                itemCode: item.itemCode,
                selectedSize: item.selectedSize || null,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity)
            })),
            totalAmount: parseFloat(totalAmount),
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentStatus || 'Pending',
            transactionId: transactionId || null,
            receiptImage: req.file ? `/uploads/${req.file.filename}` : null
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create Stripe Payment Intent (Public)
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount.' });
        }

        // Check if Secret Key is configured in .env
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.json({
                clientSecret: `mock_secret_${Math.random().toString(36).substring(2, 11)}`,
                isMock: true
            });
        }

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'pkr',
            metadata: { integration: 'climax-lights-mern' }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            isMock: false
        });
    } catch (error) {
        console.error('Stripe PaymentIntent error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Admin routes protection middleware
router.use(requireAdmin);

// Get all orders (Admin Protected)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product', 'images name slug')
            .sort({ createdAt: -1 });
        
        res.json({
            total: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (Admin Protected)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['Pending', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Choose Pending or Completed.' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete order (Admin Protected)
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ message: 'Order deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
