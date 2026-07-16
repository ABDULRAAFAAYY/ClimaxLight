import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    itemCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    compareAtPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    specifications: {
        wattage: String,
        voltage: String,
        material: String,
        dimensions: String,
        color: String,
        lightColor: String,
        warranty: String,
        brand: String
    },
    features: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    colorOption: {
        type: String,
        enum: ['single', 'three'],
        default: 'single'
    },
    hasVariants: {
        type: Boolean,
        default: false
    },
    variants: [{
        size: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        compareAtPrice: { type: Number, default: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 }
    }]
}, {
    timestamps: true
});

// Index for search optimization
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
