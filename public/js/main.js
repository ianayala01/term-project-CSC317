// Main JavaScript file for client-side functionality

// DOM Elements
const DOM = {
    header: document.querySelector('.header'),
    navLinks: document.querySelector('.nav-links'),
    cartCount: document.querySelector('.cart-count'),
    productGrid: document.querySelector('.products-grid'),
    featuredProducts: document.querySelector('.featured-products'),
    searchForm: document.querySelector('.search-form'),
    searchInput: document.querySelector('.search-input'),
    searchResults: document.querySelector('.search-results'),
    categoryFilters: document.querySelector('.category-filters'),
    productDetailContainer: document.querySelector('.product-detail'),
    cartContainer: document.querySelector('.cart-container'),
    cartItems: document.querySelector('.cart-items'),
    cartSummary: document.querySelector('.cart-summary'),
    loginForm: document.querySelector('.login-form'),
    registerForm: document.querySelector('.register-form'),
    profileContainer: document.querySelector('.profile-container'),
    faqItems: document.querySelectorAll('.faq-item'),
    alertContainer: document.querySelector('.alert-container')
  };
  
  // API endpoints
  const API = {
    auth: '/api/auth',
    products: '/api/products',
    users: '/api/users',
    cart: '/api/cart'
  };
  
  // Helper functions
  function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
  }
  
  function createAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    if (DOM.alertContainer) {
      DOM.alertContainer.innerHTML = '';
      DOM.alertContainer.appendChild(alertDiv);
      
      // Auto dismiss after 3 seconds
      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    }
  }
  
  async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      createAlert(error.message, 'danger');
      throw error;
    }
  }
  
  // Check authentication status
  async function checkAuth() {
    try {
      const data = await fetchData(`${API.auth}/status`);
      
      if (data.isAuthenticated) {
        // Update UI for logged in user
        document.body.classList.add('is-authenticated');
        
        // Update navigation
        const authLinks = document.querySelectorAll('.auth-nav');
        const profileLinks = document.querySelectorAll('.profile-nav');
        
        authLinks.forEach(link => link.style.display = 'none');
        profileLinks.forEach(link => {
          link.style.display = 'block';
          if (link.querySelector('.user-name')) {
            link.querySelector('.user-name').textContent = data.user.name;
          }
        });
        
        // Update cart count
        updateCartCount();
      } else {
        document.body.classList.remove('is-authenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }
  
  // Update cart item count
  async function updateCartCount() {
    try {
      const cartData = await fetchData(`${API.cart}`);
      
      if (DOM.cartCount) {
        const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        DOM.cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
          DOM.cartCount.style.display = 'flex';
        } else {
          DOM.cartCount.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Cart count error:', error);
    }
  }
  
  // Load featured products on homepage
  async function loadFeaturedProducts() {
    if (!DOM.featuredProducts) return;
    
    try {
      const products = await fetchData(`${API.products}/featured`);
      
      if (DOM.productGrid) {
        DOM.productGrid.innerHTML = '';
        
        products.forEach(product => {
          const productCard = createProductCard(product);
          DOM.productGrid.appendChild(productCard);
        });
      }
    } catch (error) {
      console.error('Featured products error:', error);
    }
  }
  
  // Create product card element
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
      <div class="product-img">
        <img src="${product.image_url}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-category">${product.category}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
        <a href="/product/${product.id}" class="btn btn-primary">View Details</a>
      </div>
    `;
    
    return card;
  }
  
  // Load product details
  async function loadProductDetails() {
    if (!DOM.productDetailContainer) return;
    
    const productId = window.location.pathname.split('/').pop();
    
    try {
      const product = await fetchData(`${API.products}/${productId}`);
      
      // Update product details in DOM
      const productContent = DOM.productDetailContainer.querySelector('.product-content');
      
      if (productContent) {
        // Update product title
        const title = productContent.querySelector('h1');
        if (title) title.textContent = product.name;
        
        // Update product category
        const category = productContent.querySelector('.category');
        if (category) category.textContent = product.category;
        
        // Update product price
        const price = productContent.querySelector('.price');
        if (price) price.textContent = formatPrice(product.price);
        
        // Update product description
        const description = productContent.querySelector('.product-description');
        if (description) description.textContent = product.description;
        
        // Update add to cart button
        const addToCartBtn = productContent.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
          addToCartBtn.dataset.productId = product.id;
        }
      }
      
      // Update product image
      const productGallery = DOM.productDetailContainer.querySelector('.product-gallery');
      if (productGallery) {
        productGallery.innerHTML = `<img src="${product.image_url}" alt="${product.name}">`;
      }
    } catch (error) {
      console.error('Product details error:', error);
    }
  }
  
  // Handle product search
  async function handleSearch(event) {
    if (!DOM.searchForm) return;
    
    event.preventDefault();
    
    const searchQuery = DOM.searchInput.value.trim();
    
    if (!searchQuery) return;
    
    try {
      const products = await fetchData(`${API.products}/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (DOM.searchResults) {
        DOM.searchResults.innerHTML = '';
        
        if (products.length === 0) {
          DOM.searchResults.innerHTML = '<p>No products found matching your search.</p>';
          return;
        }
        
        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'products-grid';
        
        products.forEach(product => {
          const productCard = createProductCard(product);
          resultsGrid.appendChild(productCard);
        });
        
        DOM.searchResults.appendChild(resultsGrid);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  
  // Load cart contents
  async function loadCart() {
    if (!DOM.cartContainer) return;
    
    try {
      const cartData = await fetchData(`${API.cart}`);
      
      if (DOM.cartItems) {
        DOM.cartItems.innerHTML = '';
        
        if (cartData.items.length === 0) {
          DOM.cartItems.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a href="/" class="btn">Continue Shopping</a></div>';
          DOM.cartSummary.style.display = 'none';
          return;
        }
        
        cartData.items.forEach(item => {
          const cartItem = document.createElement('div');
          cartItem.className = 'cart-item';
          
          cartItem.innerHTML = `
            <div class="cart-item-img">
              <img src="${item.image_url}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
              <h3>${item.name}</h3>
            </div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-quantity">
              <button class="decrease-quantity" data-item-id="${item.id}">-</button>
              <input type="number" value="${item.quantity}" min="1" max="${item.stock_quantity}" data-item-id="${item.id}">
              <button class="increase-quantity" data-item-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
            <div class="cart-item-remove">
              <button class="btn-danger remove-item" data-item-id="${item.id}">Remove</button>
            </div>
          `;
          
          DOM.cartItems.appendChild(cartItem);
        });
        
        // Setup event listeners for cart items
        setupCartItemEvents();
        
        // Update cart summary
        if (DOM.cartSummary) {
          const subtotalEl = DOM.cartSummary.querySelector('.subtotal');
          const totalEl = DOM.cartSummary.querySelector('.total-price');
          
          if (subtotalEl) subtotalEl.textContent = formatPrice(cartData.total);
          if (totalEl) totalEl.textContent = formatPrice(cartData.total);
          
          DOM.cartSummary.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Cart error:', error);
    }
  }
  
  // Setup event listeners for cart item buttons
  function setupCartItemEvents() {
    // Increase quantity
    const increaseButtons = document.querySelectorAll('.increase-quantity');
    increaseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.itemId;
        const input = document.querySelector(`input[data-item-id="${itemId}"]`);
        
        if (input) {
          const currentValue = parseInt(input.value);
          const maxValue = parseInt(input.max);
          
          if (currentValue < maxValue) {
            input.value = currentValue + 1;
            updateCartItemQuantity(itemId, currentValue + 1);
          }
        }
      });
    });
    
    // Decrease quantity
    const decreaseButtons = document.querySelectorAll('.decrease-quantity');
    decreaseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.itemId;
        const input = document.querySelector(`input[data-item-id="${itemId}"]`);
        
        if (input) {
          const currentValue = parseInt(input.value);
          
          if (currentValue > 1) {
            input.value = currentValue - 1;
            updateCartItemQuantity(itemId, currentValue - 1);
          }
        }
      });
    });
    
    // Quantity input change
    const quantityInputs = document.querySelectorAll('.cart-item-quantity input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', () => {
        const itemId = input.dataset.itemId;
        const value = parseInt(input.value);
        
        if (value < 1) {
          input.value = 1;
          updateCartItemQuantity(itemId, 1);
        } else if (value > parseInt(input.max)) {
          input.value = input.max;
          updateCartItemQuantity(itemId, parseInt(input.max));
        } else {
          updateCartItemQuantity(itemId, value);
        }
      });
    });
    
    // Remove item
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.itemId;
        removeCartItem(itemId);
      });
    });
  }
  
  // Update cart item quantity
  async function updateCartItemQuantity(itemId, quantity) {
    try {
      await fetchData(`${API.cart}/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      
      // Reload cart to reflect changes
      loadCart();
      
      // Update cart count in header
      updateCartCount();
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  }
  
  // Remove item from cart
  async function removeCartItem(itemId) {
    try {
      await fetchData(`${API.cart}/${itemId}`, {
        method: 'DELETE'
      });
      
      // Reload cart to reflect changes
      loadCart();
      
      // Update cart count in header
      updateCartCount();
    } catch (error) {
      console.error('Remove item error:', error);
    }
  }
  
  // Process checkout
  async function processCheckout() {
    try {
      const result = await fetchData(`${API.cart}/checkout`, {
        method: 'POST'
      });
      
      // Show success message
      createAlert('Order placed successfully!');
      
      // Redirect to order confirmation page
      window.location.href = `/profile?order=${result.orderId}`;
    } catch (error) {
      console.error('Checkout error:', error);
    }
  }
  
  // Handle login form submission
  async function handleLogin(event) {
    if (!DOM.loginForm) return;
    
    event.preventDefault();
    
    const email = DOM.loginForm.querySelector('input[name="email"]').value;
    const password = DOM.loginForm.querySelector('input[name="password"]').value;
    
    if (!email || !password) {
      createAlert('Please enter email and password', 'danger');
      return;
    }
    
    try {
      const result = await fetchData(`${API.auth}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      createAlert('Login successful!');
      
      // Redirect to previous page or home
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Login error:', error);
    }
  }
  
  // Handle register form submission
  async function handleRegister(event) {
    if (!DOM.registerForm) return;
    
    event.preventDefault();
    
    const name = DOM.registerForm.querySelector('input[name="name"]').value;
    const email = DOM.registerForm.querySelector('input[name="email"]').value;
    const password = DOM.registerForm.querySelector('input[name="password"]').value;
    const confirmPassword = DOM.registerForm.querySelector('input[name="confirm_password"]').value;
    
    if (!name || !email || !password) {
      createAlert('Please fill all required fields', 'danger');
      return;
    }
    
    if (password !== confirmPassword) {
      createAlert('Passwords do not match', 'danger');
      return;
    }
    
    try {
      const result = await fetchData(`${API.auth}/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      
      createAlert('Registration successful! Please log in.');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Register error:', error);
    }
  }
  
  // Load user profile
  async function loadProfile() {
    if (!DOM.profileContainer) return;
    
    try {
      const userData = await fetchData(`${API.users}/profile`);
      const orderHistory = await fetchData(`${API.users}/orders`);
      
      // Update profile info
      const profileInfo = DOM.profileContainer.querySelector('.profile-info');
      if (profileInfo) {
        const nameEl = profileInfo.querySelector('.user-name');
        const emailEl = profileInfo.querySelector('.user-email');
        
        if (nameEl) nameEl.textContent = userData.name;
        if (emailEl) emailEl.textContent = userData.email;
      }
      
      // Update order history
      const orderHistoryContainer = DOM.profileContainer.querySelector('.order-history');
      if (orderHistoryContainer) {
        orderHistoryContainer.innerHTML = '';
        
        if (orderHistory.length === 0) {
          orderHistoryContainer.innerHTML = '<p>You have no previous orders.</p>';
          return;
        }
        
        orderHistory.forEach(order => {
          const orderElement = document.createElement('div');
          orderElement.className = 'order-history-item';
          
          // Format date
          const orderDate = new Date(order.created_at);
          const formattedDate = orderDate.toLocaleDateString();
          
          orderElement.innerHTML = `
            <div class="order-header">
              <div>
                <div>Order #${order.id}</div>
                <div>${formattedDate}</div>
              </div>
              <div class="order-status">${order.status}</div>
              <div class="order-total">${formatPrice(order.total_amount)}</div>
            </div>
            <div class="order-products"></div>
          `;
          
          const orderProducts = orderElement.querySelector('.order-products');
          
          order.items.forEach(item => {
            const productElement = document.createElement('div');
            productElement.className = 'order-product';
            
            productElement.innerHTML = `
              <div class="order-product-img">
                <img src="${item.image_url}" alt="${item.name}">
              </div>
              <div class="order-product-details">
                <h4>${item.name}</h4>
                <div>Quantity: ${item.quantity}</div>
                <div class="price">${formatPrice(item.price_at_time)}</div>
              </div>
            `;
            
            orderProducts.appendChild(productElement);
          });
          
          orderHistoryContainer.appendChild(orderElement);
        });
      }
    } catch (error) {
      console.error('Profile error:', error);
    }
  }
  
  // Handle FAQ accordion
  function setupFAQ() {
    if (!DOM.faqItems) return;
    
    DOM.faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      question.addEventListener('click', () => {
        // Toggle active class
        question.classList.toggle('active');
        answer.classList.toggle('active');
      });
    });
  }
  
  // Add product to cart
  async function addToCart(productId, quantity = 1) {
    try {
      const result = await fetchData(`${API.cart}`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      
      createAlert('Product added to cart!');
      
      // Update cart count
      updateCartCount();
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  }
  
  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    checkAuth();
    
    // Load featured products on homepage
    loadFeaturedProducts();
    
    // Load product details on product page
    loadProductDetails();
    
    // Load cart contents on cart page
    loadCart();
    
    // Load user profile on profile page
    loadProfile();
    
    // Setup FAQ accordion
    setupFAQ();
    
    // Event: Add to cart button click
    document.addEventListener('click', event => {
      if (event.target.classList.contains('add-to-cart-btn')) {
        const productId = event.target.dataset.productId;
        const quantityInput = document.querySelector('.quantity-control input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        addToCart(productId, quantity);
      }
    });
    
    // Event: Search form submit
    if (DOM.searchForm) {
      DOM.searchForm.addEventListener('submit', handleSearch);
    }
    
    // Event: Login form submit
    if (DOM.loginForm) {
      DOM.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Event: Register form submit
    if (DOM.registerForm) {
      DOM.registerForm.addEventListener('submit', handleRegister);
    }
    
    // Event: Checkout button click
    const checkoutBtn = document.querySelector('.checkout-button');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', processCheckout);
    }
  });