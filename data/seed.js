// Seed the database with initial data

const db = require('./database');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    await db.init();
    
    // Check if products already exist
    const existingProducts = await db.all('SELECT * FROM products LIMIT 1');
    if (existingProducts.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed products
    const products = [
      {
        name: 'Compact Travel Backpack',
        description: 'Lightweight, water-resistant backpack with multiple compartments and laptop sleeve. Perfect for day trips or as a carry-on bag.',
        price: 79.99,
        image_url: '/images/products/backpack.jpg',
        category: 'Bags',
        stock_quantity: 50
      },
      {
        name: 'Portable Power Bank',
        description: '20000mAh high-capacity portable charger with dual USB ports and fast charging capability. Keep your devices powered on your longest adventures.',
        price: 45.99,
        image_url: '/images/products/power-bank.jpg',
        category: 'Electronics',
        stock_quantity: 100
      },
      {
        name: 'Noise-Canceling Headphones',
        description: 'Wireless Bluetooth headphones with active noise cancellation. Perfect for noisy planes, trains, or busy cafes.',
        price: 129.99,
        image_url: '/images/products/headphones.jpg',
        category: 'Electronics',
        stock_quantity: 30
      },
      {
        name: 'Travel Toiletry Kit',
        description: 'Compact toiletry organizer with multiple compartments and waterproof lining. Includes TSA-approved bottles.',
        price: 24.99,
        image_url: '/images/products/toiletry-kit.jpg',
        category: 'Accessories',
        stock_quantity: 75
      },
      {
        name: 'Eco-Friendly Water Bottle',
        description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Helps reduce plastic waste while traveling.',
        price: 29.99,
        image_url: '/images/products/water-bottle.jpg',
        category: 'Accessories',
        stock_quantity: 80
      },
      {
        name: 'Universal Travel Adapter',
        description: 'All-in-one adapter compatible with outlets in over 150 countries. Features 4 USB ports and one USB-C port.',
        price: 34.99,
        image_url: '/images/products/adapter.jpg',
        category: 'Electronics',
        stock_quantity: 60
      },
      {
        name: 'Travel Neck Pillow',
        description: 'Memory foam neck pillow with adjustable support. Compresses down to 1/4 of its size for easy packing.',
        price: 19.99,
        image_url: '/images/products/neck-pillow.jpg',
        category: 'Comfort',
        stock_quantity: 90
      },
      {
        name: 'Packing Cubes Set',
        description: 'Set of 6 lightweight packing cubes to organize your luggage. Different sizes for clothes, accessories, and toiletries.',
        price: 27.99,
        image_url: '/images/products/packing-cubes.jpg',
        category: 'Organization',
        stock_quantity: 65
      },
      {
        name: 'Lightweight Travel Journal',
        description: 'A5 size travel journal with waterproof cover, elastic closure, and inner pocket. 240 pages of premium paper.',
        price: 15.99,
        image_url: '/images/products/journal.jpg',
        category: 'Accessories',
        stock_quantity: 40
      },
      {
        name: 'Digital Luggage Scale',
        description: 'Compact digital scale to weigh your luggage before flights. Avoid overweight baggage fees!',
        price: 12.99,
        image_url: '/images/products/luggage-scale.jpg',
        category: 'Accessories',
        stock_quantity: 55
      },
      {
        name: 'Compact Rain Jacket',
        description: 'Ultralight, packable rain jacket that folds into its own pocket. Waterproof and breathable for all weather conditions.',
        price: 49.99,
        image_url: '/images/products/rain-jacket.jpg',
        category: 'Clothing',
        stock_quantity: 35
      },
      {
        name: 'Local City Guidebook',
        description: 'Curated travel guides written by locals with hidden gems, neighborhood walks, and authentic food recommendations.',
        price: 18.99,
        image_url: '/images/products/guidebook.jpg',
        category: 'Books',
        stock_quantity: 25
      }
    ];

    for (const product of products) {
      await db.run(
        `INSERT INTO products (name, description, price, image_url, category, stock_quantity) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.name, product.description, product.price, product.image_url, product.category, product.stock_quantity]
      );
    }

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      ['Test User', 'test@example.com', hashedPassword]
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run the seeder
seedDatabase();

module.exports = seedDatabase;