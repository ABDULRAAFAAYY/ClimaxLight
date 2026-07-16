import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-logo">
                            <img src="/assets/logo.png" alt="Climax Lights" className="footer-logo-img" />
                        </h3>
                        <p className="footer-description">
                            Premium lighting solutions for your home and business.
                            Illuminate your space with elegance and style.
                        </p>
                        <div className="owner-name">Abdul Rafay</div>
                        <div className="social-links">
                            <a href="https://instagram.com/climaxlights" target="_blank" rel="noopener noreferrer" className="social-link">
                                📷 Instagram
                            </a>
                            <a href="https://facebook.com/climaxlights" target="_blank" rel="noopener noreferrer" className="social-link">
                                👍 Facebook
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Shop by Category</h4>
                        <ul className="footer-links">
                            <li><Link to="/products?category=chandeliers">Chandeliers</Link></li>
                            <li><Link to="/products?category=wall-lights">Wall Lights</Link></li>
                            <li><Link to="/products?category=pendant-lights">Pendant Lights</Link></li>
                            <li><Link to="/products?category=bulbs">Bulbs</Link></li>
                            <li><Link to="/products?category=commercial-lights">Commercial Lights</Link></li>
                            <li><Link to="/products?category=outdoor-lights">Outdoor Lights</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/cart">Shopping Cart</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <span className="contact-icon">📍</span>
                                <span>Showroom # 2 & 3 Country View Appartment<br />Clifton Block-9 Gizri Road<br />Karachi, Pakistan</span>
                            </li>
                            <li>
                                <span className="contact-icon">📞</span>
                                <span>0311-2957340 / 0336-0994280</span>
                            </li>
                            <li>
                                <span className="contact-icon">✉️</span>
                                <span>climaxlights54@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Climax Lights. All rights reserved.</p>
                    <p className="footer-note">
                        Built with ❤️ using MERN Stack
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
