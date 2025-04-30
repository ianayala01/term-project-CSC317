// Product routes for fetching and searching products

const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Get category filter if present
    const category = req.query.category;
    
    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) as total FROM products';
    let params = [];
    
    // Apply category filter if present
    if (category) {
      query += ' WHERE category = ?';
      countQuery += ' WHERE category = ?';
      params.push(category);
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Get products and total count
    const products = await db.all(query, params);
    const totalResult = await db.get(countQuery, category ? [category] : []);
    const total = totalResult.total;
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      products,
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

// Get featured products for homepage
router.get('/featured', async (req, res) => {
  try {
    // Get a random selection of products to feature
    const products = await db.all('SELECT * FROM products ORDER BY RANDOM() LIMIT 6');
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(categories.map(row => row.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search for products
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search in name and description
    const searchTerm = `%${query}%`;
    const products = await db.all(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm]
    );
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;