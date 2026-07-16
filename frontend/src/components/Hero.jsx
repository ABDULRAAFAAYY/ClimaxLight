import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Hero.css';

const Hero = () => {
    const { settings } = useSettings();

    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-container">
                <div className="hero-content">
                    <h1 className="hero-title animate-slideInLeft">
                        {settings.heroTitle}
                        <span className="hero-subtitle">{settings.heroSubtitle}</span>
                    </h1>
                    <p className="hero-description animate-slideInLeft">
                        {settings.heroDescription}
                    </p>
                    <div className="hero-actions animate-slideInLeft">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Shop Now
                        </Link>
                        <Link to="/products?category=chandeliers" className="btn btn-outline btn-lg">
                            View Chandeliers
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
