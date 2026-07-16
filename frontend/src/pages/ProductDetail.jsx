import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ProductDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { addToCart } = useCart();
    const { showToast } = useToast();

    useEffect(() => {
        fetchProduct();
        setActiveImageIndex(0);
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`/api/products/${slug}`);
            setProduct(response.data);
            if (response.data && response.data.hasVariants && response.data.variants && response.data.variants.length > 0) {
                setSelectedVariant(response.data.variants[0]);
            } else {
                setSelectedVariant(null);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariant);
        showToast('Product added to cart!', 'success');
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="skeleton" style={{ height: '600px' }}></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container text-center">
                    <h2>Product not found</h2>
                    <Link to="/products" className="btn btn-primary">Back to Products</Link>
                </div>
            </div>
        );
    }

    const discount = product.compareAtPrice > 0
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    const getPlaceholder = (name) => {
        const text = name || 'Product';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="%23667eea"/><text x="300" y="300" font-family="Arial,sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">${text.length > 25 ? text.substring(0, 25) + '...' : text}</text></svg>`;
        return `data:image/svg+xml,${svg}`;
    };

    const getFullImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
        }
        return `${API_URL}${img}`;
    };

    const imageUrl = product.images && product.images.length > 0 && product.images[activeImageIndex]
        ? getFullImageUrl(product.images[activeImageIndex])
        : getPlaceholder(product.itemCode);

    const displayPrice = selectedVariant ? selectedVariant.price : product.price;
    const displayCompareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
    const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/products">Products</Link>
                    <span>/</span>
                    <span>{product.itemCode}</span>
                </div>

                <div className="product-detail-grid">
                    <div className="product-images">
                        <div className="main-image">
                            <img
                                src={imageUrl}
                                alt={product.itemCode}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getPlaceholder(product.itemCode);
                                }}
                            />
                            {discount > 0 && (
                                <span className="discount-badge">-{discount}%</span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="thumbnail-list">
                                {product.images.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                                        onClick={() => setActiveImageIndex(idx)}
                                    >
                                        <img
                                            src={getFullImageUrl(img)}
                                            alt={`${product.itemCode} thumbnail ${idx + 1}`}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getPlaceholder(product.itemCode);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-details">
                        <h1>{product.itemCode}</h1>

                        <div className="product-rating">
                            <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
                            <span className="rating-text">
                                {product.rating} ({product.numReviews} reviews)
                            </span>
                        </div>

                        <div className="product-pricing">
                            <span className="current-price">Rs. {displayPrice.toLocaleString()}</span>
                            {displayCompareAtPrice > 0 && (
                                <span className="original-price">
                                    Rs. {displayCompareAtPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Variants Section */}
                        {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <div className="variants-section">
                                <label className="variant-label">Select Size:</label>
                                <div className="variants-grid">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v._id || v.size}
                                            className={`variant-pill ${selectedVariant && selectedVariant.size === v.size ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                setQuantity(1);
                                            }}
                                            style={{ minWidth: '150px' }}
                                        >
                                            <span className="variant-size-name" style={{ fontWeight: '700', fontSize: '1rem', display: 'block' }}>{v.size}</span>
                                            <span className="variant-size-stock" style={{ fontSize: '0.75rem', color: v.stock > 0 ? '#2e7d32' : '#c62828', display: 'block', margin: '0.2rem 0', fontWeight: '600' }}>
                                                {v.stock > 0 ? `(${v.stock} available)` : '(Out of stock)'}
                                            </span>
                                            <span className="variant-size-price" style={{ display: 'block', fontSize: '0.9rem' }}>Rs. {v.price.toLocaleString()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayStock > 0 ? (
                            <>
                                <div className="quantity-selector">
                                    <label>Quantity:</label>
                                    <div className="quantity-controls">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}>+</button>
                                    </div>
                                    <span className="stock-info">{displayStock} in stock</span>
                                </div>

                                <button className="btn btn-primary btn-lg add-to-cart-btn" onClick={handleAddToCart}>
                                    Add to Cart
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-outline btn-lg" disabled style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                Out of Stock
                            </button>
                        )}

                        {/* All Size Variations & Availability Comparison Table */}
                        {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <div className="sizes-table-container" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Available Sizes & Pricing</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                                            <th style={{ padding: '0.5rem 0' }}>Size Option</th>
                                            <th style={{ padding: '0.5rem 0' }}>Price</th>
                                            <th style={{ padding: '0.5rem 0' }}>Availability</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants.map((v) => (
                                            <tr key={v._id || v.size} style={{ borderBottom: '1px solid #eee', background: selectedVariant?.size === v.size ? '#fff6f2' : 'transparent', transition: 'background-color 0.2s' }}>
                                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: selectedVariant?.size === v.size ? '700' : '400' }}>
                                                    {v.size} {selectedVariant?.size === v.size && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '0.25rem' }}>(Selected)</span>}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                                    <strong style={{ color: 'var(--primary)' }}>Rs. {v.price.toLocaleString()}</strong>
                                                    {v.compareAtPrice > 0 && (
                                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                            Rs. {v.compareAtPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                                    {v.stock > 0 ? (
                                                        <span style={{ color: '#2e7d32', fontWeight: '600', fontSize: '0.9rem' }}>✓ {v.stock} items left</span>
                                                    ) : (
                                                        <span style={{ color: '#c62828', fontWeight: '600', fontSize: '0.9rem' }}>✕ Out of Stock</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {product.features && product.features.length > 0 && (
                            <div className="features" style={{ marginTop: '2rem' }}>
                                <h3>Features</h3>
                                <ul>
                                    {product.features.map((feature, index) => (
                                        <li key={index}>✓ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
