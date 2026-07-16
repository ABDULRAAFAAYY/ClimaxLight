import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('climax-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('climax-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, selectedVariant = null) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => 
                item._id === product._id && 
                (!selectedVariant ? !item.selectedVariant : (item.selectedVariant && item.selectedVariant.size === selectedVariant.size))
            );

            const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

            if (existingItem) {
                return prevItems.map(item =>
                    item._id === product._id && 
                    (!selectedVariant ? !item.selectedVariant : (item.selectedVariant && item.selectedVariant.size === selectedVariant.size))
                        ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
                        : item
                );
            }

            const itemPrice = selectedVariant ? selectedVariant.price : product.price;
            const itemCompareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : (product.compareAtPrice || 0);

            return [...prevItems, { 
                ...product, 
                price: itemPrice, 
                compareAtPrice: itemCompareAtPrice,
                selectedVariant, 
                quantity: Math.min(maxStock, quantity)
            }];
        });
    };

    const removeFromCart = (productId, selectedSize = null) => {
        setCartItems(prevItems => prevItems.filter(item => 
            !(item._id === productId && (!selectedSize ? !item.selectedVariant : (item.selectedVariant && item.selectedVariant.size === selectedSize)))
        ));
    };

    const updateQuantity = (productId, quantity, selectedSize = null) => {
        if (quantity <= 0) {
            removeFromCart(productId, selectedSize);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item._id === productId && (!selectedSize ? !item.selectedVariant : (item.selectedVariant && item.selectedVariant.size === selectedSize))) {
                    const maxStock = item.selectedVariant ? item.selectedVariant.stock : item.stock;
                    return { ...item, quantity: Math.min(maxStock, quantity) };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
