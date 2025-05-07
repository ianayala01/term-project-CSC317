// Main JavaScript file for client-side functionality

// DOM Elements
const DOM = {
  header: document.querySelector('.header'),
  navLinks: document.querySelector('.nav-links'),
  cartCount: document.querySelector('.cart-count'),
  productGrid: document.querySelector('.products-grid'),
  featuredProducts: document.querySelector('.featured-products'),
  searchForm: document.querySelector('.search-form') || document.querySelector('form[action="/search"]'),
  searchInput: document.querySelector('.search-input') || document.querySelector('input[name="query"]'),
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
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.style.float = 'right';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.25rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.marginLeft = '10px';
  
  closeBtn.addEventListener('click', () => {
    alertDiv.remove();
  });
  
  alertDiv.appendChild(closeBtn);
  
  // Create alert container if it doesn't exist
  let alertContainer = document.querySelector('.alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container';
    const main = document.querySelector('main') || document.body;
    main.insertBefore(alertContainer, main.firstChild);
  }
  
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alertDiv);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

async function fetchData(url, options = {}) {
  try {
    console.log('Fetching:', url);
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

// Load featured products on homepage with proper shuffling
async function loadFeaturedProducts() {
  if (!DOM.featuredProducts) return;
  
  try {
    // Fetch all products
    const response = await fetchData(`${API.products}`);
    let products;
    
    // Handle different response formats
    if (response.products) {
      products = response.products;
    } else if (Array.isArray(response)) {
      products = response;
    } else {
      console.error('Unexpected response format:', response);
      throw new Error('Invalid product data');
    }
    
    console.log('Featured products total count:', products.length);
    
    if (products.length > 0) {
      // Shuffle the products array
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      
      // Get the first 8 products (or less if fewer than 8 products exist)
      const featuredProducts = shuffledProducts.slice(0, 8);
      
      // Get the product grids for the first and second rows
      const productGrids = DOM.featuredProducts.querySelectorAll('.products-grid');
      
      if (productGrids.length === 2) {
        // Clear existing content
        productGrids[0].innerHTML = '';
        productGrids[1].innerHTML = '';
        
        // Display first 4 products in the first row
        for (let i = 0; i < Math.min(4, featuredProducts.length); i++) {
          const productCard = createProductCard(featuredProducts[i]);
          productGrids[0].appendChild(productCard);
        }
        
        // Display next 4 products in the second row
        for (let i = 4; i < Math.min(8, featuredProducts.length); i++) {
          const productCard = createProductCard(featuredProducts[i]);
          productGrids[1].appendChild(productCard);
        }
      }
    }
  } catch (error) {
    console.error('Featured products error:', error);
    
    // Show error message
    const productGrids = DOM.featuredProducts.querySelectorAll('.products-grid');
    if (productGrids.length > 0) {
      productGrids[0].innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>Failed to load products. Please try again later.</p>
          <button class="btn btn-primary retry-btn">Retry</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = productGrids[0].querySelector('.retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadFeaturedProducts);
      }
    }
  }
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  card.innerHTML = `
    <div class="product-img">
      <img src="${product.image_url}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.name}</h3>
      <div class="product-category">${product.category}</div>
      <div class="product-price">${formatPrice(product.price)}</div>
      <div class="product-button">
        <a href="/product/${product.id}" class="btn btn-secondary">View Details</a>
      </div>
    </div>
  `;
  
  return card;
}

// Load product details
async function loadProductDetails() {
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
      productGallery.innerHTML = `<img src="${product.image_url}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">`;
    }
    
    // Update breadcrumbs
    const breadcrumbCategory = document.querySelector('.breadcrumb a:nth-child(2)');
    if (breadcrumbCategory) {
      breadcrumbCategory.href = `/search?category=${encodeURIComponent(product.category)}`;
      breadcrumbCategory.textContent = product.category;
    }
    
    const breadcrumbProduct = document.querySelector('.breadcrumb .product-name');
    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = product.name;
    }
    
    // Update page title
    document.title = `${product.name} - Travel Essentials`;
    
    // Load related products
    await loadRelatedProducts(product.category, product.id);
    
  } catch (error) {
    console.error('Product details error:', error);
    createAlert('Failed to load product details. Please try again later.', 'danger');
  }
}

