const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../data/database');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const emailTemplates = require('../utils/emailTemplates');

// Set SendGrid API key from environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will not work.');
}

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Send welcome email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY && process.env.SENDER_EMAIL) {
      try {
        const template = emailTemplates.welcome(name);
        const msg = {
          to: email,
          from: process.env.SENDER_EMAIL,
          subject: template.subject,
          text: template.text,
          html: template.html
        };
        
        await sgMail.send(msg);
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't return error to client, still allow registration
      }
    }

    res.status(201).json({ message: 'User created successfully', userId: result.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session.isAuthenticated) {
    res.json({
      isAuthenticated: true,
      user: req.session.user
    });
  } else {
    res.json({
      isAuthenticated: false
    });
  }
});

// Logout user
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Reset password request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    // For security reasons, always return success even if the user doesn't exist
    res.json({ message: 'If your email exists in our system, you will receive a password reset link shortly.' });
    
    // Only proceed with email sending if user exists and SendGrid is configured
    if (user && process.env.SENDGRID_API_KEY && process.env.SENDER_EMAIL) {
      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Check if reset_tokens table exists, if not create it
      await db.run(`
        CREATE TABLE IF NOT EXISTS reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      
      // Store the token in the database
      await db.run(
        'INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, resetToken, tokenExpiry.toISOString()]
      );
      
      // Base URL - get from environment or fallback
      const baseUrl = process.env.BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://your-glitch-project-name.glitch.me' 
          : 'http://localhost:3000');
      
      // Reset link URL
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      
      // Send email with SendGrid
      try {
        const template = emailTemplates.passwordReset(resetUrl);
        const msg = {
          to: email,
          from: process.env.SENDER_EMAIL,
          subject: template.subject,
          text: template.text,
          html: template.html
        };
        
        await sgMail.send(msg);
        console.log('Password reset email sent successfully');
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Don't reveal error to client for security reasons
      }
    }
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Find the token in the database
    const tokenRecord = await db.get(
      'SELECT * FROM reset_tokens WHERE token = ? AND expires_at > datetime("now")',
      [token]
    );
    
    if (!tokenRecord) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, tokenRecord.user_id]
    );
    
    // Delete the used token
    await db.run('DELETE FROM reset_tokens WHERE id = ?', [tokenRecord.id]);
    
    // Send confirmation email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY && process.env.SENDER_EMAIL) {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [tokenRecord.user_id]);
      
      if (user) {
        try {
          const template = emailTemplates.passwordResetSuccess(user.name);
          const msg = {
            to: user.email,
            from: process.env.SENDER_EMAIL,
            subject: template.subject,
            text: template.text,
            html: template.html
          };
          
          await sgMail.send(msg);
          console.log('Password reset confirmation email sent successfully');
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // We still continue with the success response
        }
      }
    }
    
    res.json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;