// Form validation utilities

class FormValidator {
    constructor(form) {
      this.form = form;
      this.errors = {};
      this.errorElements = {};
    }
    
    // Initialize validation
    init() {
      // Get all required fields
      const requiredFields = this.form.querySelectorAll('[required]');
      
      // Add validation event listeners
      requiredFields.forEach(field => {
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.display = 'none';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        
        // Insert error element after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Store error element reference
        this.errorElements[field.name] = errorElement;
        
        // Add event listener for validation
        field.addEventListener('blur', () => {
          this.validateField(field);
        });
      });
      
      // Add form submit validation
      this.form.addEventListener('submit', (event) => {
        if (!this.validateForm()) {
          event.preventDefault();
        }
      });
    }
    
    // Validate a specific field
    validateField(field) {
      const name = field.name;
      const value = field.value.trim();
      const type = field.type;
      
      // Clear previous error
      this.errors[name] = null;
      
      // Required validation
      if (field.hasAttribute('required') && value === '') {
        this.errors[name] = `${this.getFieldLabel(field)} is required`;
      }
      
      // Email validation
      if (type === 'email' && value !== '' && !this.isValidEmail(value)) {
        this.errors[name] = 'Please enter a valid email address';
      }
      
      // Password validation
      if (name === 'password' && value !== '' && value.length < 8) {
        this.errors[name] = 'Password must be at least 8 characters long';
      }
      
      // Password confirmation validation
      if (name === 'confirm_password') {
        const passwordField = this.form.querySelector('[name="password"]');
        
        if (passwordField && value !== passwordField.value) {
          this.errors[name] = 'Passwords do not match';
        }
      }
      
      // Number validation
      if (type === 'number') {
        const min = parseFloat(field.getAttribute('min'));
        const max = parseFloat(field.getAttribute('max'));
        const numValue = parseFloat(value);
        
        if (!isNaN(min) && !isNaN(numValue) && numValue < min) {
          this.errors[name] = `${this.getFieldLabel(field)} must be at least ${min}`;
        }
        
        if (!isNaN(max) && !isNaN(numValue) && numValue > max) {
          this.errors[name] = `${this.getFieldLabel(field)} must be at most ${max}`;
        }
      }
      
      // Custom validation based on field name
      switch (name) {
        case 'name':
          if (value !== '' && value.length < 2) {
            this.errors[name] = 'Name must be at least 2 characters long';
          }
          break;
          
        case 'phone':
          if (value !== '' && !this.isValidPhone(value)) {
            this.errors[name] = 'Please enter a valid phone number';
          }
          break;
      }
      
      // Update UI
      this.updateFieldError(field);
      
      return !this.errors[name];
    }
    
    // Validate all form fields
    validateForm() {
      let isValid = true;
      
      // Get all form fields
      const fields = this.form.querySelectorAll('input, select, textarea');
      
      // Validate each field
      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      
      return isValid;
    }
    
    // Update field error message in UI
    updateFieldError(field) {
      const name = field.name;
      const errorElement = this.errorElements[name];
      
      if (!errorElement) return;
      
      if (this.errors[name]) {
        // Show error
        errorElement.textContent = this.errors[name];
        errorElement.style.display = 'block';
        field.classList.add('is-invalid');
      } else {
        // Hide error
        errorElement.style.display = 'none';
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    }
    
    // Get field label for error messages
    getFieldLabel(field) {
      // Try to get label from label element
      const id = field.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          return label.textContent;
        }
      }
      
      // Try to get label from placeholder
      const placeholder = field.getAttribute('placeholder');
      if (placeholder) {
        return placeholder;
      }
      
      // Fallback to field name
      return field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Email validation
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    
    // Phone validation
    isValidPhone(phone) {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{10,20}$/;
      return phoneRegex.test(phone);
    }
  }
  
  // Initialize form validation when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      const validator = new FormValidator(form);
      validator.init();
    });
  });