import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    // Header settings
    headerBgColor: { type: String, default: '#FFFFFF' },
    headerTextColor: { type: String, default: '#1A1A2E' },
    
    // Footer settings
    footerBgColor: { type: String, default: '#1A1A2E' },
    footerTextColor: { type: String, default: '#FFFFFF' },
    
    // Hero settings
    heroBgImage: { type: String, default: '/assets/showroom-bg.jpg' },
    heroTitle: { type: String, default: 'Illuminate Your Space' },
    heroSubtitle: { type: String, default: 'with Premium Lighting' },
    heroDescription: { type: String, default: 'Discover our exquisite collection of chandeliers, pendant lights, and modern lighting solutions that transform any space into a masterpiece.' },
    
    // Theme colors
    primaryColor: { type: String, default: '#FF5722' },
    primaryDarkColor: { type: String, default: '#E64A19' },
    secondaryColor: { type: String, default: '#1A1A2E' }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