// Load related products
async function loadRelatedProducts(category, currentProductId) {
  const relatedProductsGrid = document.querySelector('.related-products .products-grid');
  if (!relatedProductsGrid) return;
  
  try {
    // Show loading
    relatedProductsGrid.innerHTML = '<div class="loading-spinner">Loading related products...</div>';
    
    // Fetch products in the same category
    const products = await fetchData(`${API.products}/search?category=${encodeURIComponent(category)}`);
    
    // Filter out current product and limit to 4
    const relatedProducts = products
      .filter(product => product.id !== parseInt(currentProductId))
      .slice(0, 4);
    
    // Clear loading message
    relatedProductsGrid.innerHTML = '';
    
    if (relatedProducts.length > 0) {
      relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        relatedProductsGrid.appendChild(productCard);
      });
    } else {
      relatedProductsGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>No related products found.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Related products error:', error);
    relatedProductsGrid.innerHTML = `
      <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
        <p>Failed to load related products.</p>
      </div>
    `;
  }
}

// Handle product search
async function handleSearch(event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }
  
  const form = event?.target || DOM.searchForm;
  if (!form) return;
  
  const formData = new FormData(form);
  const searchQuery = formData.get('query')?.trim();
  
  if (searchQuery) {
    // Redirect to search page with query
    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
  }
}

// Load search results
async function loadSearchResults() {
  if (!DOM.searchResults) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  const category = urlParams.get('category');
  const minPrice = urlParams.get('min_price');
  const maxPrice = urlParams.get('max_price');
  const sortBy = urlParams.get('sort');
  
  // Add debug logs
  console.log("Search parameters:", { query, category, minPrice, maxPrice, sortBy });
  
  // Update search term display
  const searchTerm = document.getElementById('search-term');
  if (searchTerm) {
    searchTerm.textContent = query || category || 'All Products';
  }
  
  try {
    // Build query parameters
    let queryParams = new URLSearchParams();
    
    if (query) queryParams.append('query', query);
    if (category) queryParams.append('category', category);
    if (minPrice) queryParams.append('min_price', minPrice);
    if (maxPrice) queryParams.append('max_price', maxPrice);
    if (sortBy) queryParams.append('sort', sortBy);
    
    // Add debug log
    console.log("API Query:", queryParams.toString());
    
    // Fetch search results
    let products;
    let apiUrl;
    if (query) {
      apiUrl = `${API.products}/search?${queryParams.toString()}`;
      products = await fetchData(apiUrl);
    } else {
      apiUrl = `${API.products}?${queryParams.toString()}`;
      const response = await fetchData(apiUrl);
      products = response.products || response;
    }
    
    // Add debug logs
    console.log("API URL used:", apiUrl);
    console.log("Products received:", products);
    console.log("Number of products:", products.length);
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      resultsCount.textContent = products.length;
    }
    
    // Get products grid
    const productsGrid = document.querySelector('.products-grid');
    
    if (productsGrid) {
      // Clear loading state
      productsGrid.innerHTML = '';
      
      if (products.length === 0) {
        productsGrid.innerHTML = `
          <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or browse our categories.</p>
          </div>
        `;
        return;
      }
      
      // Add products to grid
      products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
      });
    }
    
    // Load categories for filters
    loadCategories();
    
    // Set form values from URL
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortOptions = document.getElementById('sort-options');
    const searchInput = document.querySelector('.search-input');
    
    if (minPriceInput && minPrice) minPriceInput.value = minPrice;
    if (maxPriceInput && maxPrice) maxPriceInput.value = maxPrice;
    if (sortOptions && sortBy) sortOptions.value = sortBy;
    if (searchInput && query) searchInput.value = query;
    
  } catch (error) {
    console.error('Search results error:', error);
    createAlert('Failed to load search results. Please try again later.', 'danger');
  }
}

