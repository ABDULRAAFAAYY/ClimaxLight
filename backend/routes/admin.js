import express from 'express';
import fs from 'fs';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import imageUpload from '../middleware/imageUpload.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate slug from product name
const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
};

// Login endpoint (Public)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const expectedUsername = process.env.ADMIN_USERNAME || 'CRST';
        const expectedPassword = process.env.ADMIN_PASSWORD || 'climaxshafay';

        if (username === expectedUsername && password === expectedPassword) {
            // Generate basic auth token (Base64 of username:password)
            const token = Buffer.from(`${username}:${password}`).toString('base64');
            return res.json({ success: true, token });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

// Get site settings (Public - no admin protection needed)
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if not exists
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        console.error('Fetch settings error:', error);
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
});

// Protect all routes below this middleware
router.use(requireAdmin);

// Update site settings (Admin Protected)
router.put('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
            await settings.save();
        } else {
            settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
                new: true,
                runValidators: true
            });
        }
        res.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(400).json({ message: 'Error updating settings', error: error.message });
    }
});

// Upload product image (Admin Protected)
router.post('/upload-image', imageUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ success: true, filePath });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});

// Get all products (including inactive) for admin
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });

        res.json({
            total: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add manual product (Admin Protected)
router.post('/products', async (req, res) => {
    try {
        const {
            itemCode,
            name,
            price,
            category,
            images,
            colorOption,
            description,
            compareAtPrice,
            stock,
            isFeatured,
            isActive,
            specifications,
            features,
            hasVariants,
            variants
        } = req.body;

        // Validation
        if (!itemCode || !category) {
            return res.status(400).json({ message: 'Required fields: Item Code and Category.' });
        }

        // Validate price only if it doesn't have variants
        if (!hasVariants && (price === undefined || price === null || price === '')) {
            return res.status(400).json({ message: 'Price is required when variants are disabled.' });
        }

        // Check if itemCode already exists
        const existingProduct = await Product.findOne({ itemCode: String(itemCode).trim().toUpperCase() });
        if (existingProduct) {
            return res.status(400).json({ message: `Product with item code ${itemCode} already exists.` });
        }

        // Color option image validation
        if (colorOption === 'three') {
            if (!images || images.length < 3 || !images[0] || !images[1] || !images[2]) {
                return res.status(400).json({ message: 'For a 3-color light, exactly 3 images are required.' });
            }
        } else {
            if (!images || images.length < 1 || !images[0]) {
                return res.status(400).json({ message: 'For a single color light, at least 1 image is required.' });
            }
        }

        let finalPrice = parseFloat(price);
        let finalCompareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : 0;
        let finalStock = stock ? parseInt(stock) : 0;
        let finalVariants = [];

        if (hasVariants) {
            if (!variants || !Array.isArray(variants) || variants.length === 0) {
                return res.status(400).json({ message: 'At least one variant/size is required when variants are enabled.' });
            }
            
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                if (!v.size || !v.size.trim() || v.price === undefined || v.price === null || v.price === '') {
                    return res.status(400).json({ message: `Variant at index ${i} is missing size or price.` });
                }
            }

            finalVariants = variants.map(v => ({
                size: v.size.trim(),
                price: parseFloat(v.price) || 0,
                compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : 0,
                stock: v.stock ? parseInt(v.stock) : 0
            }));

            // Auto-fill base price and stock
            finalPrice = finalVariants[0].price;
            finalCompareAtPrice = finalVariants[0].compareAtPrice;
            finalStock = finalVariants.reduce((sum, v) => sum + v.stock, 0);
        }

        const productName = name && name.trim() ? name.trim() : `Product ${String(itemCode).trim().toUpperCase()}`;
        const slug = generateSlug(productName);

        const productData = {
            itemCode: String(itemCode).trim().toUpperCase(),
            name: productName,
            slug,
            description: description || '',
            price: finalPrice,
            compareAtPrice: finalCompareAtPrice,
            category,
            images: images.filter(img => img && img.trim() !== ''),
            stock: finalStock,
            isFeatured: !!isFeatured,
            isActive: isActive !== undefined ? !!isActive : true,
            specifications: specifications || {},
            features: features || [],
            colorOption: colorOption || 'single',
            hasVariants: !!hasVariants,
            variants: finalVariants
        };

        const newProduct = await Product.create(productData);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update manual product (Admin Protected)
router.put('/products/:id', async (req, res) => {
    try {
        const {
            itemCode,
            name,
            price,
            category,
            images,
            colorOption,
            description,
            compareAtPrice,
            stock,
            isFeatured,
            isActive,
            specifications,
            features,
            hasVariants,
            variants
        } = req.body;

        // Validation
        if (!itemCode || !category) {
            return res.status(400).json({ message: 'Required fields: Item Code and Category.' });
        }

        // Validate price only if it doesn't have variants
        if (!hasVariants && (price === undefined || price === null || price === '')) {
            return res.status(400).json({ message: 'Price is required when variants are disabled.' });
        }

        // Check if itemCode already exists on a different product
        const existingProduct = await Product.findOne({
            itemCode: String(itemCode).trim().toUpperCase(),
            _id: { $ne: req.params.id }
        });
        if (existingProduct) {
            return res.status(400).json({ message: `Another product with item code ${itemCode} already exists.` });
        }

        // Color option image validation
        if (colorOption === 'three') {
            if (!images || images.length < 3 || !images[0] || !images[1] || !images[2]) {
                return res.status(400).json({ message: 'For a 3-color light, exactly 3 images are required.' });
            }
        } else {
            if (!images || images.length < 1 || !images[0]) {
                return res.status(400).json({ message: 'For a single color light, at least 1 image is required.' });
            }
        }

        let finalPrice = parseFloat(price);
        let finalCompareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : 0;
        let finalStock = stock ? parseInt(stock) : 0;
        let finalVariants = [];

        if (hasVariants) {
            if (!variants || !Array.isArray(variants) || variants.length === 0) {
                return res.status(400).json({ message: 'At least one variant/size is required when variants are enabled.' });
            }
            
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                if (!v.size || !v.size.trim() || v.price === undefined || v.price === null || v.price === '') {
                    return res.status(400).json({ message: `Variant at index ${i} is missing size or price.` });
                }
            }

            finalVariants = variants.map(v => ({
                size: v.size.trim(),
                price: parseFloat(v.price) || 0,
                compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : 0,
                stock: v.stock ? parseInt(v.stock) : 0
            }));

            // Auto-fill base price and stock
            finalPrice = finalVariants[0].price;
            finalCompareAtPrice = finalVariants[0].compareAtPrice;
            finalStock = finalVariants.reduce((sum, v) => sum + v.stock, 0);
        }

        const productName = name && name.trim() ? name.trim() : `Product ${String(itemCode).trim().toUpperCase()}`;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                itemCode: String(itemCode).trim().toUpperCase(),
                name: productName,
                description: description || '',
                price: finalPrice,
                compareAtPrice: finalCompareAtPrice,
                category,
                images: images.filter(img => img && img.trim() !== ''),
                stock: finalStock,
                isFeatured: !!isFeatured,
                isActive: isActive !== undefined ? !!isActive : true,
                specifications: specifications || {},
                features: features || [],
                colorOption: colorOption || 'single',
                hasVariants: !!hasVariants,
                variants: finalVariants
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete product (Admin Protected)
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk delete products (Admin Protected)
router.delete('/products/bulk', async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ message: 'Invalid product IDs' });
        }

        const result = await Product.deleteMany({ _id: { $in: productIds } });

        res.json({
            message: 'Products deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get dashboard stats (Admin Protected)
router.get('/dashboard-stats', async (req, res) => {
    try {
        const orders = await Order.find();
        const productsList = await Product.find();
        const categories = await Category.find();

        // Calculations
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const completedRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, order) => sum + order.totalAmount, 0);
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'Pending').length;
        const completedOrders = orders.filter(o => o.status === 'Completed').length;

        const totalProducts = productsList.length;
        const outOfStockProducts = productsList.filter(p => p.stock === 0).length;

        // Category breakdown
        const categoryBreakdown = categories.map(cat => {
            const count = productsList.filter(p => p.category && p.category.toString() === cat._id.toString()).length;
            const revenue = orders.reduce((sum, order) => {
                const catItems = order.items.filter(item => {
                    return item.product && productsList.find(p => p._id.toString() === item.product.toString() && p.category && p.category.toString() === cat._id.toString());
                });
                const catSum = catItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                return sum + catSum;
            }, 0);
            return {
                name: cat.name,
                slug: cat.slug,
                productCount: count,
                revenue
            };
        });

        // Best sellers list
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const id = item.product ? item.product.toString() : 'unknown';
                if (!productSales[id]) {
                    const matchedProduct = productsList.find(p => p._id.toString() === id);
                    productSales[id] = {
                        itemCode: item.itemCode,
                        name: matchedProduct ? matchedProduct.name : 'Unknown Product',
                        image: matchedProduct && matchedProduct.images && matchedProduct.images.length > 0 ? matchedProduct.images[0] : '',
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[id].quantity += item.quantity;
                productSales[id].revenue += item.price * item.quantity;
            });
        });

        const bestSellers = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Recent orders list
        const recentOrders = orders
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5)
            .map(o => ({
                id: o._id,
                orderNumber: o.orderNumber,
                customerName: o.customer.name,
                totalAmount: o.totalAmount,
                status: o.status,
                paymentMethod: o.paymentMethod || 'COD',
                paymentStatus: o.paymentStatus || 'Pending',
                createdAt: o.createdAt
            }));

        res.json({
            summary: {
                totalRevenue,
                completedRevenue,
                totalOrders,
                pendingOrders,
                completedOrders,
                totalProducts,
                outOfStockProducts
            },
            categoryBreakdown,
            bestSellers,
            recentOrders
        });
    } catch (error) {
        console.error('Error calculating dashboard stats:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
