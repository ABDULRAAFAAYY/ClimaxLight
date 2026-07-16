import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
    const { settings, updateSettingsState } = useSettings();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'products' | 'orders' | 'settings'
    
    // Auth states
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('adminToken'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Products states
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Orders states
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Stats states
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    
    // Product Form states
    const [isEditing, setIsEditing] = useState(false); // false for add, true for edit
    const [currentProductId, setCurrentProductId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Product Form Fields
    const [productForm, setProductForm] = useState({
        itemCode: '',
        name: '',
        price: '',
        compareAtPrice: '',
        category: '',
        stock: '0',
        description: '',
        colorOption: 'single', // 'single' | 'three'
        images: ['', '', ''], // Supports up to 3 images
        isFeatured: false,
        isActive: true,
        specifications: {
            wattage: '',
            voltage: '220V',
            material: '',
            dimensions: '',
            color: '',
            lightColor: '',
            warranty: '2 Years',
            brand: 'Climax Lights'
        },
        featuresInput: '', // Comma-separated features string
        hasVariants: false,
        variants: []
    });

    // Site Settings Form Fields
    const [settingsForm, setSettingsForm] = useState({
        headerBgColor: '#FFFFFF',
        headerTextColor: '#1A1A2E',
        footerBgColor: '#1A1A2E',
        footerTextColor: '#FFFFFF',
        heroBgImage: '/assets/showroom-bg.jpg',
        heroTitle: 'Illuminate Your Space',
        heroSubtitle: 'with Premium Lighting',
        heroDescription: 'Discover our exquisite collection of chandeliers, pendant lights, and modern lighting solutions that transform any space into a masterpiece.',
        primaryColor: '#FF5722',
        primaryDarkColor: '#E64A19',
        secondaryColor: '#1A1A2E'
    });
    const [settingsError, setSettingsError] = useState('');
    const [settingsSuccess, setSettingsSuccess] = useState('');
    const [settingsLoading, setSettingsLoading] = useState(false);

    // Fetch products, categories, settings, orders, and stats on mount/auth change
    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
            fetchCategories();
            fetchOrders();
            fetchStats();
            // Initialize settings form from context
            if (settings) {
                setSettingsForm(settings);
            }
        }
    }, [isAuthenticated, settings]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/api/admin/products`, {
                headers: { Authorization: `Basic ${token}` }
            });
            setProducts(response.data.products || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/categories`);
            setCategories(response.data || []);
            // Set default category in form if categories exist
            if (response.data && response.data.length > 0) {
                setProductForm(prev => ({
                    ...prev,
                    category: prev.category || response.data[0]._id
                }));
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/api/orders`, {
                headers: { Authorization: `Basic ${token}` }
            });
            setOrders(response.data.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleToggleOrderStatus = async (orderId, currentStatus) => {
        const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
        try {
            const token = sessionStorage.getItem('adminToken');
            await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Basic ${token}` }
            });
            fetchOrders();
            showToast('Order status updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating order status:', err);
            showToast('Failed to update order status: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            const token = sessionStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/api/orders/${orderId}`, {
                headers: { Authorization: `Basic ${token}` }
            });
            fetchOrders();
            fetchStats();
            showToast('Order deleted successfully!', 'success');
        } catch (err) {
            console.error('Error deleting order:', err);
            showToast('Failed to delete order: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/api/admin/dashboard-stats`, {
                headers: { Authorization: `Basic ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoadingStats(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/admin/login`, { username, password });
            if (response.data && response.data.success) {
                sessionStorage.setItem('adminToken', response.data.token);
                setIsAuthenticated(true);
                setUsername('');
                setPassword('');
            } else {
                setLoginError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setLoginError(err.response?.data?.message || 'Could not connect to server. Please check your network.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        setIsAuthenticated(false);
    };

    // Image Upload Handlers
    const handleImageUpload = async (index, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await axios.post(`${API_URL}/api/admin/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Basic ${token}`
                }
            });

            if (response.data && response.data.filePath) {
                const newImages = [...productForm.images];
                newImages[index] = response.data.filePath;
                setProductForm(prev => ({
                    ...prev,
                    images: newImages
                }));
                showToast('Image uploaded successfully!', 'success');
            }
        } catch (err) {
            console.error('Image upload failed:', err);
            showToast('Image upload failed: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleHeroImageUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await axios.post(`${API_URL}/api/admin/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Basic ${token}`
                }
            });

            if (response.data && response.data.filePath) {
                setSettingsForm(prev => ({
                    ...prev,
                    heroBgImage: response.data.filePath
                }));
                showToast('Hero background uploaded successfully!', 'success');
            }
        } catch (err) {
            console.error('Hero background image upload failed:', err);
            showToast('Hero background image upload failed: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    // Auto-populate first size variant with base values if toggled on and empty
    useEffect(() => {
        if (productForm.hasVariants && productForm.variants.length === 0) {
            setProductForm(prev => ({
                ...prev,
                variants: [{
                    size: '',
                    price: prev.price || '',
                    compareAtPrice: prev.compareAtPrice || '',
                    stock: prev.stock || '0'
                }]
            }));
        }
    }, [productForm.hasVariants, productForm.variants.length]);

    // Product CRUD handlers
    const openAddProduct = () => {
        setIsEditing(false);
        setCurrentProductId(null);
        setFormError('');
        setProductForm({
            itemCode: '',
            name: '',
            price: '',
            compareAtPrice: '',
            category: categories[0]?._id || '',
            stock: '0',
            description: '',
            colorOption: 'single',
            images: ['', '', ''],
            isFeatured: false,
            isActive: true,
            specifications: {
                wattage: '',
                voltage: '220V',
                material: '',
                dimensions: '',
                color: '',
                lightColor: '',
                warranty: '2 Years',
                brand: 'Climax Lights'
            },
            featuresInput: '',
            hasVariants: false,
            variants: []
        });
        setShowForm(true);
    };

    const openEditProduct = (product) => {
        setIsEditing(true);
        setCurrentProductId(product._id);
        setFormError('');

        // Ensure images array has 3 slots
        const paddedImages = [...(product.images || [])];
        while (paddedImages.length < 3) {
            paddedImages.push('');
        }

        setProductForm({
            itemCode: product.itemCode || '',
            name: product.name || '',
            price: product.price || '',
            compareAtPrice: product.compareAtPrice || '',
            category: product.category?._id || product.category || '',
            stock: String(product.stock || 0),
            description: product.description || '',
            colorOption: product.colorOption || 'single',
            images: paddedImages,
            isFeatured: !!product.isFeatured,
            isActive: product.isActive !== undefined ? !!product.isActive : true,
            specifications: {
                wattage: product.specifications?.wattage || '',
                voltage: product.specifications?.voltage || '220V',
                material: product.specifications?.material || '',
                dimensions: product.specifications?.dimensions || '',
                color: product.specifications?.color || '',
                lightColor: product.specifications?.lightColor || '',
                warranty: product.specifications?.warranty || '2 Years',
                brand: product.specifications?.brand || 'Climax Lights'
            },
            featuresInput: (product.features || []).join(', '),
            hasVariants: !!product.hasVariants,
            variants: product.variants ? product.variants.map(v => ({
                size: v.size || '',
                price: String(v.price || ''),
                compareAtPrice: String(v.compareAtPrice || ''),
                stock: String(v.stock || '0'),
                _id: v._id
            })) : []
        });
        setShowForm(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        const token = sessionStorage.getItem('adminToken');

        // Prepare body
        const features = productForm.featuresInput
            ? productForm.featuresInput.split(',').map(f => f.trim()).filter(Boolean)
            : [];

        // Validate color options images
        const cleanImages = productForm.images.filter(img => img && img.trim() !== '');
        
        if (productForm.colorOption === 'three') {
            if (cleanImages.length < 3) {
                setFormError('For a 3-color light, exactly 3 pictures are required.');
                setFormLoading(false);
                return;
            }
        } else {
            if (cleanImages.length < 1) {
                setFormError('For a single color light, at least 1 picture is mandatory.');
                setFormLoading(false);
                return;
            }
        }

        // Validate size variants
        if (productForm.hasVariants) {
            if (!productForm.variants || productForm.variants.length === 0) {
                setFormError('At least one size variant is required.');
                setFormLoading(false);
                return;
            }
            for (let i = 0; i < productForm.variants.length; i++) {
                const v = productForm.variants[i];
                if (!v.size || !String(v.size).trim() || !v.price || String(v.price).trim() === '') {
                    setFormError(`Variant at index ${i + 1} is missing size or price.`);
                    setFormLoading(false);
                    return;
                }
            }
        }

        const payload = {
            itemCode: productForm.itemCode,
            name: productForm.name,
            price: productForm.hasVariants ? parseFloat(productForm.variants[0].price) : productForm.price,
            compareAtPrice: productForm.hasVariants ? (parseFloat(productForm.variants[0].compareAtPrice) || 0) : (parseFloat(productForm.compareAtPrice) || 0),
            category: productForm.category,
            stock: productForm.hasVariants ? productForm.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0) : parseInt(productForm.stock) || 0,
            description: productForm.description,
            colorOption: productForm.colorOption,
            images: cleanImages,
            isFeatured: productForm.isFeatured,
            isActive: productForm.isActive,
            specifications: productForm.specifications,
            features,
            hasVariants: productForm.hasVariants,
            variants: productForm.hasVariants ? productForm.variants.map(v => ({
                size: v.size.trim(),
                price: parseFloat(v.price) || 0,
                compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : 0,
                stock: parseInt(v.stock) || 0,
                _id: v._id
            })) : []
        };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/api/admin/products/${currentProductId}`, payload, {
                    headers: { Authorization: `Basic ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/api/admin/products`, payload, {
                    headers: { Authorization: `Basic ${token}` }
                });
            }
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            setFormError(err.response?.data?.message || 'Error saving product. Make sure Item Code is unique.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const token = sessionStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/api/admin/products/${id}`, {
                headers: { Authorization: `Basic ${token}` }
            });
            fetchProducts();
            showToast('Product deleted successfully!', 'success');
        } catch (err) {
            console.error('Error deleting product:', err);
            showToast(err.response?.data?.message || 'Error deleting product', 'error');
        }
    };

    // Settings handlers
    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setSettingsError('');
        setSettingsSuccess('');
        setSettingsLoading(true);

        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await axios.put(`${API_URL}/api/admin/settings`, settingsForm, {
                headers: { Authorization: `Basic ${token}` }
            });

            if (response.data) {
                setSettingsSuccess('Website configurations updated successfully!');
                updateSettingsState(response.data);
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            setSettingsError(err.response?.data?.message || 'Error saving settings.');
        } finally {
            setSettingsLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();
        return (
            product.name?.toLowerCase().includes(query) ||
            product.itemCode?.toLowerCase().includes(query)
        );
    });

    const getFullImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
        }
        return `${API_URL}${img}`;
    };

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h2>Admin Portal</h2>
                    <p>Enter credentials to access inventory and site designs</p>
                    <form onSubmit={handleLogin} className="login-form">
                        {loginError && <div className="login-error">{loginError}</div>}
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter admin username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loginLoading}>
                            {loginLoading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1>Admin Control Panel</h1>
                    <p>Manage your product catalogue and dynamically customize website styling</p>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Admin Tabs */}
            <div className="admin-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('dashboard'); setShowForm(false); fetchStats(); }}
                >
                    📈 Insights & Analytics
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('products'); setShowForm(false); }}
                >
                    📦 Product Catalogue ({products.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('orders'); setShowForm(false); fetchOrders(); }}
                >
                    📝 Customer Orders ({orders.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('settings'); setShowForm(false); }}
                >
                    🎨 Website Customization
                </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="admin-content">

                {/* 0. INSIGHTS & ANALYTICS DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="dashboard-tab">
                        {loadingStats ? (
                            <div className="text-center" style={{ padding: '3rem' }}>
                                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                                <p style={{ marginTop: '1rem', color: 'var(--gray)' }}>Loading business stats...</p>
                            </div>
                        ) : !stats ? (
                            <div className="text-center" style={{ padding: '3rem' }}>
                                <p style={{ color: 'var(--gray)' }}>No statistics available. Try reloading.</p>
                                <button className="btn btn-outline" onClick={fetchStats}>Reload</button>
                            </div>
                        ) : (
                            <>
                                {/* Metrics Cards Grid */}
                                <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                                    <div className="metric-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: '600' }}>Overall Revenue</span>
                                            <span style={{ fontSize: '1.5rem' }}>💰</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--secondary)', margin: '0' }}>Rs. {stats.summary.totalRevenue.toLocaleString()}</h3>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Total value of all placed orders</span>
                                    </div>
                                    
                                    <div className="metric-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: '600' }}>Completed Revenue</span>
                                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2e7d32', margin: '0' }}>Rs. {stats.summary.completedRevenue.toLocaleString()}</h3>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Delivered & paid orders</span>
                                    </div>

                                    <div className="metric-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: '600' }}>Total Orders</span>
                                            <span style={{ fontSize: '1.5rem' }}>📦</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--secondary)', margin: '0' }}>{stats.summary.totalOrders}</h3>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '4px', display: 'flex', gap: '8px' }}>
                                            <span style={{ color: '#e65100', fontWeight: '600' }}>{stats.summary.pendingOrders} Pending</span>
                                            <span>|</span>
                                            <span style={{ color: '#2e7d32', fontWeight: '600' }}>{stats.summary.completedOrders} Completed</span>
                                        </div>
                                    </div>

                                    <div className="metric-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: '600' }}>Catalogue Items</span>
                                            <span style={{ fontSize: '1.5rem' }}>💎</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--secondary)', margin: '0' }}>{stats.summary.totalProducts}</h3>
                                        <span style={{ fontSize: '0.75rem', color: stats.summary.outOfStockProducts > 0 ? '#c62828' : 'var(--gray)', fontWeight: stats.summary.outOfStockProducts > 0 ? '600' : '400' }}>
                                            {stats.summary.outOfStockProducts > 0 ? `⚠️ ${stats.summary.outOfStockProducts} Out of stock` : 'All items in stock'}
                                        </span>
                                    </div>
                                </div>

                                {/* Analytics Breakdown Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    
                                    {/* Category Revenue Distribution chart */}
                                    <div style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--secondary)' }}>Category Product Size & Sales Share</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            {stats.categoryBreakdown.map((cat, idx) => {
                                                const maxProducts = Math.max(...stats.categoryBreakdown.map(c => c.productCount), 1);
                                                const pctWidth = (cat.productCount / maxProducts) * 100;
                                                return (
                                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                                                            <span>{cat.name}</span>
                                                            <span style={{ color: 'var(--gray)' }}>{cat.productCount} items | Rs. {cat.revenue.toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ background: '#f5f5f5', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                                            <div style={{ background: 'var(--gradient-primary)', width: `${pctWidth}%`, height: '100%', borderRadius: '5px', transition: 'width 0.5s ease-out' }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Best Sellers */}
                                    <div style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--secondary)' }}>🏆 Top Selling Products</h3>
                                        {stats.bestSellers.length === 0 ? (
                                            <p style={{ color: 'var(--gray)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>No products sold yet.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {stats.bestSellers.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: idx < stats.bestSellers.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span style={{ fontWeight: '700', color: 'var(--primary)', width: '20px' }}>#{idx + 1}</span>
                                                            {item.image && (
                                                                <img 
                                                                    src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} 
                                                                    alt={item.itemCode} 
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <strong style={{ color: 'var(--secondary)' }}>{item.itemCode}</strong>
                                                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray)' }}>{item.name || 'Catalogue Product'}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontWeight: '700', display: 'block', color: 'var(--secondary)' }}>{item.quantity} units sold</span>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Rs. {item.revenue.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity Orders */}
                                <div style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: '0', color: 'var(--secondary)' }}>⏱️ Recent Orders Activity</h3>
                                        <button className="btn btn-outline btn-sm" onClick={() => { setActiveTab('orders'); setShowForm(false); fetchOrders(); }}>View All Orders</button>
                                    </div>
                                    {stats.recentOrders.length === 0 ? (
                                        <p style={{ color: 'var(--gray)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No orders placed yet.</p>
                                    ) : (
                                        <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #f0f0f0' }}>
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Order Number</th>
                                                        <th>Date</th>
                                                        <th>Customer</th>
                                                        <th>Total Amount</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.recentOrders.map(order => (
                                                        <tr key={order.id}>
                                                            <td><strong>{order.orderNumber}</strong></td>
                                                            <td style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td>{order.customerName}</td>
                                                            <td style={{ fontWeight: '700' }}>
                                                                Rs. {order.totalAmount.toLocaleString()}
                                                                <span style={{ 
                                                                    display: 'block', 
                                                                    fontSize: '0.75rem', 
                                                                    color: order.paymentMethod === 'Card' || order.paymentMethod === 'Online' ? '#2e7d32' : 'var(--gray)', 
                                                                    marginTop: '2px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {order.paymentMethod === 'Card' ? `Card (${order.paymentStatus})` : 
                                                                     order.paymentMethod === 'Online' ? `Online (${order.paymentStatus})` : 
                                                                     `COD (${order.paymentStatus})`}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span 
                                                                    className="order-status-badge"
                                                                    style={{
                                                                        padding: '0.25rem 0.6rem',
                                                                        borderRadius: '50px',
                                                                        fontWeight: '700',
                                                                        fontSize: '0.75rem',
                                                                        display: 'inline-block',
                                                                        background: order.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                                                                        color: order.status === 'Completed' ? '#2e7d32' : '#e65100',
                                                                        border: order.status === 'Completed' ? '1px solid #c8e6c9' : '1px solid #ffe0b2'
                                                                    }}
                                                                >
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
                
                {/* 1. PRODUCTS INVENTORY TAB */}
                {activeTab === 'products' && !showForm && (
                    <div className="products-tab">
                        <div className="table-actions">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by item code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="add-btn" onClick={openAddProduct}>
                                ➕ Add New Product
                            </button>
                        </div>

                        {loadingProducts ? (
                            <div className="skeleton-container">
                                <div className="skeleton" style={{ height: '80px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '80px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '80px' }}></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="empty-state text-center py-5">
                                <p className="large-text">No products found in catalogue.</p>
                                <button className="btn btn-outline mt-3" onClick={openAddProduct}>
                                    Create First Product
                                </button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Item Code</th>
                                            <th>Category</th>
                                            <th>Price (Rs.)</th>
                                            <th>Color Option</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product._id}>
                                                <td>
                                                    <img 
                                                        src={product.images?.[0] ? getFullImageUrl(product.images[0]) : 'https://via.placeholder.com/60'} 
                                                        alt={product.itemCode} 
                                                        className="table-img-thumbnail"
                                                    />
                                                </td>
                                                <td className="item-code-cell">{product.itemCode}</td>
                                                <td>{product.category?.name || 'Uncategorized'}</td>
                                                <td>
                                                    <strong>{product.price.toLocaleString()}</strong>
                                                    {product.compareAtPrice > 0 && (
                                                        <span className="compare-price-small">
                                                            <br />Rs. {product.compareAtPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {product.hasVariants && (
                                                        <span style={{ fontSize: '0.75rem', color: '#ff5722', display: 'block', fontWeight: '600', marginTop: '2px' }}>
                                                            ({product.variants?.length || 0} sizes)
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`color-opt-badge ${product.colorOption}`}>
                                                        {product.colorOption === 'three' ? '🎨 3 Colors' : '⚪ Single'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {product.stock}
                                                    {product.hasVariants && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)', display: 'block', marginTop: '2px' }}>
                                                            (total)
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                                        {product.isActive ? 'Active' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="edit-action"
                                                            onClick={() => openEditProduct(product)}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button 
                                                            className="delete-action"
                                                            onClick={() => handleDeleteProduct(product._id, product.name)}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* PRODUCT ADD/EDIT FORM VIEW */}
                {activeTab === 'products' && showForm && (
                    <div className="form-card">
                        <div className="form-header">
                            <h2>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                            <button className="back-btn" onClick={() => setShowForm(false)}>
                                ⬅️ Back to List
                            </button>
                        </div>

                        {formError && <div className="form-error-banner">{formError}</div>}

                        <form onSubmit={handleProductSubmit} className="product-crud-form">
                            <div className="form-grid">
                                
                                {/* Item Code */}
                                <div className="form-group-full">
                                    <label>Item Code (Unique Identifier) *</label>
                                    <input
                                        type="text"
                                        value={productForm.itemCode}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, itemCode: e.target.value }))}
                                        placeholder="e.g. CL-CH-001"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Size Variants Switch */}
                                <div className="form-group-full text-left" style={{ margin: '1rem 0' }}>
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox"
                                            checked={productForm.hasVariants}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, hasVariants: e.target.checked }))}
                                        />
                                        <span>Product has multiple size options / variants (e.g. chandeliers with different prices and stock per size)</span>
                                    </label>
                                </div>

                                {/* Condition: Show standard price inputs if no variants */}
                                {!productForm.hasVariants && (
                                    <>
                                        {/* Price */}
                                        <div className="form-group">
                                            <label>Price (Rs.) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={productForm.price}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                                                placeholder="e.g. 45000"
                                                required
                                            />
                                        </div>

                                        {/* Compare Price */}
                                        <div className="form-group">
                                            <label>Compare at Price / Original Price (Rs.)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={productForm.compareAtPrice}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                                                placeholder="e.g. 55000"
                                            />
                                        </div>

                                        {/* Stock */}
                                        <div className="form-group">
                                            <label>Stock Quantity *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={productForm.stock}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Condition: Show variant configurator if variants enabled */}
                                {productForm.hasVariants && (
                                    <div className="form-group-full variants-editor" style={{ background: '#fcfcfc', border: '1px solid #eee', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem', width: '100%' }}>
                                        <label style={{ fontWeight: '700', marginBottom: '1rem', display: 'block', color: 'var(--secondary)' }}>Size Variants Configurator</label>
                                        <div className="variants-list">
                                            {productForm.variants.map((variant, index) => (
                                                <div key={index} className="variant-row-inputs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                                    <input 
                                                        type="text"
                                                        placeholder="Size (e.g. 60cm)"
                                                        value={variant.size}
                                                        onChange={(e) => {
                                                            const updated = [...productForm.variants];
                                                            updated[index].size = e.target.value;
                                                            setProductForm(prev => ({ ...prev, variants: updated }));
                                                        }}
                                                        style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', height: '40px' }}
                                                        required
                                                    />
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="Price (Rs.) *"
                                                        value={variant.price}
                                                        onChange={(e) => {
                                                            const updated = [...productForm.variants];
                                                            updated[index].price = e.target.value;
                                                            setProductForm(prev => ({ ...prev, variants: updated }));
                                                        }}
                                                        style={{ flex: 1.5, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', height: '40px' }}
                                                        required
                                                    />
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="Compare Price"
                                                        value={variant.compareAtPrice}
                                                        onChange={(e) => {
                                                            const updated = [...productForm.variants];
                                                            updated[index].compareAtPrice = e.target.value;
                                                            setProductForm(prev => ({ ...prev, variants: updated }));
                                                        }}
                                                        style={{ flex: 1.5, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', height: '40px' }}
                                                    />
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="Stock *"
                                                        value={variant.stock}
                                                        onChange={(e) => {
                                                            const updated = [...productForm.variants];
                                                            updated[index].stock = e.target.value;
                                                            setProductForm(prev => ({ ...prev, variants: updated }));
                                                        }}
                                                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', height: '40px' }}
                                                        required
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn-danger btn-sm"
                                                        onClick={() => {
                                                            const updated = productForm.variants.filter((_, idx) => idx !== index);
                                                            setProductForm(prev => ({ ...prev, variants: updated }));
                                                        }}
                                                        style={{ padding: '0.5rem 0.75rem', height: '40px', borderRadius: '4px', cursor: 'pointer', background: '#dc3545', color: '#fff', border: 'none' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline btn-sm"
                                            onClick={() => {
                                                setProductForm(prev => ({ 
                                                    ...prev, 
                                                    variants: [...prev.variants, { size: '', price: '', compareAtPrice: '', stock: '0' }] 
                                                }));
                                            }}
                                            style={{ marginTop: '0.5rem', display: 'inline-flex', padding: '0.5rem 1rem' }}
                                        >
                                            ➕ Add Size Option
                                        </button>
                                    </div>
                                )}

                                {/* Color Option Choice */}
                                <div className="form-group-full text-left">
                                    <label>Color Lighting Configurations *</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input 
                                                type="radio" 
                                                name="colorOption" 
                                                value="single"
                                                checked={productForm.colorOption === 'single'}
                                                onChange={() => setProductForm(prev => ({ ...prev, colorOption: 'single' }))}
                                            />
                                            <span>⚪ Single Color Light (Requires 1 mandatory picture)</span>
                                        </label>
                                        <label className="radio-label">
                                            <input 
                                                type="radio" 
                                                name="colorOption" 
                                                value="three"
                                                checked={productForm.colorOption === 'three'}
                                                onChange={() => setProductForm(prev => ({ ...prev, colorOption: 'three' }))}
                                            />
                                            <span>🎨 3 Color Option Light (Requires 3 mandatory pictures)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Images Section */}
                                <div className="form-group-full upload-gallery-section">
                                    <label className="section-label">Product Pictures (Mandatory based on color configuration)</label>
                                    
                                    <div className="pictures-row">
                                        {/* Picture 1 */}
                                        <div className="picture-card-uploader">
                                            <div className="pic-header">
                                                <span>Picture 1 (Primary) *</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Image URL" 
                                                value={productForm.images[0] || ''}
                                                onChange={(e) => {
                                                    const newImgs = [...productForm.images];
                                                    newImgs[0] = e.target.value;
                                                    setProductForm(prev => ({ ...prev, images: newImgs }));
                                                }}
                                            />
                                            <div className="file-upload-input-wrap">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(0, e.target.files?.[0])}
                                                />
                                            </div>
                                            {productForm.images[0] && (
                                                <img 
                                                    src={getFullImageUrl(productForm.images[0])} 
                                                    alt="Preview 1" 
                                                    className="upload-preview-img"
                                                />
                                            )}
                                        </div>

                                        {/* Picture 2 */}
                                        <div className={`picture-card-uploader ${productForm.colorOption === 'single' ? 'optional' : ''}`}>
                                            <div className="pic-header">
                                                <span>Picture 2 {productForm.colorOption === 'three' ? '*' : '(Optional)'}</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Image URL" 
                                                value={productForm.images[1] || ''}
                                                onChange={(e) => {
                                                    const newImgs = [...productForm.images];
                                                    newImgs[1] = e.target.value;
                                                    setProductForm(prev => ({ ...prev, images: newImgs }));
                                                }}
                                                required={productForm.colorOption === 'three'}
                                            />
                                            <div className="file-upload-input-wrap">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(1, e.target.files?.[0])}
                                                />
                                            </div>
                                            {productForm.images[1] && (
                                                <img 
                                                    src={getFullImageUrl(productForm.images[1])} 
                                                    alt="Preview 2" 
                                                    className="upload-preview-img"
                                                />
                                            )}
                                        </div>

                                        {/* Picture 3 */}
                                        <div className={`picture-card-uploader ${productForm.colorOption === 'single' ? 'optional' : ''}`}>
                                            <div className="pic-header">
                                                <span>Picture 3 {productForm.colorOption === 'three' ? '*' : '(Optional)'}</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Image URL" 
                                                value={productForm.images[2] || ''}
                                                onChange={(e) => {
                                                    const newImgs = [...productForm.images];
                                                    newImgs[2] = e.target.value;
                                                    setProductForm(prev => ({ ...prev, images: newImgs }));
                                                }}
                                                required={productForm.colorOption === 'three'}
                                            />
                                            <div className="file-upload-input-wrap">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(2, e.target.files?.[0])}
                                                />
                                            </div>
                                            {productForm.images[2] && (
                                                <img 
                                                    src={getFullImageUrl(productForm.images[2])} 
                                                    alt="Preview 3" 
                                                    className="upload-preview-img"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="form-group-full">
                                    <label>Description</label>
                                    <textarea
                                        rows="4"
                                        value={productForm.description}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Detailed description of the lighting fixture..."
                                    ></textarea>
                                </div>

                                {/* Commas features */}
                                <div className="form-group-full">
                                    <label>Key Features (comma-separated list)</label>
                                    <input
                                        type="text"
                                        value={productForm.featuresInput}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, featuresInput: e.target.value }))}
                                        placeholder="e.g. Energy saving, Handcrafted Crystals, Dimmable LED"
                                    />
                                </div>

                                {/* Specifications */}
                                <div className="form-group-full">
                                    <label className="section-label">Technical Specifications</label>
                                    <div className="spec-inputs-grid">
                                        <div className="form-group">
                                            <label>Wattage</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.wattage}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, wattage: e.target.value }
                                                }))}
                                                placeholder="e.g. 60W LED"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Voltage</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.voltage}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, voltage: e.target.value }
                                                }))}
                                                placeholder="e.g. 220V"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Material</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.material}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, material: e.target.value }
                                                }))}
                                                placeholder="e.g. Metal & Crystal"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Dimensions</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.dimensions}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, dimensions: e.target.value }
                                                }))}
                                                placeholder="e.g. 60cm diameter"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Color</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.color}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, color: e.target.value }
                                                }))}
                                                placeholder="e.g. Gold"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Light Color</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.lightColor}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, lightColor: e.target.value }
                                                }))}
                                                placeholder="e.g. Warm White / 3 Color options"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Warranty</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.warranty}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, warranty: e.target.value }
                                                }))}
                                                placeholder="e.g. 2 Years"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Brand</label>
                                            <input 
                                                type="text" 
                                                value={productForm.specifications.brand}
                                                onChange={(e) => setProductForm(prev => ({
                                                    ...prev,
                                                    specifications: { ...prev.specifications, brand: e.target.value }
                                                }))}
                                                placeholder="e.g. Climax Lights"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Active & Featured toggles */}
                                <div className="form-group-full checkbox-row">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={productForm.isFeatured}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                        />
                                        <span>⭐ Feature product on Home Page</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={productForm.isActive}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                        />
                                        <span>👁️ Make product visible on catalogue</span>
                                    </label>
                                </div>

                            </div>

                            <button type="submit" className="save-btn" disabled={formLoading}>
                                {formLoading ? 'Saving...' : (isEditing ? '💾 Save Changes' : '➕ Create Product')}
                            </button>
                        </form>
                    </div>
                )}

                {/* 3. CUSTOMER ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="orders-tab">
                        <div className="table-actions">
                            <h2>📝 Customer Orders ({orders.length})</h2>
                            <button className="btn btn-outline btn-sm" onClick={fetchOrders} disabled={loadingOrders}>
                                {loadingOrders ? 'Refreshing...' : '🔄 Refresh List'}
                            </button>
                        </div>

                        {loadingOrders ? (
                            <div className="text-center" style={{ padding: '3rem' }}>
                                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                                <p style={{ marginTop: '1rem', color: 'var(--gray)' }}>Loading customer orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center" style={{ padding: '3rem', background: 'var(--white)', borderRadius: '8px', border: '1px solid #eee' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                <h3>No orders placed yet</h3>
                                <p style={{ color: 'var(--gray)' }}>Customer Cash on Delivery orders will appear here.</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order No / Date</th>
                                            <th>Customer Details</th>
                                            <th>Items Purchased</th>
                                            <th>Total amount</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td style={{ verticalAlign: 'top', padding: '1rem' }}>
                                                    <strong>{order.orderNumber || 'N/A'}</strong>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray)', marginTop: '4px' }}>
                                                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </td>
                                                <td style={{ verticalAlign: 'top', padding: '1rem', fontSize: '0.9rem' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>{order.customer.name}</div>
                                                    <div style={{ color: 'var(--primary)', fontWeight: '600', margin: '2px 0' }}>📞 {order.customer.phone}</div>
                                                    <div style={{ color: 'var(--gray)', fontSize: '0.8rem', maxWidth: '200px', wordBreak: 'break-word' }}>
                                                        📍 {order.customer.address}, {order.customer.city}
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: 'top', padding: '1rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {item.product && item.product.images && item.product.images.length > 0 && (
                                                                    <img 
                                                                        src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${API_URL}${item.product.images[0]}`} 
                                                                        alt={item.itemCode} 
                                                                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <strong>{item.itemCode}</strong> 
                                                                    {item.selectedSize && <span style={{ color: 'var(--primary)', fontWeight: '600' }}> ({item.selectedSize})</span>}
                                                                    <span style={{ color: 'var(--gray)' }}> x {item.quantity}</span>
                                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray)' }}>Rs. {item.price.toLocaleString()} each</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: 'top', padding: '1rem', fontWeight: '700', color: 'var(--secondary)' }}>
                                                    Rs. {order.totalAmount.toLocaleString()}
                                                    <span style={{ 
                                                        display: 'block', 
                                                        fontSize: '0.75rem', 
                                                        color: order.paymentMethod === 'Card' || order.paymentMethod === 'Online' ? '#2e7d32' : 'var(--gray)', 
                                                        marginTop: '4px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {order.paymentMethod === 'Card' ? `💳 Card (${order.paymentStatus})` : 
                                                         order.paymentMethod === 'Online' ? `📱 Online (${order.paymentStatus})` : 
                                                         `💵 COD (${order.paymentStatus})`}
                                                    </span>
                                                    {order.paymentMethod === 'Online' && order.receiptImage && (
                                                        <a 
                                                            href={getFullImageUrl(order.receiptImage)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-block',
                                                                fontSize: '0.7rem',
                                                                color: 'var(--primary)',
                                                                textDecoration: 'underline',
                                                                marginTop: '4px',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            View Receipt
                                                        </a>
                                                    )}
                                                </td>
                                                <td style={{ verticalAlign: 'top', padding: '1rem' }}>
                                                    <span 
                                                        className="order-status-badge"
                                                        style={{
                                                            padding: '0.35rem 0.75rem',
                                                            borderRadius: '50px',
                                                            fontWeight: '700',
                                                            fontSize: '0.8rem',
                                                            display: 'inline-block',
                                                            background: order.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                                                            color: order.status === 'Completed' ? '#2e7d32' : '#e65100',
                                                            border: order.status === 'Completed' ? '1px solid #c8e6c9' : '1px solid #ffe0b2'
                                                        }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ verticalAlign: 'top', padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={() => handleToggleOrderStatus(order._id, order.status)}
                                                            style={{
                                                                padding: '0.5rem 0.75rem',
                                                                borderRadius: '6px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                border: 'none',
                                                                color: '#fff',
                                                                background: order.status === 'Completed' ? '#757575' : 'var(--primary)',
                                                                transition: 'opacity 0.2s'
                                                            }}
                                                        >
                                                            {order.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            style={{
                                                                padding: '0.5rem 0.75rem',
                                                                borderRadius: '6px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                border: '1px solid #dc3545',
                                                                color: '#dc3545',
                                                                background: 'transparent',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = '#dc3545';
                                                                e.target.style.color = '#fff';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'transparent';
                                                                e.target.style.color = '#dc3545';
                                                            }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SITE CONFIGURATIONS TAB */}
                {activeTab === 'settings' && (
                    <div className="settings-tab form-card">
                        <h2>🎨 Customize Website Styling</h2>
                        <p className="tab-description">Modify dynamic layout styling, brand colors, header, footer backgrounds, and home page hero banners instantly.</p>
                        
                        {settingsError && <div className="form-error-banner">{settingsError}</div>}
                        {settingsSuccess && <div className="form-success-banner">{settingsSuccess}</div>}

                        <form onSubmit={handleSettingsSubmit} className="site-settings-form">
                            
                            <div className="settings-section">
                                <h3>🟢 Brand Primary Colors</h3>
                                <div className="color-pickers-grid">
                                    <div className="color-field">
                                        <label>Primary Theme Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.primaryColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.primaryColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="color-field">
                                        <label>Primary Dark Theme Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.primaryDarkColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, primaryDarkColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.primaryDarkColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, primaryDarkColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="color-field">
                                        <label>Secondary Theme Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.secondaryColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.secondaryColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>🔵 Header Styling</h3>
                                <div className="color-pickers-grid">
                                    <div className="color-field">
                                        <label>Header Background Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.headerBgColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, headerBgColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.headerBgColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, headerBgColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="color-field">
                                        <label>Header Navigation Text Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.headerTextColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, headerTextColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.headerTextColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, headerTextColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>🔴 Footer Styling</h3>
                                <div className="color-pickers-grid">
                                    <div className="color-field">
                                        <label>Footer Background Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.footerBgColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, footerBgColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.footerBgColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, footerBgColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="color-field">
                                        <label>Footer Text Color</label>
                                        <div className="picker-wrapper">
                                            <input 
                                                type="color" 
                                                value={settingsForm.footerTextColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, footerTextColor: e.target.value }))}
                                            />
                                            <input 
                                                type="text" 
                                                value={settingsForm.footerTextColor}
                                                onChange={(e) => setSettingsForm(prev => ({ ...prev, footerTextColor: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>🚀 Hero Banner Section</h3>
                                <div className="form-grid">
                                    
                                    <div className="form-group-full">
                                        <label>Hero Title</label>
                                        <input 
                                            type="text" 
                                            value={settingsForm.heroTitle}
                                            onChange={(e) => setSettingsForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                                            placeholder="Illuminate Your Space"
                                        />
                                    </div>

                                    <div className="form-group-full">
                                        <label>Hero Subtitle</label>
                                        <input 
                                            type="text" 
                                            value={settingsForm.heroSubtitle}
                                            onChange={(e) => setSettingsForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                                            placeholder="with Premium Lighting"
                                        />
                                    </div>

                                    <div className="form-group-full">
                                        <label>Hero Description</label>
                                        <textarea 
                                            rows="3"
                                            value={settingsForm.heroDescription}
                                            onChange={(e) => setSettingsForm(prev => ({ ...prev, heroDescription: e.target.value }))}
                                            placeholder="Discover our premium lights collection..."
                                        ></textarea>
                                    </div>

                                    <div className="form-group-full">
                                        <label>Hero Background Image URL / File Upload</label>
                                        <input 
                                            type="text" 
                                            value={settingsForm.heroBgImage}
                                            onChange={(e) => setSettingsForm(prev => ({ ...prev, heroBgImage: e.target.value }))}
                                            placeholder="/assets/showroom-bg.jpg"
                                        />
                                        <div className="file-upload-input-wrap mt-2">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleHeroImageUpload(e.target.files?.[0])}
                                            />
                                        </div>
                                        {settingsForm.heroBgImage && (
                                            <img 
                                                src={getFullImageUrl(settingsForm.heroBgImage)} 
                                                alt="Hero background preview" 
                                                className="hero-bg-preview-img mt-3"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="save-btn" disabled={settingsLoading}>
                                {settingsLoading ? 'Updating Configurations...' : '💾 Save Customizations'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
