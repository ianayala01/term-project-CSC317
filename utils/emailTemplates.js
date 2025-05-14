// utils/emailTemplates.js

const getBaseEmailTemplate = (content) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4a6ee0;">Travel<span style="color: #333;">Essentials</span></h2>
      </div>
      ${content}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e4e4e4; font-size: 12px; color: #666;">
        <p>This is a project for San Francisco State University. Contact: ritesh@sfsu.edu</p>
        <p>1600 Holloway Ave, San Francisco, CA 94132</p>
      </div>
    </div>
  `;
};

const emailTemplates = {
  welcome: (name) => {
    const content = `
      <p>Hello ${name},</p>
      <p>Welcome to Travel Essentials! Your account has been created successfully.</p>
      <p>Start exploring our products to enhance your travel experience.</p>
      <p style="text-align: center; margin: 25px 0;">
        <a href="http://localhost:3000/search" style="display: inline-block; background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Start Shopping
        </a>
      </p>
      <p>Best regards,<br>Travel Essentials Team</p>
    `;
    return {
      subject: 'Welcome to Travel Essentials!',
      html: getBaseEmailTemplate(content),
      text: `Hello ${name}, welcome to Travel Essentials! Your account has been created successfully.`
    };
  },
  
  passwordReset: (resetUrl) => {
    const content = `
      <p>Hello,</p>
      <p>You requested a password reset for your Travel Essentials account.</p>
      <p>Please click the button below to reset your password:</p>
      <p style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>Travel Essentials Team</p>
    `;
    return {
      subject: 'Travel Essentials - Password Reset Request',
      html: getBaseEmailTemplate(content),
      text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`
    };
  },
  
  passwordResetSuccess: (name) => {
    const content = `
      <p>Hello ${name},</p>
      <p>Your password has been successfully reset.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>Best regards,<br>Travel Essentials Team</p>
    `;
    return {
      subject: 'Travel Essentials - Password Reset Successful',
      html: getBaseEmailTemplate(content),
      text: `Your password has been successfully reset. If you did not make this change, please contact support immediately.`
    };
  },
  
  orderConfirmation: (name, orderNumber, items, total) => {
    let itemsList = '';
    items.forEach(item => {
      itemsList += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
      `;
    });
    
    const content = `
      <p>Hello ${name},</p>
      <p>Thank you for your order! Your order #${orderNumber} has been confirmed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: center;">Quantity</th>
          <th style="padding: 10px; text-align: right;">Price</th>
        </tr>
        ${itemsList}
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">$${total.toFixed(2)}</td>
        </tr>
      </table>
      
      <p>We hope you enjoy your travel essentials!</p>
      <p>Best regards,<br>Travel Essentials Team</p>
    `;
    
    return {
      subject: 'Travel Essentials - Order Confirmation',
      html: getBaseEmailTemplate(content),
      text: `Hello ${name}, thank you for your order! Your order #${orderNumber} has been confirmed. Total: $${total.toFixed(2)}`
    };
  }
};

module.exports = emailTemplates;