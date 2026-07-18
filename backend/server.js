import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';
import orderRoutes from './routes/orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB (fire-and-forget on startup, actual requests will await it)
connectDB().catch(err => console.error('Database connection failed on startup:', err.message));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware (ensures DB is connected before handling requests)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Climax Lights API',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            categories: '/api/categories',
            admin: '/api/admin'
        }
    });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Check if error is database related
    const isDbError = err.message && (
        err.message.includes('Database connection') ||
        err.message.includes('MONGODB_URI') ||
        err.message.includes('connection')
    );
    
    res.status(500).json({
        message: isDbError ? err.message : 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' || isDbError ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Export app for Vercel serverless
export default app;

// Start server only when running directly (not imported by Vercel)
const __currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__currentFile);

if (isMain) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
}
