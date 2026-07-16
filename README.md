# Climax Lights - Premium MERN E-Commerce Platform

A professional, full-stack e-commerce website for selling premium lighting products including chandeliers, wall lights, pendant lights, bulbs, track lights, commercial lights, and outdoor lights.

## 🌟 Features

- **Modern UI/UX**: Premium design with gold/dark color palette, glassmorphism effects, and smooth animations
- **Product Catalog**: Browse products by category with search and sorting functionality
- **Shopping Cart**: Full cart management with localStorage persistence
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **RESTful API**: Complete backend API with MongoDB integration
- **Product Management**: CRUD operations for products and categories

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Vite
- CSS3 (Custom design system)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- dotenv

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas cluster)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string:
```env
MONGODB_URI=your_mongodb_connection_string_here
```

4. Seed the database with sample products:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### MongoDB Connection

Update the `MONGODB_URI` in `backend/.env`:

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/climax-lights?retryWrites=true&w=majority
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/climax-lights
```

### Company Information

Update the following in `backend/.env`:

```env
COMPANY_ADDRESS=Your Company Address Here
INSTAGRAM_URL=https://instagram.com/your_handle
FACEBOOK_URL=https://facebook.com/your_page
PHONE_NUMBER=+92-XXX-XXXXXXX
EMAIL=info@climaxlights.com
```

These values are displayed in the footer component.

## 📁 Project Structure

```
Climax light mern/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Category.js        # Category schema
│   │   └── Product.js         # Product schema
│   ├── routes/
│   │   ├── categories.js      # Category routes
│   │   └── products.js        # Product routes
│   ├── seeders/
│   │   └── productSeeder.js   # Sample data
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── server.js              # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation bar
│   │   │   ├── Footer.jsx     # Footer
│   │   │   ├── Hero.jsx       # Hero section
│   │   │   └── ProductCard.jsx # Product card
│   │   ├── context/
│   │   │   └── CartContext.jsx # Cart state management
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Home page
│   │   │   ├── Products.jsx   # Products catalog
│   │   │   ├── ProductDetail.jsx # Product details
│   │   │   └── Cart.jsx       # Shopping cart
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 API Endpoints

### Products
- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:slug` - Get single product by slug
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get single category
- `POST /api/categories` - Create new category

## 🎨 Product Categories

1. **Chandeliers** - Elegant and luxurious chandeliers
2. **Wall Lights** - Stylish wall-mounted lighting
3. **Pendant Lights** - Modern hanging lights
4. **Bulbs** - Energy-efficient LED and traditional bulbs
5. **Track Lights** - Adjustable track lighting systems
6. **Commercial COB & SMD Lights** - High-performance commercial lighting
7. **Outdoor Lights** - Weather-resistant outdoor lighting

## 🔨 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📝 Notes

- The application uses localStorage for cart persistence
- Sample product images use Unsplash URLs
- MongoDB connection defaults to local instance if not configured
- All prices are in Pakistani Rupees (Rs.)

## 🤝 Contributing

This is a custom e-commerce platform for Climax Lights. For modifications or feature requests, please contact the development team.

## 📄 License

Copyright © 2026 Climax Lights. All rights reserved.

---

Built with ❤️ using the MERN Stack