// Load categories for filter sidebar
async function loadCategories() {
  if (!DOM.categoryFilters) return;
  
  try {
    const categories = await fetchData(`${API.products}/categories`);
    console.log("Categories loaded:", categories);
    
    // Clear loading state
    DOM.categoryFilters.innerHTML = '';
    
    // Get current category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    
    // Add "All Categories" option
    const allCategoriesDiv = document.createElement('div');
    allCategoriesDiv.className = 'filter-option';
    
    const allCategoriesLabel = document.createElement('label');
    allCategoriesLabel.className = 'checkbox-label';
    
    const allCategoriesInput = document.createElement('input');
    allCategoriesInput.type = 'radio';
    allCategoriesInput.name = 'category';
    allCategoriesInput.value = '';
    allCategoriesInput.checked = !currentCategory;
    
    allCategoriesLabel.appendChild(allCategoriesInput);
    allCategoriesLabel.appendChild(document.createTextNode('All Categories'));
    allCategoriesDiv.appendChild(allCategoriesLabel);
    DOM.categoryFilters.appendChild(allCategoriesDiv);
    
    // Add event listener for All Categories option
    allCategoriesInput.addEventListener('change', () => {
      if (allCategoriesInput.checked) {
        console.log("All Categories selected");
        // Create a new URL without the category parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('category');
        console.log("Redirecting to:", newUrl.toString());
        window.location.href = newUrl.toString();
      }
    });
    
    // Add category options
    categories.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'filter-option';
      
      const categoryLabel = document.createElement('label');
      categoryLabel.className = 'checkbox-label';
      
      const categoryInput = document.createElement('input');
      categoryInput.type = 'radio';
      categoryInput.name = 'category';
      categoryInput.value = category;
      categoryInput.checked = category === currentCategory;
      
      categoryLabel.appendChild(categoryInput);
      categoryLabel.appendChild(document.createTextNode(category));
      categoryDiv.appendChild(categoryLabel);
      DOM.categoryFilters.appendChild(categoryDiv);
      
      // Add event listener
      categoryInput.addEventListener('change', () => {
        if (categoryInput.checked) {
          console.log(`Category ${category} selected`);
          // Update URL with selected category
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('category', category);
          console.log("Redirecting to:", newUrl.toString());
          window.location.href = newUrl.toString();
        }
      });
    });
  } catch (error) {
    console.error('Categories error:', error);
    DOM.categoryFilters.innerHTML = '<div>Failed to load categories</div>';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Page-specific initializations
  const currentPath = window.location.pathname;
  
  if (currentPath === '/' || currentPath === '/index.html') {
    // Home page
    loadFeaturedProducts();
  } else if (currentPath.startsWith('/product/')) {
    // Product detail page
    loadProductDetails();
  } else if (currentPath === '/search' || currentPath === '/search.html') {
    // Search results page
    loadSearchResults();
  }
  
  // Search form
  if (DOM.searchForm) {
    DOM.searchForm.addEventListener('submit', handleSearch);
  }
  
  // Add to cart button clicks - UPDATED TO FIX DUPLICATE CART ADDS
  document.addEventListener('click', event => {
    if (event.target.classList.contains('add-to-cart-btn')) {
      // Prevent default behavior and stop event propagation
      event.preventDefault();
      event.stopPropagation();
      
      // Get product ID and quantity
      const productId = parseInt(event.target.dataset.productId);
      const quantityInput = document.querySelector('.quantity-control input');
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
      
      console.log('Add to cart clicked for product:', productId, 'quantity:', quantity);
      
      // Show loading state
      const originalText = event.target.innerHTML;
      event.target.disabled = true;
      event.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      
      // Use the global cart instance if available
      if (window.cart && productId) {
        // Use the cart's addItem method
        window.cart.addItem(productId, quantity)
          .then(success => {
            console.log('Product added to cart:', success);
            
            // Reset button state
            event.target.disabled = false;
            event.target.innerHTML = originalText;
          })
          .catch(error => {
            console.error('Failed to add product to cart:', error);
            
            // Reset button state
            event.target.disabled = false;
            event.target.innerHTML = originalText;
          });
      } else {
        console.error('Cart not initialized or product ID missing');
        
        // Reset button state
        event.target.disabled = false;
        event.target.innerHTML = originalText;
        
        // Show error message
        createAlert('Failed to add product to cart. Please try again.', 'danger');
      }
    }
  });
  
  // Handle search form in header
  const headerSearchForm = document.querySelector('form[action="/search"]');
  if (headerSearchForm) {
    headerSearchForm.addEventListener('submit', handleSearch);
  }
  
  // Remove skeleton loading classes after content has loaded
  setTimeout(() => {
    const skeletons = document.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => {
      skeleton.classList.remove('skeleton');
    });
  }, 1000);
});