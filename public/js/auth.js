// Authentication related functionality

document.addEventListener('DOMContentLoaded', () => {
    // Register form handling
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
          createAlert('Passwords do not match', 'danger');
          return;
        }
        
        // Validate password length
        if (password.length < 8) {
          createAlert('Password must be at least 8 characters long', 'danger');
          return;
        }
        
        try {
          // Send registration request
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          
          // Show success message
          createAlert('Registration successful! Redirecting to login page...', 'success');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          
        } catch (error) {
          console.error('Registration error:', error);
          createAlert(error.message, 'danger');
        }
      });
    }
    
    // Login form handling
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          // Send login request
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }
          
          // Show success message
          createAlert('Login successful! Redirecting...', 'success');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
          
        } catch (error) {
          console.error('Login error:', error);
          createAlert(error.message, 'danger');
        }
      });
    }
    
    // Logout handling
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        try {
          const response = await fetch('/api/auth/logout');
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
          }
          
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
          createAlert(error.message, 'danger');
        }
      });
    }
    
    // Helper function to create alerts
    function createAlert(message, type = 'success') {
      const alertContainer = document.querySelector('.alert-container');
      if (!alertContainer) return;
      
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.textContent = message;
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => alertDiv.remove();
      
      alertDiv.appendChild(closeBtn);
      alertContainer.innerHTML = '';
      alertContainer.appendChild(alertDiv);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }
  });