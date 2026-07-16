import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    customer: {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        itemCode: { type: String, required: true },
        selectedSize: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Card', 'Online'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    transactionId: {
        type: String,
        default: null
    },
    receiptImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const count = await mongoose.model('Order').countDocuments();
            this.orderNumber = `CL-${1001 + count}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
