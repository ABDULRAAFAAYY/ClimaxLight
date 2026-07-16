import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const { getCartCount } = useCart();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/api/categories`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories in Navbar:', err);
            }
        };

        window.addEventListener('scroll', handleScroll);
        fetchCategories();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <img src="/assets/logo.png" alt="Climax Lights" className="logo-image" />
                    </Link>

                    <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                        <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </Link>

                        <div
                            className="nav-dropdown"
                            onMouseEnter={() => setIsCategoriesOpen(true)}
                            onMouseLeave={() => setIsCategoriesOpen(false)}
                        >
                            <Link to="/products" className="nav-link">
                                Categories <span className="dropdown-arrow">▼</span>
                            </Link>

                            {isCategoriesOpen && (
                                <div className="dropdown-menu">
                                    {categories.map(category => (
                                        <Link
                                            key={category.slug}
                                            to={`/products?category=${category.slug}`}
                                            className="dropdown-item"
                                            onClick={() => {
                                                setIsCategoriesOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <span className="category-icon">{category.icon}</span>
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link to="/products" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            All Products
                        </Link>
                    </div>

                    <div className="navbar-actions">
                        <Link to="/cart" className="cart-button">
                            <span className="cart-icon">🛒</span>
                            {getCartCount() > 0 && (
                                <span className="cart-badge">{getCartCount()}</span>
                            )}
                        </Link>

                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
