import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
    {
        name: 'Chandeliers',
        slug: 'chandeliers',
        description: 'Elegant and luxurious chandeliers to add grandeur to your space',
        icon: '💎'
    },
    {
        name: 'Wall Lights',
        slug: 'wall-lights',
        description: 'Stylish wall-mounted lighting solutions for ambient illumination',
        icon: '🔆'
    },
    {
        name: 'Pendant Lights',
        slug: 'pendant-lights',
        description: 'Modern hanging lights perfect for dining areas and kitchens',
        icon: '💡'
    },
    {
        name: 'Bulbs',
        slug: 'bulbs',
        description: 'Energy-efficient LED and traditional bulbs for all fixtures',
        icon: '🌟'
    },
    {
        name: 'Commercial Lights',
        slug: 'commercial-lights',
        description: 'High-performance commercial and track lighting for businesses and showrooms',
        icon: '🏢'
    },
    {
        name: 'Outdoor Lights',
        slug: 'outdoor-lights',
        description: 'Weather-resistant outdoor lighting for gardens and pathways',
        icon: '🌙'
    }
];

const sampleProducts = [
    // Chandeliers
    {
        name: 'Crystal Palace Chandelier',
        slug: 'crystal-palace-chandelier',
        description: 'Magnificent 12-light crystal chandelier with premium K9 crystals. Features a stunning cascade design that creates mesmerizing light patterns. Perfect for grand entrances, dining rooms, and luxury living spaces.',
        price: 45000,
        compareAtPrice: 55000,
        categorySlug: 'chandeliers',
        images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800'],
        stock: 15,
        specifications: {
            wattage: '12 x 40W',
            voltage: '220V',
            material: 'Stainless Steel & K9 Crystal',
            dimensions: '80cm x 100cm',
            color: 'Gold/Chrome',
            lightColor: 'Warm White',
            warranty: '2 Years',
            brand: 'Climax Lights'
        },
        features: ['K9 Crystal', 'Adjustable Height', 'Dimmable', 'Energy Efficient'],
        rating: 4.8,
        numReviews: 24,
        isFeatured: true
    },
    {
        name: 'Modern Geometric Chandelier',
        slug: 'modern-geometric-chandelier',
        description: 'Contemporary geometric design chandelier with sleek lines and modern aesthetics. Features integrated LED technology for energy efficiency and long-lasting performance.',
        price: 32000,
        compareAtPrice: 38000,
        categorySlug: 'chandeliers',
        images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'],
        stock: 20,
        specifications: {
            wattage: '60W LED',
            voltage: '220V',
            material: 'Aluminum Alloy',
            dimensions: '60cm x 80cm',
            color: 'Matte Black',
            lightColor: 'Cool White',
            warranty: '3 Years',
            brand: 'Climax Lights'
        },
        features: ['LED Integrated', 'Modern Design', 'Energy Saving', 'Easy Installation'],
        rating: 4.6,
        numReviews: 18,
        isFeatured: true
    },

    // Wall Lights
    {
        name: 'Contemporary LED Wall Sconce',
        slug: 'contemporary-led-wall-sconce',
        description: 'Sleek and modern wall sconce with integrated LED technology. Perfect for hallways, bedrooms, and living areas. Features adjustable brightness and elegant minimalist design.',
        price: 5500,
        compareAtPrice: 7000,
        categorySlug: 'wall-lights',
        images: ['https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800'],
        stock: 50,
        specifications: {
            wattage: '12W LED',
            voltage: '220V',
            material: 'Aluminum',
            dimensions: '30cm x 15cm',
            color: 'White/Black',
            lightColor: 'Warm White',
            warranty: '2 Years',
            brand: 'Climax Lights'
        },
        features: ['Dimmable', 'Energy Efficient', 'Modern Design', 'Easy Mount'],
        rating: 4.7,
        numReviews: 35,
        isFeatured: true
    },
    {
        name: 'Vintage Industrial Wall Light',
        slug: 'vintage-industrial-wall-light',
        description: 'Rustic industrial-style wall light with Edison bulb compatibility. Adds character and warmth to any space with its vintage aesthetic.',
        price: 4200,
        categorySlug: 'wall-lights',
        images: ['https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800'],
        stock: 40,
        specifications: {
            wattage: '40W',
            voltage: '220V',
            material: 'Iron & Glass',
            dimensions: '25cm x 20cm',
            color: 'Bronze',
            lightColor: 'Warm Amber',
            warranty: '1 Year',
            brand: 'Climax Lights'
        },
        features: ['Vintage Style', 'Edison Bulb Compatible', 'Durable', 'Adjustable Arm'],
        rating: 4.5,
        numReviews: 28
    },

    // Pendant Lights
    {
        name: 'Minimalist Dome Pendant',
        slug: 'minimalist-dome-pendant',
        description: 'Clean and simple dome-shaped pendant light perfect for modern kitchens and dining areas. Features a smooth finish and adjustable hanging length.',
        price: 6800,
        compareAtPrice: 8500,
        categorySlug: 'pendant-lights',
        images: ['https://images.unsplash.com/photo-1534105615991-4c576f8f0b4d?w=800'],
        stock: 35,
        specifications: {
            wattage: '15W LED',
            voltage: '220V',
            material: 'Metal',
            dimensions: '35cm diameter',
            color: 'White/Grey/Black',
            lightColor: 'Neutral White',
            warranty: '2 Years',
            brand: 'Climax Lights'
        },
        features: ['Adjustable Height', 'Multiple Colors', 'LED Compatible', 'Easy Install'],
        rating: 4.6,
        numReviews: 42,
        isFeatured: true
    },
    {
        name: 'Glass Globe Pendant Set',
        slug: 'glass-globe-pendant-set',
        description: 'Set of 3 elegant glass globe pendants ideal for kitchen islands and dining tables. Creates a stunning focal point with beautiful light diffusion.',
        price: 15000,
        compareAtPrice: 18000,
        categorySlug: 'pendant-lights',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        stock: 25,
        specifications: {
            wattage: '3 x 10W LED',
            voltage: '220V',
            material: 'Glass & Brass',
            dimensions: '20cm diameter each',
            color: 'Clear Glass',
            lightColor: 'Warm White',
            warranty: '2 Years',
            brand: 'Climax Lights'
        },
        features: ['Set of 3', 'Premium Glass', 'Brass Fittings', 'Adjustable Cables'],
        rating: 4.9,
        numReviews: 31
    },

    // Bulbs
    {
        name: 'LED Smart Bulb 12W',
        slug: 'led-smart-bulb-12w',
        description: 'Energy-efficient LED smart bulb with WiFi connectivity. Control brightness and color temperature from your smartphone. Compatible with Alexa and Google Home.',
        price: 1200,
        compareAtPrice: 1500,
        categorySlug: 'bulbs',
        images: ['https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800'],
        stock: 200,
        specifications: {
            wattage: '12W (100W equivalent)',
            voltage: '220V',
            material: 'Plastic & Aluminum',
            dimensions: 'Standard A60',
            color: 'White',
            lightColor: 'RGB + Warm to Cool White',
            warranty: '1 Year',
            brand: 'Climax Lights'
        },
        features: ['Smart WiFi', 'Voice Control', 'Color Changing', 'Energy Saving'],
        rating: 4.7,
        numReviews: 156,
        isFeatured: true
    },
    {
        name: 'LED Filament Bulb 8W',
        slug: 'led-filament-bulb-8w',
        description: 'Vintage-style LED filament bulb combining classic aesthetics with modern efficiency. Perfect for decorative fixtures and exposed bulb designs.',
        price: 800,
        categorySlug: 'bulbs',
        images: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=800'],
        stock: 300,
        specifications: {
            wattage: '8W (60W equivalent)',
            voltage: '220V',
            material: 'Glass',
            dimensions: 'Standard A60',
            color: 'Clear Glass',
            lightColor: 'Warm White 2700K',
            warranty: '1 Year',
            brand: 'Climax Lights'
        },
        features: ['Vintage Look', 'Energy Efficient', 'Long Lifespan', 'Dimmable'],
        rating: 4.8,
        numReviews: 89
    },

    // Track Lights
    {
        name: 'Adjustable Track Lighting System',
        slug: 'adjustable-track-lighting-system',
        description: 'Professional 4-light track system with fully adjustable heads. Ideal for galleries, retail spaces, and modern homes. Easy to install and configure.',
        price: 18000,
        compareAtPrice: 22000,
        categorySlug: 'commercial-lights',
        images: ['https://images.unsplash.com/photo-1565183928294-7d22f2d8c29b?w=800'],
        stock: 30,
        specifications: {
            wattage: '4 x 15W LED',
            voltage: '220V',
            material: 'Aluminum',
            dimensions: '120cm track length',
            color: 'Black/White',
            lightColor: 'Cool White',
            warranty: '3 Years',
            brand: 'Climax Lights'
        },
        features: ['360° Rotation', 'Adjustable Heads', 'LED Integrated', 'Easy Installation'],
        rating: 4.6,
        numReviews: 22,
        isFeatured: true
    },

    // Commercial Lights
    {
        name: 'COB LED Downlight 30W',
        slug: 'cob-led-downlight-30w',
        description: 'High-power COB LED downlight for commercial applications. Provides bright, uniform illumination with excellent color rendering. Perfect for offices, showrooms, and retail spaces.',
        price: 3500,
        compareAtPrice: 4200,
        categorySlug: 'commercial-lights',
        images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800'],
        stock: 100,
        specifications: {
            wattage: '30W',
            voltage: '220V',
            material: 'Aluminum Alloy',
            dimensions: '15cm diameter',
            color: 'White',
            lightColor: 'Cool White 6000K',
            warranty: '3 Years',
            brand: 'Climax Lights'
        },
        features: ['High CRI >90', 'Long Lifespan', 'Heat Dissipation', 'Commercial Grade'],
        rating: 4.7,
        numReviews: 45,
        isFeatured: true
    },
    {
        name: 'SMD LED Panel Light 40W',
        slug: 'smd-led-panel-light-40w',
        description: 'Ultra-slim SMD LED panel providing uniform, glare-free illumination. Ideal for offices, hospitals, and commercial buildings. Energy-efficient and long-lasting.',
        price: 4500,
        categorySlug: 'commercial-lights',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        stock: 80,
        specifications: {
            wattage: '40W',
            voltage: '220V',
            material: 'Aluminum Frame',
            dimensions: '60cm x 60cm',
            color: 'White',
            lightColor: 'Cool White 6000K',
            warranty: '3 Years',
            brand: 'Climax Lights'
        },
        features: ['Ultra Slim', 'Uniform Light', 'Energy Saving', 'Easy Ceiling Mount'],
        rating: 4.8,
        numReviews: 38
    },

    // Outdoor Lights
    {
        name: 'Solar Garden Light Set',
        slug: 'solar-garden-light-set',
        description: 'Set of 6 solar-powered garden lights with automatic dusk-to-dawn operation. Weather-resistant design perfect for pathways, gardens, and outdoor spaces.',
        price: 8500,
        compareAtPrice: 10000,
        categorySlug: 'outdoor-lights',
        images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'],
        stock: 60,
        specifications: {
            wattage: 'Solar Powered',
            voltage: 'N/A',
            material: 'Stainless Steel & Plastic',
            dimensions: '45cm height',
            color: 'Black',
            lightColor: 'Warm White',
            warranty: '1 Year',
            brand: 'Climax Lights'
        },
        features: ['Solar Powered', 'Auto On/Off', 'Weather Resistant', 'Set of 6'],
        rating: 4.5,
        numReviews: 67,
        isFeatured: true
    },
    {
        name: 'LED Flood Light 50W',
        slug: 'led-flood-light-50w',
        description: 'Powerful outdoor LED flood light with wide beam angle. IP65 waterproof rating makes it perfect for security lighting, building facades, and outdoor events.',
        price: 5500,
        categorySlug: 'outdoor-lights',
        images: ['https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800'],
        stock: 75,
        specifications: {
            wattage: '50W',
            voltage: '220V',
            material: 'Die-cast Aluminum',
            dimensions: '25cm x 20cm',
            color: 'Black',
            lightColor: 'Cool White 6000K',
            warranty: '2 Years',
            brand: 'Climax Lights'
        },
        features: ['IP65 Waterproof', 'Wide Beam', 'High Brightness', 'Durable'],
        rating: 4.7,
        numReviews: 52
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await Category.deleteMany({});

        console.log('📦 Creating categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Created ${createdCategories.length} categories`);

        // Map categories to a helper map by slug
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.slug] = cat._id;
        });

        // Prefix map for itemCode generation
        const slugToPrefix = {
            'chandeliers': 'CH',
            'wall-lights': 'WL',
            'pendant-lights': 'PL',
            'bulbs': 'BL',
            'commercial-lights': 'CL',
            'outdoor-lights': 'OL'
        };

        const prefixCounters = {};

        // Prepare products with required category ObjectId and itemCode
        const productsToInsert = sampleProducts.map(p => {
            const categoryId = categoryMap[p.categorySlug];
            if (!categoryId) {
                throw new Error(`Category not found for slug: ${p.categorySlug}`);
            }

            const prefix = slugToPrefix[p.categorySlug] || 'PR';
            if (!prefixCounters[prefix]) {
                prefixCounters[prefix] = 1;
            }
            const sequenceNum = String(prefixCounters[prefix]++).padStart(3, '0');
            const itemCode = `${prefix}-${sequenceNum}`;

            // Create new object without categorySlug and with category/itemCode
            const { categorySlug, ...productData } = p;
            return {
                ...productData,
                itemCode,
                category: categoryId
            };
        });

        console.log('📦 Creating products...');
        const createdProducts = await Product.insertMany(productsToInsert);
        console.log(`✅ Created ${createdProducts.length} products`);

        console.log('🎉 Database seeded successfully with categories and products!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();

