// Cart routes for managing shopping cart and checkout

const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// Get cart contents
router.get('/', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get cart items with product details
    const cartItems = await db.all(
      `SELECT c.id, c.quantity, c.product_id, p.name, p.price, p.image_url, p.stock_quantity
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product exists and has enough stock
    const product = await db.get(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Check if product is already in cart
    const existingCartItem = await db.get(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
      
      await db.run(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existingCartItem.id]
      );
      
      return res.json({
        message: 'Cart updated successfully',
        itemId: existingCartItem.id,
        quantity: newQuantity
      });
    } else {
      // Add new item to cart
      const result = await db.run(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
      
      res.status(201).json({
        message: 'Item added to cart',
        itemId: result.id,
        quantity
      });
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/:id', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.id;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    // Check if cart item exists and belongs to user
    const cartItem = await db.get(
      'SELECT c.*, p.stock_quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?',
      [itemId, userId]
    );
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Check if quantity exceeds stock
    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Update quantity
    await db.run(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    );
    
    res.json({
      message: 'Cart updated successfully',
      itemId,
      quantity
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:id', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.id;
    
    // Check if cart item exists and belongs to user
    const cartItem = await db.get(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Remove item
    await db.run(
      'DELETE FROM cart WHERE id = ?',
      [itemId]
    );
    
    res.json({
      message: 'Item removed from cart',
      itemId
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process checkout
router.post('/checkout', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get cart items with product details
    const cartItems = await db.all(
      `SELECT c.id, c.quantity, c.product_id, p.name, p.price, p.stock_quantity
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check stock for all items
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.name}. Available: ${item.stock_quantity}`
        });
      }
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Start transaction
    db.db.serialize(() => {
      db.db.run('BEGIN TRANSACTION');
      
      try {
        // Create order
        db.db.run(
          'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
          [userId, total, 'completed'],
          function(err) {
            if (err) {
              db.db.run('ROLLBACK');
              return res.status(500).json({ message: 'Checkout failed' });
            }
            
            const orderId = this.lastID;
            
            // Add order items
            const stmt = db.db.prepare(
              'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)'
            );
            
            for (const item of cartItems) {
              stmt.run(orderId, item.product_id, item.quantity, item.price);
              
              // Update product stock
              db.db.run(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
              );
            }
            
            stmt.finalize();
            
            // Clear cart
            db.db.run('DELETE FROM cart WHERE user_id = ?', [userId]);
            
            // Commit transaction
            db.db.run('COMMIT');
            
            res.json({
              message: 'Order placed successfully',
              orderId,
              total
            });
          }
        );
      } catch (error) {
        db.db.run('ROLLBACK');
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Checkout failed' });
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;