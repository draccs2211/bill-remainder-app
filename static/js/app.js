// Bill Reminder App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Setup form validations
    setupFormValidations();
    
    // Setup interactive elements
    setupInteractiveElements();
    
    // Setup preview functionality
    setupPreviewFunctionality();
    
    // Setup animations
    setupAnimations();
    
    // Setup notification system
    setupNotifications();
    
    console.log('Bill Reminder App initialized successfully');
}

// Form Validation
function setupFormValidations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(form)) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                showLoadingState(form);
            }
            
            form.classList.add('was-validated');
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
        
        // Specific validations
        if (field.type === 'email' && field.value) {
            if (!isValidEmail(field.value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        if (field.type === 'date' && field.value) {
            const selectedDate = new Date(field.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today && field.name === 'due_date') {
                showFieldError(field, 'Due date cannot be in the past');
                isValid = false;
            }
        }
        
        if (field.type === 'number' && field.value) {
            const value = parseFloat(field.value);
            if (value < 0) {
                showFieldError(field, 'Amount cannot be negative');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Interactive Elements
function setupInteractiveElements() {
    // Setup bill row interactions
    const billRows = document.querySelectorAll('.bill-row');
    billRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Setup button loading states
    const actionButtons = document.querySelectorAll('a[href*="mark_paid"], a[href*="mark_unpaid"], a[href*="delete_bill"]');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.href.includes('delete_bill')) {
                return; // Let the confirm dialog handle this
            }
            
            showButtonLoading(this);
        });
    });
    
    // Setup confirmation dialogs with better UX
    const deleteButtons = document.querySelectorAll('a[href*="delete_bill"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            const billName = this.closest('tr').querySelector('strong').textContent;
            const confirmMessage = `Are you sure you want to delete "${billName}"?\n\nThis action cannot be undone.`;
            
            if (confirm(confirmMessage)) {
                showButtonLoading(this);
                window.location.href = this.href;
            }
        });
    });
}

function showButtonLoading(button) {
    button.classList.add('loading');
    button.style.pointerEvents = 'none';
    
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Restore button after 5 seconds (fallback)
    setTimeout(() => {
        button.classList.remove('loading');
        button.style.pointerEvents = 'auto';
        button.innerHTML = originalText;
    }, 5000);
}

function showLoadingState(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
    }
}

// Preview Functionality
function setupPreviewFunctionality() {
    const addBillForm = document.getElementById('addBillForm');
    const editBillForm = document.getElementById('editBillForm');
    
    if (addBillForm) {
        setupFormPreview(addBillForm);
    }
    
    if (editBillForm) {
        setupFormPreview(editBillForm);
    }
}

function setupFormPreview(form) {
    const previewCard = document.getElementById('previewCard');
    if (!previewCard) return;
    
    const nameField = form.querySelector('#name');
    const descriptionField = form.querySelector('#description');
    const dueDateField = form.querySelector('#due_date');
    const amountField = form.querySelector('#amount');
    
    const previewName = document.getElementById('previewName');
    const previewDescription = document.getElementById('previewDescription');
    const previewDueDate = document.getElementById('previewDueDate');
    const previewAmount = document.getElementById('previewAmount');
    
    function updatePreview() {
        const hasContent = nameField.value || descriptionField.value || dueDateField.value || amountField.value;
        
        if (hasContent) {
            previewCard.style.display = 'block';
            
            previewName.textContent = nameField.value || 'Untitled Bill';
            previewDescription.textContent = descriptionField.value || 'No description';
            
            if (dueDateField.value) {
                const date = new Date(dueDateField.value);
                previewDueDate.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } else {
                previewDueDate.textContent = '-';
            }
            
            if (amountField.value) {
                previewAmount.textContent = '$' + parseFloat(amountField.value).toFixed(2);
            } else {
                previewAmount.textContent = '-';
            }
        } else {
            previewCard.style.display = 'none';
        }
    }
    
    // Add event listeners
    [nameField, descriptionField, dueDateField, amountField].forEach(field => {
        if (field) {
            field.addEventListener('input', updatePreview);
            field.addEventListener('change', updatePreview);
        }
    });
    
    // Initial update
    updatePreview();
}

// Animations
function setupAnimations() {
    // Animate cards on page load
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            alert.style.transition = 'all 0.4s ease';
            alert.style.opacity = '1';
            alert.style.transform = 'translateX(0)';
        }, 200);
    });
}

// Notification System (Mock)
function setupNotifications() {
    // Simulate notification check
    checkForUpcomingBills();
    
    // Check every 5 minutes
    setInterval(checkForUpcomingBills, 5 * 60 * 1000);
}

function checkForUpcomingBills() {
    const reminderBills = document.querySelectorAll('.alert-warning');
    
    if (reminderBills.length > 0) {
        console.log(`Found ${reminderBills.length} bills due soon. Mock notifications would be sent.`);
        
        // In a real implementation, this would call your notification API
        // sendNotifications(reminderBills);
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

function getDaysUntilDate(date) {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Auto-save functionality for forms (optional enhancement)
function setupAutoSave() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                saveFormData(form);
            }, 1000));
        });
    });
}

function saveFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem(`form_${form.id}`, JSON.stringify(data));
    console.log('Form data auto-saved');
}

function loadFormData(form) {
    const savedData = localStorage.getItem(`form_${form.id}`);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        isValidEmail,
        formatCurrency,
        formatDate,
        getDaysUntilDate
    };
}
