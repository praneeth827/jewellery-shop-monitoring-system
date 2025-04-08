// Initialize variables
let currentPage = 1;
const itemsPerPage = 12;
let filteredCollections = [...collections];

// DOM Elements
const collectionsContainer = document.getElementById('collectionsContainer');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Display collections with pagination
function displayCollections() {
    collectionsContainer.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCollections = filteredCollections.slice(startIndex, endIndex);

    currentCollections.forEach(collection => {
        const collectionCard = document.createElement('div');
        collectionCard.className = 'collection-card';
        collectionCard.innerHTML = `
            <img src="${collection.image}" alt="${collection.name}">
            <div class="collection-info">
                <h3>${collection.name}</h3>
                <p class="weight">Weight: ${collection.weight}</p>
                <p class="price">₹${collection.price.toLocaleString()}</p>
                <p class="quantity">Available: ${collection.quantity}</p>
                <button class="add-to-cart" onclick="addToCart(${collection.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;
        collectionsContainer.appendChild(collectionCard);
    });

    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// Filter collections
function filterCollections(category) {
    if (category === 'all') {
        filteredCollections = [...collections];
    } else {
        filteredCollections = collections.filter(item => item.category === category);
    }
    currentPage = 1;
    displayCollections();
}

// Search collections
function searchCollections(query) {
    query = query.toLowerCase();
    filteredCollections = collections.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    currentPage = 1;
    displayCollections();
}

// Sort collections
function sortCollections(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredCollections.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredCollections.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredCollections.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            filteredCollections = [...collections];
    }
    displayCollections();
}

// Add to cart function
function addToCart(productId) {
    const product = collections.find(p => p.id === productId);
    if (!product) return;

    // Get existing cart from localStorage or initialize new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
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

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
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

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchCollections(e.target.value);
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterCollections(button.dataset.filter);
    });
});

sortSelect.addEventListener('change', (e) => {
    sortCollections(e.target.value);
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayCollections();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayCollections();
    }
});

// Initialize
displayCollections();
updateCartCount(); 