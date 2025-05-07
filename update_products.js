// Script to update the database with all 18 products

const db = require('./data/database');

const additionalProducts = [
  {
    name: 'Portable Travel Stove',
    description: 'Compact and lightweight camping stove perfect for outdoor adventures. Folds up easily and takes minimal space in your backpack.',
    price: 60.99,
    image_url: '/images/products/travel-stove.jpg',
    category: 'Wildlife',
    stock_quantity: 40
  },
  {
    name: 'First Aid Kit',
    description: 'Comprehensive first aid kit with 100+ essential items for treating common injuries during travel. Comes in a waterproof case.',
    price: 19.00,
    image_url: '/images/products/first-aid.jpg',
    category: 'Safety',
    stock_quantity: 60
  },
  {
    name: 'Travel Pocket Knife',
    description: 'Multi-purpose pocket knife with 12 tools including scissors, bottle opener, and screwdriver. Perfect for camping and everyday carry.',
    price: 17.99,
    image_url: '/images/products/pocket-knife.jpg',
    category: 'Safety',
    stock_quantity: 45
  },
  {
    name: 'Magnetic Compass',
    description: 'Professional-grade magnetic compass with luminous dial for navigation in all conditions. Waterproof and impact-resistant.',
    price: 45.00,
    image_url: '/images/products/magnetic-compass.jpg',
    category: 'Electronics',
    stock_quantity: 30
  },
  {
    name: 'Heated Travel Blanket',
    description: 'USB-powered heated blanket that perfect for cold plane cabins, camping, or road trips. Three heat settings and auto shut-off feature.',
    price: 90.00,
    image_url: '/images/products/heated-blanket.jpg',
    category: 'Comfort',
    stock_quantity: 25
  },
  {
    name: 'Anti-Slip Travel Shoes',
    description: 'Lightweight, water-resistant shoes with superior grip for various terrains. Foldable design makes them easy to pack.',
    price: 30.00,
    image_url: '/images/products/travel-shoes.jpg',
    category: 'Clothing',
    stock_quantity: 40
  }
];

async function updateDatabase() {
  try {
    // Initialize database
    await db.init();
    
    console.log('Adding additional products to database...');
    
    // Insert each additional product
    for (const product of additionalProducts) {
      await db.run(
        `INSERT INTO products (name, description, price, image_url, category, stock_quantity) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.name, product.description, product.price, product.image_url, product.category, product.stock_quantity]
      );
      console.log(`Added product: ${product.name}`);
    }
    
    console.log('Database update completed successfully!');
    
    // Check total product count
    const count = await db.get('SELECT COUNT(*) as count FROM products');
    console.log(`Total products in database: ${count.count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

// Run the update
updateDatabase();