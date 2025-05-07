# Travel Essentials E-Commerce Website

A complete e-commerce platform for a travel essentials store built with Node.js, Express.js, and SQLite. This project includes all the essential features of an online shopping experience, including product browsing, user authentication, cart management, and checkout processes.

## Team Members
- Ritesh Ritesh
- Ian Ayala
- Holden Walz

## Features

- **Responsive Design**: Mobile-friendly UI that works on all devices
- **User Authentication**: Secure login/registration system with password hashing
- **Product Catalog**: Browsable and searchable product listings
- **Shopping Cart**: Add, remove, and update items in your cart
- **User Profiles**: View and edit account information and order history
- **Checkout Process**: Simple and secure checkout flow
- **Admin Panel**: Manage products, orders, and users (admin functionality)

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (local database)
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Authentication**: Session-based with bcrypt password hashing
- **Version Control**: Git/GitHub

## Project Structure

```
travel-essentials/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── cart.js
│   │   ├── main.js
│   │   └── validation.js
│   ├── images/
│   │   └── products/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── product.html
│   ├── search.html
│   ├── cart.html
│   ├── profile.html
│   ├── about.html
│   ├── faq.html
│   ├── 404.html
│   └── 500.html
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── users.js
│   └── cart.js
├── data/
│   ├── database.js
│   ├── seed.js
│   └── database.sqlite
├── app.js
├── package.json
└── README.md
```

## Installation & Setup

1. Clone the repository
   ```
   git clone https://github.com/ianayala01/term-project-CSC317.git
   cd term-project-CSC317
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Initialize the database
   ```
   npm run seed
   ```

4. Start the server
   ```
   npm start
   ```

5. Visit `http://localhost:3000` in your web browser

## Sample Data

The database is pre-seeded with:

- 12 travel and lifestyle products across different categories
- A test user account:
  - Email: test@example.com
  - Password: password123

## API Endpoints

### Authentication
- POST /api/auth/register - Create a new user account
- POST /api/auth/login - Log in to existing account
- GET /api/auth/logout - Log out of current session
- GET /api/auth/status - Check authentication status

### Products
- GET /api/products - Get all products or filter by category
- GET /api/products/:id - Get a specific product by ID
- GET /api/products/search - Search for products by query
- GET /api/products/featured - Get featured products for homepage
- GET /api/products/categories - Get list of all product categories

### Cart
- GET /api/cart - Get current cart contents
- POST /api/cart - Add item to cart
- PUT /api/cart/:id - Update cart item quantity
- DELETE /api/cart/:id - Remove item from cart
- POST /api/cart/checkout - Process checkout

### User Profile
- GET /api/users/profile - Get user profile information
- PUT /api/users/profile - Update user profile
- GET /api/users/orders - Get user order history

## Deployment

The project can be deployed to various platforms:

- **Glitch**: For quick and easy hosting
- **Heroku**: For more scalable deployment
- **AWS/DigitalOcean**: For production environments

## Future Enhancements

- Payment gateway integration (Stripe/PayPal)
- Product reviews and ratings
- Wishlist functionality
- Email notifications
- Advanced search filters
- Admin dashboard for inventory management

## License

This project is licensed under the MIT License - see the LICENSE file for details.
