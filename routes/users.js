// User routes for profile management and order history

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../data/database');

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// Get current user profile
router.get('/profile', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await db.get(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Get current user data
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Update basic info
    if (name || email) {
      const updates = [];
      const params = [];
      
      if (name) {
        updates.push('name = ?');
        params.push(name);
      }
      
      if (email) {
        // Check if email is already in use by another user
        const existingUser = await db.get(
          'SELECT * FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );
        
        if (existingUser) {
          return res.status(409).json({ message: 'Email already in use' });
        }
        
        updates.push('email = ?');
        params.push(email);
      }
      
      params.push(userId);
      
      await db.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      // Update session data
      if (name) req.session.user.name = name;
      if (email) req.session.user.email = email;
    }
    
    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: req.session.user.name,
        email: req.session.user.email
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user order history
router.get('/orders', isAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get all orders
    const orders = await db.all(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    
    // Get order items for each order
    for (const order of orders) {
      const items = await db.all(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;