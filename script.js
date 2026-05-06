// GLOW Cosmetics - Main JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let authToken = localStorage.getItem('token') || null;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    await loadProducts();
    updateCartUI();
    updateWishlistUI();
    updateAuthUI();
    setupScrollEffects();
}

// Event Listeners
function setupEventListeners() {
    // Mobile Menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Cart
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');

    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            document.getElementById('wishlistSidebar')?.classList.remove('active');
            closeAllModals();
        });
    }

    // Wishlist
    const wishlistIcon = document.getElementById('wishlistIcon');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const closeWishlist = document.getElementById('closeWishlist');

    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', () => {
            wishlistSidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    if (closeWishlist) {
        closeWishlist.addEventListener('click', () => {
            wishlistSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Account
    const accountIcon = document.getElementById('accountIcon');
    if (accountIcon) {
        accountIcon.addEventListener('click', () => {
            if (currentUser) {
                showProfileModal();
            } else {
                showLoginModal();
            }
        });
    }

    // Auth Modals
    setupAuthModals();

    // Product Filters
    setupProductFilters();

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => handleSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch(searchInput.value);
        });
    }

    // Category Cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterByCategory(category);
        });
    });

    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Auth Modals
function setupAuthModals() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const profileModal = document.getElementById('profileModal');

    // Show Login
    const showLoginLinks = document.querySelectorAll('#showLogin, #accountIcon');
    showLoginLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            showLoginModal();
        });
    });

    // Show Register
    const showRegisterLinks = document.querySelectorAll('#showRegister');
    showRegisterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            showRegisterModal();
        });
    });

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = btn.dataset.modal;
            closeModal(modalId);
        });
    });
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function showProfileModal() {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileName && profileEmail && currentUser) {
        profileName.textContent = currentUser.name;
        profileEmail.textContent = currentUser.email;
    }
    
    document.getElementById('profileModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('overlay').classList.remove('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            closeAllModals();
            updateAuthUI();
            showToast('Login successful! Welcome back, ' + data.user.name);
        } else {
            showToast(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            closeAllModals();
            updateAuthUI();
            showToast('Registration successful! Welcome to GLOW Cosmetics!');
        } else {
            showToast(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('An error occurred. Please try again.');
    }
}

function handleLogout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    closeAllModals();
    updateAuthUI();
    showToast('You have been logged out.');
}

function updateAuthUI() {
    const accountIcon = document.getElementById('accountIcon');
    if (accountIcon) {
        if (currentUser) {
            accountIcon.innerHTML = '<i class="fas fa-user-circle"></i>';
        } else {
            accountIcon.innerHTML = '<i class="far fa-user"></i>';
        }
    }
}

// Products
async function loadProducts() {
    const productsLoading = document.getElementById('productsLoading');
    const productsGrid = document.getElementById('productsGrid');
    
    if (productsLoading) productsLoading.classList.add('active');

    try {
        // Try to fetch from API first
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            const data = await response.json();
            products = data.products;
        } else {
            // Fallback to sample products if API is not available
            products = getSampleProducts();
        }
    } catch (error) {
        console.log('Using sample products');
        products = getSampleProducts();
    }

    if (productsLoading) productsLoading.classList.remove('active');
    displayProducts(products);
}

