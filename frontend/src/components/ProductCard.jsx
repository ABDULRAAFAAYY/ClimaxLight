import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const discount = product.compareAtPrice > 0
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    const getPlaceholder = (name) => {
        const text = name || 'Product';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23667eea"/><text x="200" y="200" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text.length > 20 ? text.substring(0, 20) + '...' : text}</text></svg>`;
        return `data:image/svg+xml,${svg}`;
    };

    const getFullImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
        }
        return `${API_URL}${img}`;
    };

    const imageUrl = product.images && product.images.length > 0 && product.images[0]
        ? getFullImageUrl(product.images[0])
        : getPlaceholder(product.itemCode);

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product);
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product.slug}`} className="product-card-link">
                <div className="product-image-wrapper">
                    <img
                        src={imageUrl}
                        alt={product.itemCode}
                        className="product-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getPlaceholder(product.itemCode);
                        }}
                    />
                    {discount > 0 && (
                        <span className="product-badge">-{discount}%</span>
                    )}
                    {product.isFeatured && (
                        <span className="product-badge featured">Featured</span>
                    )}
                </div>

                <div className="product-info">
                    <h3 className="product-name">{product.itemCode}</h3>

                    <div className="product-rating">
                        <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
                        <span className="rating-text">({product.numReviews})</span>
                    </div>

                    <div className="product-pricing">
                        <span className="product-price">Rs. {product.price.toLocaleString()}</span>
                        {product.compareAtPrice > 0 && (
                            <span className="product-compare-price">
                                Rs. {product.compareAtPrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {product.stock > 0 ? (
                        <button
                            className="btn btn-primary btn-add-cart"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>
                    ) : (
                        <button className="btn btn-outline" disabled>
                            Out of Stock
                        </button>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
