import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get('/api/products/featured'),
                    axios.get('/api/categories')
                ]);

                setFeaturedProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="home-page">
            <Hero />

            <section className="section categories-section">
                <div className="container">
                    <h2 className="section-title text-center">Shop by Category</h2>
                    <p className="section-subtitle text-center">
                        Explore our premium collection of lighting solutions
                    </p>

                    <div className="categories-grid">
                        {categories.map(category => (
                            <Link
                                key={category._id}
                                to={`/products?category=${category.slug}`}
                                className="category-card"
                            >
                                <span className="category-icon-large">{category.icon}</span>
                                <h3>{category.name}</h3>
                                <p>{category.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section featured-section">
                <div className="container">
                    <h2 className="section-title text-center">Featured Products</h2>
                    <p className="section-subtitle text-center">
                        Handpicked premium lighting for your space
                    </p>

                    {loading ? (
                        <div className="grid grid-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: '400px' }}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-4">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-5">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section-dark why-choose-section">
                <div className="container">
                    <h2 className="section-title text-center">Why Choose Climax Lights?</h2>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">✨</div>
                            <h3>Premium Quality</h3>
                            <p>Handpicked lighting solutions crafted with the finest materials</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3>Fast Delivery</h3>
                            <p>Quick and secure delivery to your doorstep</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>Warranty Protection</h3>
                            <p>Comprehensive warranty on all products</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💎</div>
                            <h3>Expert Guidance</h3>
                            <p>Professional consultation for your lighting needs</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
