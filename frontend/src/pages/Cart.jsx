import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Cart.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { showToast } = useToast();
    
    // Checkout states
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Online'
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: 'Karachi'
    });

    const getFullImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
        }
        const path = img.startsWith('/uploads/') || img.startsWith('uploads/')
            ? (img.startsWith('/') ? img : `/${img}`)
            : `/uploads/${img}`;
        return `${API_URL}${path}`;
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        if (paymentMethod === 'Online' && !receiptFile) {
            setErrorMessage('Please upload a screenshot of your bank transfer receipt.');
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('customer', JSON.stringify(form));
        formData.append('items', JSON.stringify(cartItems.map(item => ({
            product: item._id,
            itemCode: item.itemCode,
            selectedSize: item.selectedVariant?.size || null,
            price: item.price,
            quantity: item.quantity
        }))));
        formData.append('totalAmount', getCartTotal());
        formData.append('paymentMethod', paymentMethod);
        formData.append('paymentStatus', paymentMethod === 'Online' ? 'Paid' : 'Pending');
        formData.append('transactionId', paymentMethod === 'Online' ? 'bank_' + Date.now() : null);

        if (paymentMethod === 'Online' && receiptFile) {
            formData.append('receiptImage', receiptFile);
        }

        try {
            const response = await axios.post(`${API_URL}/api/orders`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setCreatedOrder(response.data);
            setOrderPlaced(true);
            clearCart();
            showToast('Order placed successfully!', 'success');
        } catch (error) {
            console.error('Error placing order:', error);
            setErrorMessage(error.response?.data?.message || 'Error placing order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Add some amazing lighting products to your cart!</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <button onClick={clearCart} className="btn btn-outline btn-sm">
                        Clear Cart
                    </button>
                </div>

                <div className="cart-layout">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={`${item._id}-${item.selectedVariant?.size || 'default'}`} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={item.images && item.images.length > 0 ? getFullImageUrl(item.images[0]) : ''} alt={item.itemCode} />
                                </div>

                                <div className="cart-item-details">
                                    <Link to={`/product/${item.slug}`} className="cart-item-name">
                                        {item.itemCode} {item.selectedVariant && <span className="cart-item-size" style={{ fontSize: '0.875rem', color: 'var(--primary)', marginLeft: '0.5rem' }}>({item.selectedVariant.size})</span>}
                                    </Link>
                                    <p className="cart-item-price">
                                        Rs. {item.price.toLocaleString()}
                                    </p>
                                </div>

                                <div className="cart-item-quantity">
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedVariant?.size)}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <span className="quantity-value">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedVariant?.size)}
                                        className="quantity-btn"
                                        disabled={item.quantity >= (item.selectedVariant ? item.selectedVariant.stock : item.stock)}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="cart-item-total">
                                    <p className="item-total">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item._id, item.selectedVariant?.size)}
                                        className="remove-btn"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>Rs. {getCartTotal().toLocaleString()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span style={{ fontWeight: '600', color: form.city.toLowerCase() === 'karachi' ? '#2e7d32' : 'var(--primary)' }}>
                                {form.city.toLowerCase() === 'karachi' ? 'Free Delivery' : 'Delivery charges will be applied'}
                            </span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total:</span>
                            <span>Rs. {getCartTotal().toLocaleString()}</span>
                        </div>

                        <button onClick={() => setIsCheckoutOpen(true)} className="btn btn-primary btn-lg checkout-btn">
                            Proceed to Checkout
                        </button>

                        <Link to="/products" className="continue-shopping">
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Checkout Modal Overlay */}
            {isCheckoutOpen && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal-content">
                        <button className="close-modal-btn" onClick={() => {
                            setIsCheckoutOpen(false);
                            if (orderPlaced) {
                                setOrderPlaced(false);
                                setCreatedOrder(null);
                            }
                        }}>✕</button>
                        
                        {!orderPlaced ? (
                            <>
                                <h2>Complete Your Order</h2>
                                <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g. Mohammad Ali"
                                        />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone Number *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.phone}
                                                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="e.g. 03001234567"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>City *</label>
                                            <select
                                                value={form.city}
                                                onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                                            >
                                                <option value="Karachi">Karachi</option>
                                                <option value="Lahore">Lahore</option>
                                                <option value="Islamabad">Islamabad</option>
                                                <option value="Rawalpindi">Rawalpindi</option>
                                                <option value="Faisalabad">Faisalabad</option>
                                                <option value="Multan">Multan</option>
                                                <option value="Peshawar">Peshawar</option>
                                                <option value="Quetta">Quetta</option>
                                                <option value="Sialkot">Sialkot</option>
                                                <option value="Gujranwala">Gujranwala</option>
                                                <option value="Other">Other City</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Shipping Address *</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={form.address}
                                            onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="House No, Street, Area Name..."
                                        ></textarea>
                                    </div>

                                    {/* Payment Method Selector */}
                                    <div className="payment-method-selector" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                        <label style={{ fontWeight: '700', marginBottom: '0.75rem', display: 'block', color: 'var(--secondary)' }}>Select Payment Method</label>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div 
                                                className={`payment-method-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                                                onClick={() => setPaymentMethod('COD')}
                                                style={{
                                                    flex: '1 0 140px',
                                                    padding: '1rem',
                                                    borderRadius: '10px',
                                                    border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1.5px solid #eee',
                                                    background: paymentMethod === 'COD' ? 'rgba(255, 87, 34, 0.04)' : '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: paymentMethod === 'COD' ? 'var(--shadow-sm)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>💵</span>
                                                <strong style={{ fontSize: '0.9rem' }}>Cash on Delivery</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Pay when delivered</span>
                                            </div>

                                            <div 
                                                className={`payment-method-card ${paymentMethod === 'Online' ? 'active' : ''}`}
                                                onClick={() => setPaymentMethod('Online')}
                                                style={{
                                                    flex: '1 0 140px',
                                                    padding: '1rem',
                                                    borderRadius: '10px',
                                                    border: paymentMethod === 'Online' ? '2px solid var(--primary)' : '1.5px solid #eee',
                                                    background: paymentMethod === 'Online' ? 'rgba(255, 87, 34, 0.04)' : '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: paymentMethod === 'Online' ? 'var(--shadow-sm)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>🏦</span>
                                                <strong style={{ fontSize: '0.9rem' }}>Pay Online</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Bank Account Transfer</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Transfer Details & Screenshot Uploader */}
                                    {paymentMethod === 'Online' && (
                                        <div className="bank-transfer-form-wrapper" style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #eee', marginBottom: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--secondary)' }}>🏦 Meezan Bank Account</h4>
                                            
                                            <div className="bank-details-box" style={{ background: '#fff', border: '1px solid #eee', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                                <div style={{ marginBottom: '4px' }}><strong>Bank:</strong> Meezan Bank</div>
                                                <div style={{ marginBottom: '4px' }}><strong>Account Title:</strong> Abdul Rafay</div>
                                                <div style={{ marginBottom: '4px' }}><strong>Mobile Account Number:</strong> 03360994280</div>
                                                <div><strong>Bank Account Number:</strong> 03112957340</div>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                                    Please provide the screenshot here *
                                                </label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        required={paymentMethod === 'Online'}
                                                        onChange={handleReceiptChange}
                                                        style={{ 
                                                            padding: '0.5rem', 
                                                            fontSize: '0.85rem',
                                                            border: '1px dashed #ccc',
                                                            borderRadius: '6px',
                                                            background: '#fff',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    {receiptPreview && (
                                                        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                                                            <img 
                                                                src={receiptPreview} 
                                                                alt="Receipt Preview" 
                                                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #eee' }} 
                                                            />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    setReceiptFile(null);
                                                                    setReceiptPreview(null);
                                                                }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '5px',
                                                                    right: '5px',
                                                                    background: 'rgba(0,0,0,0.6)',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '50%',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.8rem'
                                                                }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="order-items-preview">
                                        {cartItems.map(item => (
                                            <div key={`${item._id}-${item.selectedVariant?.size || 'default'}`} className="order-item-preview-row">
                                                <span>{item.itemCode} {item.selectedVariant ? `(${item.selectedVariant.size})` : ''} x {item.quantity}</span>
                                                <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="order-item-preview-row" style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                            <span>Shipping ({form.city}):</span>
                                            <span style={{ fontWeight: '600', color: form.city.toLowerCase() === 'karachi' ? '#2e7d32' : 'var(--primary)' }}>
                                                {form.city.toLowerCase() === 'karachi' ? 'Free Delivery' : 'Delivery charges will be applied'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="summary-row" style={{ fontWeight: '700', fontSize: '1.1rem', margin: '0.5rem 0' }}>
                                        <span>Total Amount:</span>
                                        <span style={{ color: 'var(--primary)' }}>Rs. {getCartTotal().toLocaleString()}</span>
                                    </div>
                                    
                                    {errorMessage && (
                                        <div className="error-message">
                                            ⚠️ {errorMessage}
                                        </div>
                                    )}
                                    
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg" 
                                        disabled={isSubmitting}
                                        style={{ marginTop: '0.5rem', width: '100%' }}
                                    >
                                        {isSubmitting ? 'Placing Order...' : (paymentMethod === 'Online' ? `Place Order & Send Screenshot` : 'Confirm Cash on Delivery Order')}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="success-view" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                                <div className="success-icon" style={{ 
                                    backgroundColor: 'rgba(255, 87, 34, 0.1)', 
                                    color: 'var(--primary)', 
                                    border: '2px solid var(--primary)',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                    margin: '0 auto 1.5rem'
                                }}>✓</div>
                                <h2 style={{ 
                                    color: 'var(--secondary)', 
                                    fontSize: '1.8rem', 
                                    fontWeight: '800', 
                                    marginBottom: '0.75rem',
                                    lineHeight: '1.3'
                                }}>
                                    Thank you for shopping with Climax Lights!
                                </h2>
                                <p style={{ 
                                    fontSize: '1.05rem', 
                                    color: 'var(--secondary)', 
                                    fontWeight: '600', 
                                    marginBottom: '2rem', 
                                    lineHeight: '1.6', 
                                    backgroundColor: 'rgba(255, 87, 34, 0.05)', 
                                    padding: '1rem', 
                                    borderRadius: '10px', 
                                    borderLeft: '4px solid var(--primary)' 
                                }}>
                                    You will receive a message shortly.
                                </p>
                                
                                <div className="order-summary-box">
                                    <h4>Order Summary</h4>
                                    <div className="order-summary-row">
                                        <span><strong>Order Number:</strong></span>
                                        <span><strong>{createdOrder?.orderNumber}</strong></span>
                                    </div>
                                    <div className="order-summary-row">
                                        <span>Customer Name:</span>
                                        <span>{createdOrder?.customer?.name}</span>
                                    </div>
                                    <div className="order-summary-row">
                                        <span>Contact Number:</span>
                                        <span>{createdOrder?.customer?.phone}</span>
                                    </div>
                                    <div className="order-summary-row">
                                        <span>Shipping Address:</span>
                                        <span style={{ maxWidth: '250px', textAlign: 'right', wordBreak: 'break-word' }}>
                                            {createdOrder?.customer?.address}, {createdOrder?.customer?.city}
                                        </span>
                                    </div>
                                    <div className="order-summary-row">
                                        <span>Payment Method:</span>
                                        <span>{createdOrder?.paymentMethod === 'Online' ? 'Direct Bank Transfer (Paid)' : 
                                              createdOrder?.paymentMethod === 'Card' ? 'Credit/Debit Card (Paid)' : 
                                              'Cash on Delivery'}</span>
                                    </div>
                                    {createdOrder?.transactionId && (
                                        <div className="order-summary-row">
                                            <span>Transaction ID:</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{createdOrder.transactionId}</span>
                                        </div>
                                    )}
                                    <div className="order-summary-row" style={{ borderTop: '1px dashed #ccc', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: '700' }}>
                                        <span>Total Paid:</span>
                                        <span style={{ color: 'var(--primary)' }}>Rs. {createdOrder?.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className="btn btn-primary btn-lg" 
                                    onClick={() => {
                                        setIsCheckoutOpen(false);
                                        setOrderPlaced(false);
                                        setCreatedOrder(null);
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
