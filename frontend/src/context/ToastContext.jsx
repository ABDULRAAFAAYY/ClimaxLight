import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => {
            // Find toast and mark as exiting first to trigger animation
            return prevToasts.map(toast => 
                toast.id === id ? { ...toast, isExiting: true } : toast
            );
        });

        // Actually delete after animation finishes
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        
        setToasts((prevToasts) => [
            ...prevToasts,
            { id, message, type, isExiting: false }
        ]);

        // Auto dismiss after 3.5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3500);
    }, [removeToast]);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✨';
            case 'error': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '🔔';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-item ${toast.type} ${toast.isExiting ? 'exit' : ''}`}
                    >
                        <span className="toast-icon">{getIcon(toast.type)}</span>
                        <div className="toast-message">{toast.message}</div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="toast-close"
                            aria-label="Close alert"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
