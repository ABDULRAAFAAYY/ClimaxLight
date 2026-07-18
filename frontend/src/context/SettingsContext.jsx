import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
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
        secondaryColor: '#1A1A2E',
    });
    const [loading, setLoading] = useState(true);

    const applyStyles = (data) => {
        const root = document.documentElement;
        if (data.headerBgColor) root.style.setProperty('--header-bg', data.headerBgColor);
        if (data.headerTextColor) root.style.setProperty('--header-text', data.headerTextColor);
        if (data.footerBgColor) root.style.setProperty('--footer-bg', data.footerBgColor);
        if (data.footerTextColor) root.style.setProperty('--footer-text', data.footerTextColor);
        
        if (data.heroBgImage) {
            const bgUrl = data.heroBgImage.startsWith('http') || data.heroBgImage.startsWith('/') || data.heroBgImage.startsWith('data:')
                ? `url(${data.heroBgImage})`
                : `url(${API_URL}${data.heroBgImage})`;
            root.style.setProperty('--hero-bg-image', bgUrl);
        }
        
        if (data.primaryColor) root.style.setProperty('--primary', data.primaryColor);
        if (data.primaryDarkColor) root.style.setProperty('--primary-dark', data.primaryDarkColor);
        if (data.secondaryColor) root.style.setProperty('--secondary', data.secondaryColor);
    };

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/settings`);
            if (response.data) {
                setSettings(response.data);
                applyStyles(response.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            applyStyles(settings);
        } finally {
            setLoading(false);
        }
    };

    const updateSettingsState = (newSettings) => {
        setSettings(newSettings);
        applyStyles(newSettings);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const value = {
        settings,
        loading,
        fetchSettings,
        updateSettingsState
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
