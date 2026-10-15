import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const updatePricing = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected.');

        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products to evaluate.`);

        if (products.length === 0) {
            console.log('ℹ️ No products found in database.');
            process.exit(0);
        }

        let updatedCount = 0;

        for (const product of products) {
            // Determine base comparable price
            let comparablePrice = product.compareAtPrice && product.compareAtPrice > 0
                ? product.compareAtPrice
                : product.price;

            let newPrice = Math.round(comparablePrice * 0.75);

            // Handle variants if any
            if (product.hasVariants && product.variants && product.variants.length > 0) {
                product.variants = product.variants.map(v => {
                    const vComparable = v.compareAtPrice && v.compareAtPrice > 0
                        ? v.compareAtPrice
                        : v.price;
                    const vNewPrice = Math.round(vComparable * 0.75);
                    return {
                        ...v.toObject(),
                        compareAtPrice: vComparable,
                        price: vNewPrice
                    };
                });

                comparablePrice = product.variants[0].compareAtPrice;
                newPrice = product.variants[0].price;
            }

            product.compareAtPrice = comparablePrice;
            product.price = newPrice;

            await product.save();
            updatedCount++;

            console.log(`✓ [${product.itemCode}] Comparable: Rs. ${comparablePrice.toLocaleString()} -> Website Price (25% off): Rs. ${newPrice.toLocaleString()}`);
        }

        console.log(`\n🎉 Successfully updated pricing for ${updatedCount} products!`);
        console.log('All products now have selling price set to 25% off their comparable price.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating product pricing:', error);
        process.exit(1);
    }
};

updatePricing();
