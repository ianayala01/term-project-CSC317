// Product routes for fetching and searching products with mock data

const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Mock product data for development
const mockProducts = [
  { id: 1, name: 'Compact Travel Backpack', category: 'Bags', price: 79.99, image_url: '/images/products/backpack.jpg', description: 'Lightweight, water-resistant backpack with multiple compartments and laptop sleeve. Perfect for day trips or as a carry-on bag.', stock_quantity: 50 },
  { id: 2, name: 'Portable Power Bank', category: 'Electronics', price: 45.99, image_url: '/images/products/power-bank.jpg', description: '20000mAh high-capacity portable charger with dual USB ports and fast charging capability. Keep your devices powered on your longest adventures.', stock_quantity: 100 },
  { id: 3, name: 'Noise-Canceling Headphones', category: 'Electronics', price: 129.99, image_url: '/images/products/headphones.jpg', description: 'Wireless Bluetooth headphones with active noise cancellation. Perfect for noisy planes, trains, or busy cafes.', stock_quantity: 30 },
  { id: 4, name: 'Travel Toiletry Kit', category: 'Accessories', price: 24.99, image_url: '/images/products/toiletry-kit.jpg', description: 'Compact toiletry organizer with multiple compartments and waterproof lining. Includes TSA-approved bottles.', stock_quantity: 75 },
  { id: 5, name: 'Eco-Friendly Water Bottle', category: 'Accessories', price: 29.99, image_url: '/images/products/water-bottle.jpg', description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Helps reduce plastic waste while traveling.', stock_quantity: 80 },
  { id: 6, name: 'Universal Travel Adapter', category: 'Electronics', price: 34.99, image_url: '/images/products/adapter.jpg', description: 'All-in-one adapter compatible with outlets in over 150 countries. Features 4 USB ports and one USB-C port.', stock_quantity: 60 },
  { id: 7, name: 'Travel Neck Pillow', category: 'Comfort', price: 19.99, image_url: '/images/products/neck-pillow.jpg', description: 'Memory foam neck pillow with adjustable support. Compresses down to 1/4 of its size for easy packing.', stock_quantity: 90 },
  { id: 8, name: 'Packing Cubes Set', category: 'Organization', price: 27.99, image_url: '/images/products/packing-cubes.jpg', description: 'Set of 6 lightweight packing cubes to organize your luggage. Different sizes for clothes, accessories, and toiletries.', stock_quantity: 65 },
  { id: 9, name: 'Lightweight Travel Journal', category: 'Accessories', price: 15.99, image_url: '/images/products/journal.jpg', description: 'A5 size travel journal with waterproof cover, elastic closure, and inner pocket. 240 pages of premium paper.', stock_quantity: 40 },
  { id: 10, name: 'Digital Luggage Scale', category: 'Accessories', price: 12.99, image_url: '/images/products/luggage-scale.jpg', description: 'Compact digital scale to weigh your luggage before flights. Avoid overweight baggage fees!', stock_quantity: 55 },
  { id: 11, name: 'Compact Rain Jacket', category: 'Clothing', price: 49.99, image_url: '/images/products/rain-jacket.jpg', description: 'Ultralight, packable rain jacket that folds into its own pocket. Waterproof and breathable for all weather conditions.', stock_quantity: 35 },
  { id: 12, name: 'Local City Guidebook', category: 'Books', price: 18.99, image_url: '/images/products/guidebook.jpg', description: 'Curated travel guides written by locals with hidden gems, neighborhood walks, and authentic food recommendations.', stock_quantity: 25 },
  { id: 13, name: 'Portable Travel Stove', category: 'Wildlife', price: 60.99, image_url: '/images/products/travel-stove.jpg', description: 'Compact and lightweight camping stove perfect for outdoor adventures. Folds up easily and takes minimal space in your backpack.', stock_quantity: 40 },
  { id: 14, name: 'First Aid Kit', category: 'Safety', price: 19.00, image_url: '/images/products/first-aid.jpg', description: 'Comprehensive first aid kit with 100+ essential items for treating common injuries during travel. Comes in a waterproof case.', stock_quantity: 60 },
  { id: 15, name: 'Travel Pocket Knife', category: 'Safety', price: 17.99, image_url: '/images/products/pocket-knife.jpg', description: 'Multi-purpose pocket knife with 12 tools including scissors, bottle opener, and screwdriver. Perfect for camping and everyday carry.', stock_quantity: 45 },
  { id: 16, name: 'Magnetic Compass', category: 'Electronics', price: 45.00, image_url: '/images/products/magnetic-compass.jpg', description: 'Professional-grade magnetic compass with luminous dial for navigation in all conditions. Waterproof and impact-resistant.', stock_quantity: 30 },
  { id: 17, name: 'Heated Travel Blanket', category: 'Comfort', price: 90.00, image_url: '/images/products/heated-blanket.jpg', description: 'USB-powered heated blanket that perfect for cold plane cabins, camping, or road trips. Three heat settings and auto shut-off feature.', stock_quantity: 25 },
  { id: 18, name: 'Anti-Slip Travel Shoes', category: 'Clothing', price: 30.00, image_url: '/images/products/travel-shoes.jpg', description: 'Lightweight, water-resistant shoes with superior grip for various terrains. Foldable design makes them easy to pack.', stock_quantity: 40 }
];

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    console.log('Request received for products with params:', req.query);
    
    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = (page - 1) * limit;
    
    // Get filters
    const category = req.query.category;
    const minPrice = parseFloat(req.query.min_price) || 0;
    const maxPrice = parseFloat(req.query.max_price) || 1000;
    const sortBy = req.query.sort || 'default';
    
    console.log('Filtering by:', { category, minPrice, maxPrice, sortBy });
    
    // Build query
    let query = 'SELECT * FROM products WHERE price >= ? AND price <= ?';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE price >= ? AND price <= ?';
    let params = [minPrice, maxPrice];
    
    // Apply category filter if present
    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'name-asc':
        query += ' ORDER BY name ASC';
        break;
      case 'name-desc':
        query += ' ORDER BY name DESC';
        break;
      default:
        query += ' ORDER BY id ASC';
        break;
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    console.log('Database query:', query);
    console.log('Database params:', params);
    
    // Get products from database
    let dbProducts = [];
    try {
      dbProducts = await db.all(query, params);
      console.log('Database products count:', dbProducts.length);
    } catch (dbError) {
      console.log('Database error:', dbError.message);
    }
    
    // IMPORTANT: Use database products ONLY - no mock products
    let allProducts = dbProducts;
    
    console.log('Total products count:', allProducts.length);
    
    // Paginate products
    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, allProducts.length);
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    const total = allProducts.length;
    const totalPages = Math.ceil(total / limit);
    
    console.log('Final products count being sent:', paginatedProducts.length);
    
    res.json({
      products: paginatedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search for products
router.get('/search', async (req, res) => {
  try {
    console.log('Search request received with params:', req.query);
    
    const query = req.query.query;
    const category = req.query.category;
    const minPrice = parseFloat(req.query.min_price) || 0;
    const maxPrice = parseFloat(req.query.max_price) || 1000;
    const sortBy = req.query.sort || 'default';
    
    console.log('Searching for:', { query, category, minPrice, maxPrice, sortBy });
    
    if (!query && !category) {
      return res.status(400).json({ message: 'Search query or category is required' });
    }
    
    // Build query
    let sqlQuery = 'SELECT * FROM products WHERE (name LIKE ? OR description LIKE ?) AND price >= ? AND price <= ?';
    let params = [`%${query || ''}%`, `%${query || ''}%`, minPrice, maxPrice];
    
    // Apply category filter if present
    if (category) {
      sqlQuery += ' AND category = ?';
      params.push(category);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        sqlQuery += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        sqlQuery += ' ORDER BY price DESC';
        break;
      case 'name-asc':
        sqlQuery += ' ORDER BY name ASC';
        break;
      case 'name-desc':
        sqlQuery += ' ORDER BY name DESC';
        break;
      default:
        sqlQuery += ' ORDER BY id ASC';
        break;
    }
    
    console.log('Database search query:', sqlQuery);
    console.log('Database search params:', params);
    
    // Get products from database
    let dbProducts = [];
    try {
      dbProducts = await db.all(sqlQuery, params);
      console.log('Database search results count:', dbProducts.length);
    } catch (dbError) {
      console.log('Database error:', dbError.message);
    }
    
    // IMPORTANT: Use database products ONLY - no mock products
    let allProducts = dbProducts;
    
    console.log('Final search results count being sent:', allProducts.length);
    
    res.json(allProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    console.log('Categories request received');
    
    // Get categories from database
    let dbCategories = [];
    try {
      const categories = await db.all('SELECT DISTINCT category FROM products ORDER BY category');
      dbCategories = categories.map(row => row.category);
      console.log('Database categories count:', dbCategories.length);
    } catch (dbError) {
      console.log('Database error:', dbError.message);
    }
    
    // IMPORTANT: Use database categories ONLY - no mock categories
    let allCategories = dbCategories;
    
    console.log('All categories count:', allCategories.length);
    console.log('All categories:', allCategories);
    
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log('Product details request for ID:', productId);
    
    // Check database for product
    let product = null;
    try {
      product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
      console.log('Database product found:', product ? 'Yes' : 'No');
    } catch (dbError) {
      console.log('Database error:', dbError.message);
    }
    
    // If not found in database, check mock data
    if (!product) {
      product = mockProducts.find(p => p.id === productId);
      console.log('Mock product found:', product ? 'Yes' : 'No');
    }
    
    if (!product) {
      console.log('Product not found anywhere');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Returning product:', product.name);
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new product with duplicate checking
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock_quantity } = req.body;
    
    // Validate input
    if (!name || !description || !price || !image_url || !category || !stock_quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if product with same name already exists
    const existingProduct = await db.get('SELECT * FROM products WHERE name = ?', [name]);
    if (existingProduct) {
      return res.status(409).json({ message: 'Product with this name already exists' });
    }
    
    // Insert new product
    const result = await db.run(
      `INSERT INTO products (name, description, price, image_url, category, stock_quantity) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, image_url, category, stock_quantity]
    );
    
    // Get the newly created product
    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.id]);
    
    console.log(`New product added: ${name} (ID: ${result.id})`);
    
    res.status(201).json({ 
      message: 'Product added successfully',
      product: newProduct 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an existing product
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, description, price, image_url, category, stock_quantity } = req.body;
    
    // Check if product exists
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if name is being changed and if new name already exists
    if (name && name !== existingProduct.name) {
      const productWithSameName = await db.get('SELECT * FROM products WHERE name = ? AND id != ?', [name, productId]);
      if (productWithSameName) {
        return res.status(409).json({ message: 'Another product with this name already exists' });
      }
    }
    
    // Update product
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (price) {
      updates.push('price = ?');
      params.push(price);
    }
    
    if (image_url) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    
    if (stock_quantity !== undefined) {
      updates.push('stock_quantity = ?');
      params.push(stock_quantity);
    }
    
    // Add product ID to params
    params.push(productId);
    
    // Execute update query
    await db.run(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Get updated product
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    
    console.log(`Product updated: ${updatedProduct.name} (ID: ${productId})`);
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Check if product exists
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product
    await db.run('DELETE FROM products WHERE id = ?', [productId]);
    
    console.log(`Product deleted: ${existingProduct.name} (ID: ${productId})`);
    
    res.json({
      message: 'Product deleted successfully',
      productId
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;