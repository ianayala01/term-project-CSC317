
# Travel Essentials E-Commerce Website

A full-featured e-commerce platform specializing in travel necessities, built with Node.js, Express.js, and SQLite. The application provides a complete shopping experience including product browsing, user authentication, shopping cart functionality, and order processing.

## Project Overview

Travel Essentials is a responsive web application that allows users to browse and purchase travel-related products. The platform includes user registration and authentication, product search and filtering, shopping cart management, and a streamlined checkout process.

## Features

- **Responsive Design**: Mobile-first interface that adapts to all device sizes
- **User Authentication**: Secure login/registration system with bcrypt password hashing
- **Product Catalog**: Browse products with filters for category, price range, and sorting options
- **Search Functionality**: Find products by name, description, or category
- **Shopping Cart**: Add, update quantity, and remove items from your cart
- **User Profiles**: Manage account details and view order history
- **Checkout Process**: Simplified purchase flow with order confirmation
- **Category Navigation**: Browse products by travel-specific categories

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: Session-based authentication with bcrypt
- **State Management**: Local storage for guest users, database for authenticated users

## Directory Structure
```plaintext
travel-essentials/
├── app.js                     # Main application entry point
├── data/
│   ├── database.js            # Database connection and utilities
│   ├── database.sqlite        # SQLite database file
│   └── seed.js                # Database seeding script
├── public/
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   ├── images/
│   │   └── products/          # Product images
│   ├── js/
│   │   ├── auth.js            # Authentication logic
│   │   ├── cart.js            # Cart functionality
│   │   ├── main.js            # Main app logic
│   │   └── validation.js      # Form validation
│   └── *.html                 # HTML templates (index, product, cart, etc.)
├── routes/
│   ├── auth.js                # Auth routes
│   ├── cart.js                # Cart routes
│   ├── products.js            # Product routes
│   └── users.js               # User routes
├── package.json              # Project metadata and dependencies
├── sessions.sqlite           # Session storage database
└── update_products.js        # Product update script
```
## Installation

1. Clone the repository
git clone - https://github.com/ianayala01/term-project-CSC317
cd travel-essentials

2. Install dependencies
npm install

3. Initialize the database
node data/seed.js

4. Start the application
npm start

5. Open your browser and navigate to `http://localhost:3000`

## Sample Data

The application comes pre-seeded with:

- 18 travel-related products across 9 categories
- A test user account: You can register any account like 
- Email: test@example.com 
- Password: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Log in to existing account
- `GET /api/auth/logout` - Log out current session
- `GET /api/auth/status` - Check authentication status

### Products
- `GET /api/products` - Get all products with optional filtering
- `GET /api/products/:id` - Get specific product details
- `GET /api/products/search` - Search products by query or category
- `GET /api/products/categories` - Get all product categories
- `POST /api/products` - Add new product (with validation)
- `PUT /api/products/:id` - Update existing product
- `DELETE /api/products/:id` - Remove product

### Cart
- `GET /api/cart` - View current cart contents
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `POST /api/cart/checkout` - Process checkout

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/orders` - View order history

## Implemented Categories

- Accessories
- Bags
- Books
- Clothing
- Comfort
- Electronics
- Organization
- Safety
- Wildlife

## Development Team

- Ritesh Malik
- Ian Ayala 
- Holden Walz

## Future Enhancements

- Payment gateway integration
- User reviews and ratings
- Wishlist functionality
- Email order confirmations
- Advanced filtering and sorting options
- Admin dashboard for inventory management

## License

This project is licensed under the MIT License.
