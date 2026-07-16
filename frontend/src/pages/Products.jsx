import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'featured'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync filters with URL search parameters (e.g., when clicking category in navbar)
    useEffect(() => {
        setFilters({
            category: searchParams.get('category') || '',
            search: searchParams.get('search') || '',
            sort: searchParams.get('sort') || 'featured'
        });
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);
            params.append('limit', '50');

            const response = await axios.get(`/api/products?${params}`);
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        const params = new URLSearchParams();
        if (newFilters.category) params.set('category', newFilters.category);
        if (newFilters.search) params.set('search', newFilters.search);
        if (newFilters.sort) params.set('sort', newFilters.sort);
        setSearchParams(params);
    };

    const getCategoryName = () => {
        if (!filters.category) return 'All Products';
        const category = categories.find(cat => cat.slug === filters.category);
        return category ? category.name : 'Products';
    };

    return (
        <div className="products-page">
            <div className="products-header">
                <div className="container">
                    <h1>{getCategoryName()}</h1>
                    <p>Discover our premium lighting collection</p>
                </div>
            </div>

            <div className="container">
                <div className="products-layout">
                    <aside className="products-sidebar">
                        <div className="filter-section">
                            <h3>Categories</h3>
                            <div className="filter-options">
                                <button
                                    className={`filter-btn ${!filters.category ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('category', '')}
                                >
                                    All Products
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category._id}
                                        className={`filter-btn ${filters.category === category.slug ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('category', category.slug)}
                                    >
                                        <span className="filter-icon">{category.icon}</span>
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="products-main">
                        <div className="products-controls">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="sort-select"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="grid grid-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: '400px' }}></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-3">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-products">
                                <p>No products found matching your criteria.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setFilters({ category: '', search: '', sort: 'featured' })}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