function getSampleProducts() {
    return [
        {
            _id: '1',
            name: 'Rose Glow Serum',
            price: 29.99,
            originalPrice: 39.99,
            category: 'skincare',
            images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500' }],
            ratings: 4.8,
            numReviews: 156,
            bestseller: true,
            newArrival: false,
            featured: true
        },
        {
            _id: '2',
            name: 'Gentle Cleansing Milk',
            price: 24.99,
            originalPrice: 0,
            category: 'skincare',
            images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500' }],
            ratings: 4.6,
            numReviews: 89,
            bestseller: false,
            newArrival: true,
            featured: true
        },
        {
            _id: '3',
            name: 'Hydrating Face Cream',
            price: 34.99,
            originalPrice: 44.99,
            category: 'skincare',
            images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500' }],
            ratings: 4.9,
            numReviews: 203,
            bestseller: true,
            newArrival: false,
            featured: true
        },
        {
            _id: '4',
            name: 'Detox Clay Mask',
            price: 27.99,
            originalPrice: 0,
            category: 'skincare',
            images: [{ url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500' }],
            ratings: 4.5,
            numReviews: 67,
            bestseller: false,
            newArrival: true,
            featured: false
        },
        {
            _id: '5',
            name: 'Vitamin C Brightening Cream',
            price: 42.99,
            originalPrice: 52.99,
            category: 'skincare',
            images: [{ url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500' }],
            ratings: 4.7,
            numReviews: 124,
            bestseller: true,
            newArrival: false,
            featured: true
        },
        {
            _id: '6',
            name: 'Nourishing Hair Mask',
            price: 32.99,
            originalPrice: 0,
            category: 'haircare',
            images: [{ url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500' }],
            ratings: 4.6,
            numReviews: 78,
            bestseller: false,
            newArrival: true,
            featured: false
        },
        {
            _id: '7',
            name: 'Luxury Body Lotion',
            price: 28.99,
            originalPrice: 35.99,
            category: 'bodycare',
            images: [{ url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500' }],
            ratings: 4.8,
            numReviews: 156,
            bestseller: true,
            newArrival: false,
            featured: true
        },
        {
            _id: '8',
            name: 'Signature Perfume - Rose',
            price: 65.99,
            originalPrice: 0,
            category: 'fragrance',
            images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500' }],
            ratings: 4.9,
            numReviews: 234,
            bestseller: true,
            newArrival: false,
            featured: true
        }
    ];
}

function displayProducts(productsToDisplay) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = productsToDisplay.map((product, index) => createProductCard(product, index)).join('');
    
    // Add event listeners to product buttons
    attachProductEventListeners();
}

function createProductCard(product, index) {
    const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300x300';
    const badge = product.bestseller ? 'Bestseller' : (product.newArrival ? 'New' : (product.featured ? 'Featured' : ''));
    const originalPrice = product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : '';
    
    return `
        <div class="product-card" style="animation-delay: ${index * 0.1}s" data-id="${product._id}">
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}">
                ${badge ? `<div class="product-badge">${badge}</div>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn quick-view-btn" data-id="${product._id}" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="product-action-btn wishlist-btn" data-id="${product._id}" title="Add to Wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${createStarRating(product.ratings)}
                    <span>(${product.numReviews})</span>
                </div>
                <div class="product-price">
                    $${product.price.toFixed(2)}
                    ${originalPrice}
                </div>
                <button class="product-button" data-id="${product._id}">Add to Cart</button>
            </div>
        </div>
    `;
}

function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function attachProductEventListeners() {
    // Add to Cart
    document.querySelectorAll('.product-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const product = products.find(p => p._id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });

    // Wishlist
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('.wishlist-btn').dataset.id;
            const product = products.find(p => p._id === productId);
            if (product) {
                addToWishlist(product);
            }
        });
    });

    // Quick View
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('.quick-view-btn').dataset.id;
            const product = products.find(p => p._id === productId);
            if (product) {
                showQuickView(product);
            }
        });
    });
}

// Product Filters
function setupProductFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.dataset.filter;
            filterProducts(filter);
        });
    });
}

function filterProducts(filter) {
    let filteredProducts = products;
    
    if (filter === 'bestsellers') {
        filteredProducts = products.filter(p => p.bestseller);
    } else if (filter === 'new') {
        filteredProducts = products.filter(p => p.newArrival);
    } else if (filter === 'featured') {
        filteredProducts = products.filter(p => p.featured);
    }
    
    displayProducts(filteredProducts);
}

function filterByCategory(category) {
    const filteredProducts = products.filter(p => p.category === category);
    displayProducts(filteredProducts);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function handleSearch(query) {
    if (!query) return;
    
    const searchResults = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
    
    displayProducts(searchResults);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Cart Functions
function addToCart(product) {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item._id !== productId);
    saveCart();
    updateCartUI();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item._id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.images?.[0]?.url || 'https://via.placeholder.com/80'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <div class="quantity-btn minus" data-id="${item._id}">-</div>
                            <span>${item.quantity}</span>
                            <div class="quantity-btn plus" data-id="${item._id}">+</div>
                        </div>
                        <div class="remove-item" data-id="${item._id}">Remove</div>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners
            cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    const change = e.target.classList.contains('plus') ? 1 : -1;
                    updateCartQuantity(productId, change);
                });
            });
            
            cartItems.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    removeFromCart(e.target.dataset.id);
                });
            });
        }
    }
    
    if (cartSubtotal && cartTotal) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.textContent = `$${subtotal.toFixed(2)}`;
    }
}

// Wishlist Functions
function addToWishlist(product) {
    const existingItem = wishlist.find(item => item._id === product._id);
    
    if (existingItem) {
        showToast('Product already in wishlist!');
        return;
    }
    
    wishlist.push(product);
    saveWishlist();
    updateWishlistUI();
    showToast(`${product.name} added to wishlist!`);
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item._id !== productId);
    saveWishlist();
    updateWishlistUI();
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistUI() {
    const wishlistCount = document.querySelector('.wishlist-count');
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
    
    if (wishlistItems) {
        if (wishlist.length === 0) {
            wishlistItems.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Save your favorite products!</p>
                </div>
            `;
        } else {
            wishlistItems.innerHTML = wishlist.map(item => `
                <div class="wishlist-item">
                    <div class="wishlist-item-image">
                        <img src="${item.images?.[0]?.url || 'https://via.placeholder.com/80'}" alt="${item.name}">
                    </div>
                    <div class="wishlist-item-details">
                        <h4 class="wishlist-item-title">${item.name}</h4>
                        <p class="wishlist-item-price">$${item.price.toFixed(2)}</p>
                        <div class="wishlist-item-actions">
                            <button class="btn add-to-cart-from-wishlist" data-id="${item._id}">Add to Cart</button>
                            <button class="remove-wishlist-item" data-id="${item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners
            wishlistItems.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    const product = wishlist.find(p => p._id === productId);
                    if (product) {
                        addToCart(product);
                        removeFromWishlist(productId);
                    }
                });
            });
            
            wishlistItems.querySelectorAll('.remove-wishlist-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    removeFromWishlist(e.target.closest('.remove-wishlist-item').dataset.id);
                });
            });
        }
    }
}

// Quick View Modal
function showQuickView(product) {
    const quickViewContent = document.getElementById('quickViewContent');
    if (!quickViewContent) return;
    
    const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400x400';
    
    quickViewContent.innerHTML = `
        <div class="quick-view-image">
            <img src="${imageUrl}" alt="${product.name}">
        </div>
        <div class="quick-view-info">
            <span class="quick-view-category">${product.category}</span>
            <h2 class="quick-view-title">${product.name}</h2>
            <div class="quick-view-rating">
                ${createStarRating(product.ratings)}
                <span>(${product.numReviews} reviews)</span>
            </div>
            <div class="quick-view-price">
                $${product.price.toFixed(2)}
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <p class="quick-view-description">Experience the transformative power of our premium ${product.name.toLowerCase()}. Crafted with natural ingredients for radiant, healthy-looking skin.</p>
            <div class="quick-view-quantity">
                <label>Quantity:</label>
                <div class="quantity-selector">
                    <button class="qty-minus">-</button>
                    <span class="qty-value">1</span>
                    <button class="qty-plus">+</button>
                </div>
            </div>
            <div class="quick-view-actions">
                <button class="add-to-cart-btn" data-id="${product._id}">Add to Cart</button>
                <button class="buy-now-btn">Buy Now</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addToCartBtn = quickViewContent.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const qty = parseInt(quickViewContent.querySelector('.qty-value').textContent);
            for (let i = 0; i < qty; i++) {
                addToCart(product);
            }
            closeModal('quickViewModal');
        });
    }
    
    // Quantity selector
    const qtyMinus = quickViewContent.querySelector('.qty-minus');
    const qtyPlus = quickViewContent.querySelector('.qty-plus');
    const qtyValue = quickViewContent.querySelector('.qty-value');
    let qty = 1;
    
    qtyMinus?.addEventListener('click', () => {
        if (qty > 1) {
            qty--;
            qtyValue.textContent = qty;
        }
    });
    
    qtyPlus?.addEventListener('click', () => {
        qty++;
        qtyValue.textContent = qty;
    });
    
    document.getElementById('quickViewModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// Testimonial Slider
const testimonialContainer = document.getElementById('testimonialContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (testimonialContainer && prevBtn && nextBtn) {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.testimonial');
    
    function updateSlider() {
        testimonialContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    });
    
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    });
    
    // Auto slide
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }, 5000);
}

// Scroll Effects
function setupScrollEffects() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Here you would send to API
    console.log('Contact form:', { name, email, subject, message });
    
    showToast('Thank you for your message! We will get back to you soon.');
    e.target.reset();
}

// Newsletter
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Here you would send to API
    console.log('Newsletter signup:', email);
    
    showToast('Thank you for subscribing!');
    e.target.reset();
}

// Checkout
async function handleCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    if (!currentUser) {
        showLoginModal();
        showToast('Please login to checkout');
        return;
    }
    
    // Here you would create an order via API
    const order = {
        user: currentUser._id,
        orderItems: cart.map(item => ({
            product: item._id,
            name: item.name,
            qty: item.quantity,
            price: item.price,
            image: item.images?.[0]?.url
        })),
        itemsPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    console.log('Order:', order);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    
    // Close cart
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    
    showToast('Order placed successfully! Thank you for shopping with us.');
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// Responsive Nav
function handleResize() {
    const navLinks = document.querySelector('.nav-links');
    if (window.innerWidth > 768) {
        if (navLinks) navLinks.style.display = 'flex';
    } else {
        if (navLinks) navLinks.style.display = 'none';
    }
}

window.addEventListener('resize', handleResize);
handleResize();
