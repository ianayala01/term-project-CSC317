// Cart functionality - handles local cart management

class Cart {
    constructor() {
      this.items = [];
      this.total = 0;
      this.api = '/api/cart';
      
      // DOM Elements
      this.cartCountElement = document.querySelector('.cart-count');
      this.cartItemsElement = document.querySelector('.cart-items');
      this.cartTotalElement = document.querySelector('.cart-total');
      this.checkoutButton = document.querySelector('.checkout-button');
      
      // Initialize cart
      this.init();
    }
    
    // Initialize cart
    async init() {
      try {
        // Check authentication status
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (authData.isAuthenticated) {
          // User is logged in, fetch cart from server
          await this.fetchCart();
        } else {
          // User is not logged in, check local storage for cart
          this.loadLocalCart();
        }
        
        // Update cart UI
        this.updateCartUI();
        
        // Set up event listeners
        this.setupEventListeners();
      } catch (error) {
        console.error('Cart initialization error:', error);
      }
    }
    
    // Fetch cart from server (for logged in users)
    async fetchCart() {
      try {
        const response = await fetch(this.api);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        
        const data = await response.json();
        
        this.items = data.items;
        this.total = data.total;
      } catch (error) {
        console.error('Fetch cart error:', error);
      }
    }
    
    // Load cart from local storage (for non-logged in users)
    loadLocalCart() {
      const localCart = localStorage.getItem('cart');
      
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          this.items = parsedCart.items || [];
          this.calculateTotal();
        } catch (error) {
          console.error('Parse local cart error:', error);
          this.items = [];
          this.total = 0;
        }
      }
    }
    
    // Save cart to local storage
    saveLocalCart() {
      localStorage.setItem('cart', JSON.stringify({
        items: this.items,
        total: this.total
      }));
    }
    
    // Calculate cart total
    calculateTotal() {
      this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // Add item to cart
    async addItem(productId, quantity = 1) {
      try {
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (authData.isAuthenticated) {
          // User is logged in, add to server cart
          const response = await fetch(this.api, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add item to cart');
          }
          
          // Refresh cart
          await this.fetchCart();
        } else {
          // User is not logged in, add to local cart
          
          // First fetch product details
          const productResponse = await fetch(`/api/products/${productId}`);
          
          if (!productResponse.ok) {
            throw new Error('Failed to fetch product details');
          }
          
          const product = await productResponse.json();
          
          // Check if product already exists in cart
          const existingItemIndex = this.items.findIndex(item => item.product_id === productId);
          
          if (existingItemIndex !== -1) {
            // Update quantity
            this.items[existingItemIndex].quantity += quantity;
          } else {
            // Add new item
            this.items.push({
              id: Date.now(), // Temporary ID for local cart
              product_id: productId,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              quantity: quantity,
              stock_quantity: product.stock_quantity
            });
          }
          
          // Recalculate total
          this.calculateTotal();
          
          // Save to local storage
          this.saveLocalCart();
        }
        
        // Update UI
        this.updateCartUI();
        
        return true;
      } catch (error) {
        console.error('Add item error:', error);
        return false;
      }
    }
    
    // Update item quantity
    async updateItemQuantity(itemId, quantity) {
      try {
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (authData.isAuthenticated) {
          // User is logged in, update server cart
          const response = await fetch(`${this.api}/${itemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update cart');
          }
          
          // Refresh cart
          await this.fetchCart();
        } else {
          // User is not logged in, update local cart
          const itemIndex = this.items.findIndex(item => item.id === itemId);
          
          if (itemIndex !== -1) {
            this.items[itemIndex].quantity = quantity;
            
            // Recalculate total
            this.calculateTotal();
            
            // Save to local storage
            this.saveLocalCart();
          }
        }
        
        // Update UI
        this.updateCartUI();
        
        return true;
      } catch (error) {
        console.error('Update quantity error:', error);
        return false;
      }
    }
    
    // Remove item from cart
    async removeItem(itemId) {
      try {
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (authData.isAuthenticated) {
          // User is logged in, remove from server cart
          const response = await fetch(`${this.api}/${itemId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove item');
          }
          
          // Refresh cart
          await this.fetchCart();
        } else {
          // User is not logged in, remove from local cart
          this.items = this.items.filter(item => item.id !== itemId);
          
          // Recalculate total
          this.calculateTotal();
          
          // Save to local storage
          this.saveLocalCart();
        }
        
        // Update UI
        this.updateCartUI();
        
        return true;
      } catch (error) {
        console.error('Remove item error:', error);
        return false;
      }
    }
    
    // Process checkout
    async checkout() {
      try {
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (!authData.isAuthenticated) {
          // Redirect to login page if not authenticated
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return false;
        }
        
        // Process checkout on server
        const response = await fetch(`${this.api}/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Checkout failed');
        }
        
        const result = await response.json();
        
        // Clear local cart
        this.items = [];
        this.total = 0;
        localStorage.removeItem('cart');
        
        // Update UI
        this.updateCartUI();
        
        return result;
      } catch (error) {
        console.error('Checkout error:', error);
        return false;
      }
    }
    
    // Update cart UI
    updateCartUI() {
      // Update cart count
      if (this.cartCountElement) {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCountElement.textContent = totalItems;
        
        if (totalItems > 0) {
          this.cartCountElement.style.display = 'flex';
        } else {
          this.cartCountElement.style.display = 'none';
        }
      }
      
      // Update cart items
      if (this.cartItemsElement) {
        // Clear existing items
        this.cartItemsElement.innerHTML = '';
        
        if (this.items.length === 0) {
          // Show empty cart message
          this.cartItemsElement.innerHTML = `
            <div class="cart-empty">
              <p>Your cart is empty.</p>
              <a href="/" class="btn">Continue Shopping</a>
            </div>
          `;
          
          // Hide checkout button
          if (this.checkoutButton) {
            this.checkoutButton.style.display = 'none';
          }
          
          return;
        }
        
        // Add items to cart UI
        this.items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.className = 'cart-item';
          
          itemElement.innerHTML = `
            <div class="cart-item-img">
              <img src="${item.image_url}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
              <h3>${item.name}</h3>
            </div>
            <div class="cart-item-price">${parseFloat(item.price).toFixed(2)}</div>
            <div class="cart-item-quantity">
              <button class="decrease-quantity" data-item-id="${item.id}">-</button>
              <input type="number" value="${item.quantity}" min="1" max="${item.stock_quantity}" data-item-id="${item.id}">
              <button class="increase-quantity" data-item-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
            <div class="cart-item-remove">
              <button class="btn-danger remove-item" data-item-id="${item.id}">Remove</button>
            </div>
          `;
          
          this.cartItemsElement.appendChild(itemElement);
        });
        
        // Update cart total
        if (this.cartTotalElement) {
          this.cartTotalElement.textContent = `${this.total.toFixed(2)}`;
        }
        
        // Show checkout button
        if (this.checkoutButton) {
          this.checkoutButton.style.display = 'block';
        }
        
        // Set up event listeners for cart item buttons
        this.setupCartItemEvents();
      }
    }
    
    // Set up event listeners for cart item buttons
    setupCartItemEvents() {
      // Increase quantity
      const increaseButtons = document.querySelectorAll('.increase-quantity');
      increaseButtons.forEach(button => {
        button.addEventListener('click', () => {
          const itemId = parseInt(button.dataset.itemId);
          const input = document.querySelector(`input[data-item-id="${itemId}"]`);
          
          if (input) {
            const currentValue = parseInt(input.value);
            const maxValue = parseInt(input.max);
            
            if (currentValue < maxValue) {
              input.value = currentValue + 1;
              this.updateItemQuantity(itemId, currentValue + 1);
            }
          }
        });
      });
      
      // Decrease quantity
      const decreaseButtons = document.querySelectorAll('.decrease-quantity');
      decreaseButtons.forEach(button => {
        button.addEventListener('click', () => {
          const itemId = parseInt(button.dataset.itemId);
          const input = document.querySelector(`input[data-item-id="${itemId}"]`);
          
          if (input) {
            const currentValue = parseInt(input.value);
            
            if (currentValue > 1) {
              input.value = currentValue - 1;
              this.updateItemQuantity(itemId, currentValue - 1);
            }
          }
        });
      });
      
      // Quantity input change
      const quantityInputs = document.querySelectorAll('.cart-item-quantity input');
      quantityInputs.forEach(input => {
        input.addEventListener('change', () => {
          const itemId = parseInt(input.dataset.itemId);
          const value = parseInt(input.value);
          
          if (value < 1) {
            input.value = 1;
            this.updateItemQuantity(itemId, 1);
          } else if (value > parseInt(input.max)) {
            input.value = input.max;
            this.updateItemQuantity(itemId, parseInt(input.max));
          } else {
            this.updateItemQuantity(itemId, value);
          }
        });
      });
      
      // Remove item
      const removeButtons = document.querySelectorAll('.remove-item');
      removeButtons.forEach(button => {
        button.addEventListener('click', () => {
          const itemId = parseInt(button.dataset.itemId);
          this.removeItem(itemId);
        });
      });
    }
    
    // Set up global event listeners
    setupEventListeners() {
      // Checkout button
      if (this.checkoutButton) {
        this.checkoutButton.addEventListener('click', async () => {
          const result = await this.checkout();
          
          if (result) {
            // Show success message
            alert('Order placed successfully!');
            
            // Redirect to profile page
            window.location.href = `/profile?order=${result.orderId}`;
          }
        });
      }
      
      // Add to cart buttons
      document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
          const productId = parseInt(event.target.dataset.productId);
          const quantityInput = document.querySelector('.quantity-control input');
          const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
          
          const result = await this.addItem(productId, quantity);
          
          if (result) {
            // Show success message
            alert('Product added to cart!');
          }
        }
      });
    }
  }
  
  // Initialize cart when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
  });