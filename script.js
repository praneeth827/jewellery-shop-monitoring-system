// Initialize variables
let cart = [];
let totalRevenue = 0;
let todaySales = 0;

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const cartItems = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const gstElement = document.getElementById('gst');
const totalElement = document.getElementById('total');
const totalRevenueElement = document.getElementById('totalRevenue');
const todaySalesElement = document.getElementById('todaySales');
const totalProductsElement = document.getElementById('totalProducts');
const cartCountElement = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCart');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize total products count
totalProductsElement.textContent = products.length;

// Display products with filtering
function displayProducts(filter = 'all') {
    productsContainer.innerHTML = '';
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(product => product.category === filter);

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>Weight: ${product.weight}</p>
                <p class="price">₹${product.price.toLocaleString()}</p>
                <p>Available: ${product.quantity}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Add item to cart with animation
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.quantity < product.quantity) {
            cartItem.quantity++;
            showNotification(`${product.name} quantity updated!`);
        } else {
            showNotification('Maximum quantity reached!', 'error');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
        showNotification(`${product.name} added to cart!`);
    }
    updateCart();
    saveCartToLocalStorage();
}

// Remove item from cart
function removeFromCart(productId) {
    const product = products.find(p => p.id === productId);
    cart = cart.filter(item => item.id !== productId);
    showNotification(`${product.name} removed from cart!`);
    updateCart();
    saveCartToLocalStorage();
}

// Update quantity in cart
function updateQuantity(productId, change) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        const product = products.find(p => p.id === productId);
        const newQuantity = cartItem.quantity + change;
        
        if (newQuantity > 0 && newQuantity <= product.quantity) {
            cartItem.quantity = newQuantity;
            showNotification(`${product.name} quantity updated!`);
        } else if (newQuantity === 0) {
            removeFromCart(productId);
        } else {
            showNotification('Maximum quantity reached!', 'error');
        }
        updateCart();
        saveCartToLocalStorage();
    }
}

// Update cart display with animations
function updateCart() {
    cartItems.innerHTML = '';
    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <span>${item.name}</span>
            <div class="quantity-controls">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <span>₹${itemTotal.toLocaleString()}</span>
            <span class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </span>
        `;
        cartItems.appendChild(cartItemElement);
    });

    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    subtotalElement.textContent = subtotal.toFixed(2);
    gstElement.textContent = gst.toFixed(2);
    totalElement.textContent = total.toFixed(2);
    cartCountElement.textContent = totalItems;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Function to handle checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const total = calculateTotal();
    totalRevenue += total;
    todaySales += total;
    
    // Update revenue displays with animation
    animateValue(totalRevenueElement, parseFloat(totalRevenueElement.textContent), totalRevenue, 1000);
    animateValue(todaySalesElement, parseFloat(todaySalesElement.textContent), todaySales, 1000);
    
    // Clear cart
    cart = [];
    updateCart();
    saveCartToLocalStorage();
    showNotification('Thank you for your purchase!');
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty!', 'error');
        return;
    }
    cart = [];
    updateCart();
    saveCartToLocalStorage();
    showNotification('Cart cleared!');
}

// Animate value changes
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = (start + (end - start) * progress).toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .notification.show {
        transform: translateX(0);
    }
    .notification.success {
        border-left: 4px solid #2ecc71;
    }
    .notification.error {
        border-left: 4px solid #e74c3c;
    }
    .notification i {
        font-size: 1.2rem;
    }
    .notification.success i {
        color: #2ecc71;
    }
    .notification.error i {
        color: #e74c3c;
    }
`;
document.head.appendChild(style);

// Function to calculate total
function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    return total;
}

// Function to save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Load cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
});

// Event Listeners
checkoutBtn.addEventListener('click', checkout);
clearCartBtn.addEventListener('click', clearCart);

// Filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        displayProducts(button.dataset.filter);
    });
});

// Initialize the application
displayProducts();
updateCart(); 