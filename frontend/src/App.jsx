import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';

function App() {
    return (
        <SettingsProvider>
            <CartProvider>
                <ToastProvider>
                    <Router>
                        <div className="app">
                            <Navbar />
                            <main>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/product/:slug" element={<ProductDetail />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/admin" element={<Admin />} />
                                </Routes>
                            </main>
                            <Footer />
                            <WhatsAppWidget />
                        </div>
                    </Router>
                </ToastProvider>
            </CartProvider>
        </SettingsProvider>
    );
}

export default App;
