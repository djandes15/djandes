// Import configuration
const CONFIG = window.CONFIG;
const DEFAULT_DATA = window.DEFAULT_DATA;

// Application State
let appData = {
    ...DEFAULT_DATA,
    cart: {}, // Keranjang akan dimuat dari localStorage
    cartInfo: {}, // Tambahkan struktur untuk info tambahan (box, komponen)
    pagination: {
        currentPage: 1,
        productsPerPage: 20,
        gridColumns: 2 // Default mobile: 2 kolom
    },
    // TAMBAHKAN STATE FILTER - PERBAIKAN UTAMA
    activeFilter: {
        category: 'Semua',
        searchTerm: ''
    }
};

// Ekspos ke global agar bisa diakses printer.js
window.appData = appData;

// DOM Elements
let elements = {};

// =====================================================================
// INJECT CART PANEL — dijalankan di semua halaman (index, about, contact)
// =====================================================================
function injectCartPanel() {
    // Jika sudah ada cart-summary, skip (halaman index sudah punya)
    if (document.getElementById('cart-summary')) return;

    // Inject cart-summary
    const cartHTML = `
    <div class="cart-summary" id="cart-summary">
        <div class="cart-header">
            <h3>Keranjang Belanja</h3>
            <button class="close-cart" id="close-cart">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="cart-items" id="cart-items">
            <!-- Cart items will be dynamically added here -->
        </div>
        <div class="cart-total" id="cart-total">Total: Rp 0</div>
        <button class="checkout-btn" id="checkout-btn">Checkout Pesanan</button>
    </div>

    <div class="checkout-modal" id="checkout-modal">
        <div class="checkout-form" id="checkout-form">
            <div class="checkout-header">
                <h3>Checkout Pesanan</h3>
                <button class="close-checkout" id="close-checkout">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <label for="customer-name">Nama Pemesan *</label>
                <input type="text" id="customer-name" class="form-control" placeholder="Masukkan nama lengkap" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="pickup-date">Tanggal Pengambilan *</label>
                    <input type="date" id="pickup-date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="pickup-time">Jam Pengambilan *</label>
                    <input type="time" id="pickup-time" class="form-control" required>
                </div>
            </div>
            <div class="form-group">
                <label for="customer-note">Catatan Tambahan (Opsional)</label>
                <textarea id="customer-note" class="form-control" placeholder="Masukkan catatan atau instruksi khusus (opsional)" rows="2" style="font-family: inherit; font-size: 0.95rem; resize: vertical;"></textarea>
            </div>
            <div class="form-group">
                <label>Detail Pesanan:</label>
                <div id="checkout-items" style="background: var(--light-color); padding: 16px; border-radius: 8px; margin-top: 8px; font-size: 0.9rem;">
                    <!-- Order items will be dynamically added here -->
                </div>
            </div>
            <button class="checkout-btn" id="confirm-checkout">
                <i class="fab fa-whatsapp"></i> Kirim ke WhatsApp
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', cartHTML);

    // Inject whatsapp-float jika belum ada
    if (!document.getElementById('whatsapp-float')) {
        document.body.insertAdjacentHTML('beforeend', `
        <a class="whatsapp-float" id="whatsapp-float" href="#" target="_blank">
            <i class="fab fa-whatsapp"></i>
        </a>`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    injectCartPanel();   // Inject cart panel ke semua halaman sebelum init
    initializeElements();
    initializeApp();
    setupEventListeners();
    preloadCriticalImages(); // Preload images penting


    // Auto-refresh data every 5 minutes (Supabase sangat efisien)
    setInterval(async () => {
        try {
            await loadDataFromSupabase();
            renderSite();
        } catch (error) {
            console.error('Failed to update data:', error);
        }
    }, 300000);

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            initializeApp();
        }
    });
});

// Initialize DOM elements
function initializeElements() {
    elements = {
        siteTitle: document.getElementById('site-title'),
        siteDescription: document.getElementById('site-description'),
        siteLogo: document.getElementById('site-logo'),
        socialIcons: document.getElementById('social-icons'),
        categoryFilter: document.getElementById('category-filter'),
        productsGrid: document.getElementById('products-grid'),
        cartSummary: document.getElementById('cart-summary'),
        cartItems: document.getElementById('cart-items'),
        cartTotal: document.getElementById('cart-total'),
        checkoutBtn: document.getElementById('checkout-btn'),
        closeCart: document.getElementById('close-cart'),
        whatsappFloat: document.getElementById('whatsapp-float'),
        searchInput: document.getElementById('search-input'),
        imageModal: document.getElementById('image-modal'),
        modalImage: document.getElementById('modal-image'),
        closeModal: document.getElementById('close-modal'),
        checkoutModal: document.getElementById('checkout-modal'),
        closeCheckout: document.getElementById('close-checkout'),
        checkoutForm: document.getElementById('checkout-form'),
        customerName: document.getElementById('customer-name'),
        pickupDate: document.getElementById('pickup-date'),
        pickupTime: document.getElementById('pickup-time'),
        customerNote: document.getElementById('customer-note'),
        confirmCheckout: document.getElementById('confirm-checkout'),
        checkoutItems: document.getElementById('checkout-items'),
        pagination: document.getElementById('pagination'),
        paginationInfo: document.getElementById('pagination-info'),
        productsCount: document.getElementById('products-count'),
        layoutControls: document.getElementById('layout-controls'),
        grid2Btn: document.getElementById('grid-2-btn'),
        grid3Btn: document.getElementById('grid-3-btn'),
        grid4Btn: document.getElementById('grid-4-btn'),
        descriptionModal: document.getElementById('description-modal'),
        descriptionModalTitle: document.getElementById('description-modal-title'),
        descriptionModalText: document.getElementById('description-modal-text'),
        closeDescriptionModal: document.getElementById('close-description-modal'),
        navCartToggle: document.getElementById('nav-cart-toggle'),
        navCartCount: document.getElementById('nav-cart-count'),

        // =================================================================================
        // ELEMEN MODAL BARU
        // =================================================================================
        boxSelectionModal: document.getElementById('box-selection-modal'),
        boxOptionsContainer: document.getElementById('box-options-container'),
        snackBoxModal: document.getElementById('snack-box-modal'),
        snackBoxComponents: document.getElementById('snack-box-components'),
        snackBoxSelectedCount: document.getElementById('snack-box-selected-count'),
        snackBoxConfirmBtn: document.getElementById('snack-box-confirm-btn'),
        closeBoxSelection: document.getElementById('close-box-selection'),
        closeSnackBox: document.getElementById('close-snack-box')
    };
}

// --- IMAGE OPTIMIZATION FUNCTIONS ---

// Fungsi optimasi URL gambar.
// - URL ImageKit lama: tambahkan parameter transformasi (?tr=)
// - URL Supabase (file sudah WebP terkompresi saat upload): kembalikan bersih
// - URL lain / fallback: dikembalikan apa adanya
function getOptimizedImageKitUrl(originalUrl, options = {}) {
    if (!originalUrl || originalUrl === CONFIG.DEFAULT_IMAGE) {
        return originalUrl;
    }

    // Backward-compatible: URL ImageKit lama → terapkan transformasi
    if (originalUrl.includes('ik.imagekit.io')) {
        const defaultOptions = { width: 600, quality: 80, format: 'auto', compression: 'fast' };
        const config = { ...defaultOptions, ...options };
        const baseUrl = originalUrl.split('?')[0];
        const params = [
            `w-${config.width}`,
            `q-${config.quality}`,
            `f-${config.format}`,
            `c-${config.compression}`
        ].join(',');
        return `${baseUrl}?tr=${params}`;
    }

    // URL Supabase: gambar sudah dikompresi ke WebP saat upload → kembalikan bersih
    return originalUrl.split('?')[0];
}

// Optimasi untuk different use cases
function getProductImageUrls(product) {
    return {
        thumbnail: getOptimizedImageKitUrl(product.image, CONFIG.IMAGEKIT_OPTIONS.THUMBNAIL),
        gallery: product.images ? product.images.map(img =>
            getOptimizedImageKitUrl(img, CONFIG.IMAGEKIT_OPTIONS.GALLERY)
        ) : [getOptimizedImageKitUrl(product.image, CONFIG.IMAGEKIT_OPTIONS.GALLERY)]
    };
}

// Optimasi URL gambar untuk opsi Box
function getBoxImageUrls(boxOption) {
    let additionalImages = [];
    if (boxOption.gambar_tambahan) {
        if (Array.isArray(boxOption.gambar_tambahan)) {
            additionalImages = boxOption.gambar_tambahan;
        } else if (typeof boxOption.gambar_tambahan === 'string') {
            try {
                additionalImages = JSON.parse(boxOption.gambar_tambahan);
            } catch (e) {
                additionalImages = [];
            }
        }
    }

    // Gabungkan gambar utama + gambar tambahan
    const allImages = [];
    if (boxOption.gambar) allImages.push(boxOption.gambar);
    additionalImages.forEach(img => {
        if (img && !allImages.includes(img)) allImages.push(img);
    });

    if (allImages.length === 0) {
        allImages.push(CONFIG.DEFAULT_IMAGE);
    }

    return {
        thumbnail: getOptimizedImageKitUrl(boxOption.gambar || CONFIG.DEFAULT_IMAGE, CONFIG.IMAGEKIT_OPTIONS.THUMBNAIL),
        gallery: allImages.map(img => getOptimizedImageKitUrl(img, CONFIG.IMAGEKIT_OPTIONS.GALLERY))
    };
}

// Tampilkan modal gambar/galeri untuk Opsi Box
function showBoxGallery(boxOptionId) {
    const boxOption = appData.opsiBoxGlobal.find(b => b.id == boxOptionId);
    if (!boxOption) return;

    const imageUrls = getBoxImageUrls(boxOption);
    const images = imageUrls.gallery;
    let currentImageIndex = 0;

    showImageModal(images[currentImageIndex], boxOption.nama);

    if (images.length > 1) {
        addGalleryNavigation(images, currentImageIndex);
    }
}

// Ekspos ke global agar bisa diakses dari tag onclick HTML
window.showBoxGallery = showBoxGallery;


// Preload critical images (logo + 4 produk pertama)
function preloadCriticalImages() {
    // Preload logo
    if (appData.siteSettings.logo) {
        const logoUrl = getOptimizedImageKitUrl(appData.siteSettings.logo, CONFIG.IMAGEKIT_OPTIONS.LOGO);
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = logoUrl;
        link.as = 'image';
        document.head.appendChild(link);
    }

    // Preload first few product images (sekarang mencakup URL Supabase juga)
    appData.products.slice(0, 4).forEach(product => {
        const imageUrl = getOptimizedImageKitUrl(product.image, CONFIG.IMAGEKIT_OPTIONS.THUMBNAIL);
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = imageUrl;
        link.as = 'image';
        document.head.appendChild(link);
    });
}

// --- CART PERSISTENCE FUNCTIONS ---
function saveCartToStorage() {
    localStorage.setItem('djandes_cart', JSON.stringify(appData.cart));
    localStorage.setItem('djandes_cartInfo', JSON.stringify(appData.cartInfo));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('djandes_cart');
    if (savedCart) {
        try {
            return JSON.parse(savedCart);
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            return {};
        }
    }
    return {};
}

function loadCartInfoFromStorage() {
    const savedCartInfo = localStorage.getItem('djandes_cartInfo');
    if (savedCartInfo) {
        try {
            return JSON.parse(savedCartInfo);
        } catch (e) {
            console.error('Error parsing cartInfo from localStorage:', e);
            return {};
        }
    }
    return {};
}

// --- DATA LOADING FUNCTIONS (NOW USING SUPABASE) ---
async function loadDataFromSupabase() {
    try {
        const client = window.supabaseClient;

        // Load data secara paralel agar sangat cepat
        const [
            { data: products },
            { data: categories },
            { data: boxOptions },
            { data: configs }
        ] = await Promise.all([
            client.from('products').select('*').order('created_at', { ascending: false }),
            client.from('categories').select('name').order('name'),
            client.from('box_options').select('*'),
            client.from('site_configs').select('*')
        ]);

        // Mapping hasil ke appData
        if (products) {
            // Mapping images if needed (ensure backward compatibility)
            appData.products = products.map(p => ({
                ...p,
                image: (p.images && p.images.length > 0) ? p.images[0] : p.image
            }));
        }

        if (categories) {
            appData.categories = ['Semua', ...categories.map(c => c.name)];
        }

        if (boxOptions) appData.opsiBoxGlobal = boxOptions;

        if (configs) {
            configs.forEach(config => {
                if (config.id === 'site_settings') appData.siteSettings = config.data;
                if (config.id === 'social_media') appData.socialMedia = config.data;
                if (config.id === 'contact_info') appData.contactInfo = config.data;
                if (config.id === 'about_content') appData.aboutContent = config.data;
            });
        }

        // Ekspos ke global agar tetap sinkron
        window.appData = appData;

    } catch (error) {
        console.error('Gagal memuat data dari Supabase:', error);
        throw error;
    }
}

// Fallback to single file loading
async function loadDataFromGitHub() {
    const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/katalog.json`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = atob(data.content);
    const newData = JSON.parse(content);

    const currentCart = appData.cart;
    const currentCartInfo = appData.cartInfo;
    const currentPagination = appData.pagination;
    const currentFilter = appData.activeFilter; // Simpan filter yang aktif
    appData = { ...newData, cart: currentCart, cartInfo: currentCartInfo, pagination: currentPagination, activeFilter: currentFilter };
}

function loadDefaultData() {
    const currentCart = appData.cart;
    const currentCartInfo = appData.cartInfo;
    const currentPagination = appData.pagination;
    const currentFilter = appData.activeFilter; // Simpan filter yang aktif
    appData = { ...DEFAULT_DATA, cart: currentCart, cartInfo: currentCartInfo, pagination: currentPagination, activeFilter: currentFilter };
}

// Initialize the application
async function initializeApp() {
    try {
        await loadDataFromSupabase();
    } catch (error) {
        console.error('Failed to load Supabase data, using local fallback:', error);
        loadDefaultData();
    }

    appData.cart = loadCartFromStorage();
    appData.cartInfo = loadCartInfoFromStorage();
    renderSite();
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Render the site with current data
function renderSite() {
    if (elements.siteTitle) elements.siteTitle.textContent = appData.siteSettings.title;
    if (elements.siteDescription) elements.siteDescription.textContent = appData.siteSettings.description;

    if (elements.siteLogo) {
        if (appData.siteSettings.logo) {
            const optimizedLogo = getOptimizedImageKitUrl(appData.siteSettings.logo, CONFIG.IMAGEKIT_OPTIONS.LOGO);
            elements.siteLogo.src = optimizedLogo;
            elements.siteLogo.style.display = 'block';
        } else {
            elements.siteLogo.style.display = 'none';
        }
    }

    renderSocialIcons();
    updateWhatsAppFloat();
    renderCategories();
    renderProducts(); // PERBAIKAN: Sekarang menggunakan filter aktif
    updateCart();
    updatePagination();
    updateProductsCount();

    const today = new Date().toISOString().split('T')[0];
    if (elements.pickupDate) {
        elements.pickupDate.min = today;
    }

    if (window.location.pathname.includes('about.html') || document.getElementById('about-title')) {
        initializeAboutPage();
    }

    if (window.location.pathname.includes('contact.html') || document.getElementById('contact-phone')) {
        initializeContactPage();
    }
}

// Render social media icons
function renderSocialIcons() {
    const socialPlatforms = [
        { key: 'facebook', icon: 'fab fa-facebook-f', name: 'Facebook' },
        { key: 'instagram', icon: 'fab fa-instagram', name: 'Instagram' },
        { key: 'twitter', icon: 'fab fa-twitter', name: 'Twitter' },
        { key: 'tiktok', icon: 'fab fa-tiktok', name: 'TikTok' }
    ];

    // Buat HTML icon sosial media
    let iconsHTML = '';
    socialPlatforms.forEach(platform => {
        if (appData.socialMedia[platform.key]) {
            iconsHTML += `<a href="${appData.socialMedia[platform.key]}" target="_blank"><i class="${platform.icon}"></i></a>`;
        }
    });

    // Isi container utama (id="social-icons") — ada di hero index.html & content contact.html
    const socialIconsContainer = elements.socialIcons;
    if (socialIconsContainer) {
        socialIconsContainer.innerHTML = iconsHTML;
    }

    // Isi footer .social-icons (untuk index.html — hindari duplikasi dengan container utama)
    const footerSocialIcons = document.querySelector('footer .social-icons');
    if (footerSocialIcons && footerSocialIcons !== socialIconsContainer) {
        footerSocialIcons.innerHTML = iconsHTML;
    }

    // Isi footer-social-icons (untuk about.html & contact.html footer)
    const footerSocialIconsById = document.getElementById('footer-social-icons');
    if (footerSocialIconsById) {
        footerSocialIconsById.innerHTML = iconsHTML;
    }
}


// Update WhatsApp floating button
function updateWhatsAppFloat() {
    if (!elements.whatsappFloat) return;

    const whatsappNumber = appData.contactInfo.whatsapp;
    elements.whatsappFloat.href = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
}

// Render categories
function renderCategories() {
    const categoryContainer = elements.categoryFilter;
    if (!categoryContainer) return;

    categoryContainer.innerHTML = '';

    appData.categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category;
        // PERBAIKAN: Set active berdasarkan filter yang aktif
        if (category === appData.activeFilter.category) {
            button.classList.add('active');
        }
        categoryContainer.appendChild(button);
    });
}

// PERBAIKAN BESAR: Render products dengan filter yang dipertahankan
function renderProducts(filteredProducts = null) {
    // GUNAKAN FILTER YANG AKTIF JIKA TIDAK ADA PARAMETER
    let productsToRender = filteredProducts;

    if (!productsToRender) {
        // TERAPKAN FILTER YANG AKTIF
        productsToRender = appData.products.filter(product => {
            const matchesCategory = appData.activeFilter.category === 'Semua' ||
                product.category === appData.activeFilter.category;
            const matchesSearch = !appData.activeFilter.searchTerm ||
                product.name.toLowerCase().includes(appData.activeFilter.searchTerm) ||
                product.description.toLowerCase().includes(appData.activeFilter.searchTerm) ||
                product.category.toLowerCase().includes(appData.activeFilter.searchTerm);
            return matchesCategory && matchesSearch;
        });
    }

    const productsContainer = elements.productsGrid;
    if (!productsContainer) return;

    productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>Tidak ada produk ditemukan</h3>
                <p>Coba gunakan kata kunci lain atau filter yang berbeda</p>
            </div>
        `;
        return;
    }

    const { currentPage, productsPerPage } = appData.pagination;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = productsToRender.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
        const imageUrls = getProductImageUrls(product);
        const optimizedImage = imageUrls.thumbnail;
        const hasMultipleImages = product.images && product.images.length > 1;

        // Cek jika produk ada di keranjang (logika lebih kompleks)
        const isInCart = isProductInCart(product.id);

        // Badge untuk status stok
        const stockStatus = product.status_stok === 'habis' ? 'out-of-stock' : '';

        // Badge untuk minimal order
        const minOrderBadge = product.minimal_order > 1 ?
            `<span class="min-order-badge">Minim order : ${product.minimal_order}</span>` : '';

        // Badge untuk tipe produk
        const typeBadge = product.tipe_produk === 'paket_snack_box' ?
            '<span class="type-badge">Paket</span>' : '';

        const productCard = document.createElement('div');
        productCard.className = `product-card ${stockStatus}`;
        productCard.innerHTML = `
            <div class="product-image-container" data-product-id="${product.id}">
                <img src="${optimizedImage}" 
                     alt="${product.name}" 
                     class="product-image"
                     loading="lazy"
                     onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                <div class="category-badge">${product.category}</div>
                ${hasMultipleImages ?
                '<div class="gallery-badge"><i class="fas fa-clone"></i></div>' :
                ''
            }
                ${product.status_stok === 'habis' ?
                '<div class="out-of-stock-overlay">Terjual</div>' :
                ''
            }
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-badges">
                    ${minOrderBadge}
                    ${typeBadge}
                </div>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p class="product-description" data-description="${product.description.replace(/"/g, '&quot;')}" data-product-name="${product.name}">${product.description}</p>
                <div class="product-actions">
                    <button class="add-to-cart ${isInCart ? 'delete-mode' : ''}" data-id="${product.id}" ${product.status_stok === 'habis' ? 'disabled' : ''}>
                        ${isInCart ? 'Hapus' : 'Tambah'}
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Cek apakah produk sudah ada di keranjang
function isProductInCart(productId) {
    // Cek di cart biasa
    if (appData.cart[productId] && appData.cart[productId] > 0) {
        return true;
    }

    // Cek di cartInfo untuk produk dengan box
    if (appData.cartInfo) {
        for (const key in appData.cartInfo) {
            if (appData.cartInfo[key].productId === productId && appData.cart[key] && appData.cart[key] > 0) {
                return true;
            }
        }
    }

    return false;
}

// Update cart dengan logika baru
function updateCart() {
    const cartItems = elements.cartItems;
    if (!cartItems) return;

    cartItems.innerHTML = '';

    let totalItems = 0;
    let totalPrice = 0;

    // Proses item keranjang biasa
    Object.keys(appData.cart).forEach(key => {
        const quantity = appData.cart[key];
        if (quantity <= 0) return;

        let product, boxOptionName = '', boxOptionPrice = 0, components = [];

        // Cek apakah ini item dengan box option
        if (appData.cartInfo && appData.cartInfo[key]) {
            const cartInfo = appData.cartInfo[key];
            product = appData.products.find(p => p.id === cartInfo.productId);
            boxOptionName = cartInfo.boxOptionName || '';
            boxOptionPrice = cartInfo.boxOptionPrice || 0;
            components = cartInfo.components || [];
        } else {
            // Item biasa
            product = appData.products.find(p => p.id == key);
        }

        if (!product) return;

        // Hitung harga total (harga produk + harga box) x quantity
        const itemTotal = (product.price + boxOptionPrice) * quantity;
        totalItems += quantity;
        totalPrice += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // Tampilkan nama komponen jika ada
        let componentsInfo = '';
        if (components.length > 0) {
            const componentNames = components.map(id => {
                const componentProduct = appData.products.find(p => p.id === id);
                return componentProduct ? componentProduct.name : '';
            }).filter(name => name).join(', ');

            if (componentNames) {
                componentsInfo = `<div class="cart-item-components" style="font-size: 0.8rem; color: #aaa; margin-top: 4px;">kue: ${componentNames}</div>`;
            }
        }

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${product.name}</div>
                ${boxOptionName ? `<div class="cart-item-box" style="font-size: 0.8rem; color: #FFD700; margin-top: 2px;">Box: ${boxOptionName} (+Rp ${boxOptionPrice.toLocaleString('id-ID')})</div>` : ''}
                ${componentsInfo}
                <div class="cart-item-price">Rp ${(product.price + boxOptionPrice).toLocaleString('id-ID')} x ${quantity}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-quantity-btn minus" data-key="${key}">-</button>
                <input type="number" class="cart-quantity-input" data-key="${key}" value="${quantity}" min="1" max="9999">
                <button class="cart-quantity-btn plus" data-key="${key}">+</button>
                <button class="cart-delete-btn" data-key="${key}" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    if (elements.navCartCount) {
        elements.navCartCount.textContent = totalItems;
        elements.navCartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    if (totalItems > 0 && elements.cartSummary) {
        if (elements.cartTotal) {
            elements.cartTotal.textContent = `Total: Rp ${totalPrice.toLocaleString('id-ID')}`;
        }
        if (elements.checkoutBtn) {
            elements.checkoutBtn.textContent = `Checkout (${totalItems} items)`;
        }
        // Cart summary TIDAK otomatis terbuka saat ada item
    } else if (elements.cartSummary) {
        elements.cartSummary.classList.remove('active');
    }

    updateProductButtons();
    updateCheckoutItems();
}

// PERBAIKAN BESAR: Update pagination dengan filter yang dipertahankan
function updatePagination() {
    const paginationContainer = elements.pagination;
    const paginationInfo = elements.paginationInfo;
    if (!paginationContainer || !paginationInfo) return;

    const { currentPage, productsPerPage } = appData.pagination;

    // PERBAIKAN: HITUNG TOTAL PRODUK BERDASARKAN FILTER AKTIF
    let totalProducts = appData.products.length;
    let productsToRender = appData.products;

    // TERAPKAN FILTER UNTUK MENGHITUNG TOTAL YANG BENAR
    if (appData.activeFilter.category !== 'Semua' || appData.activeFilter.searchTerm) {
        productsToRender = appData.products.filter(product => {
            const matchesCategory = appData.activeFilter.category === 'Semua' ||
                product.category === appData.activeFilter.category;
            const matchesSearch = !appData.activeFilter.searchTerm ||
                product.name.toLowerCase().includes(appData.activeFilter.searchTerm) ||
                product.description.toLowerCase().includes(appData.activeFilter.searchTerm) ||
                product.category.toLowerCase().includes(appData.activeFilter.searchTerm);
            return matchesCategory && matchesSearch;
        });
        totalProducts = productsToRender.length;
    }

    const totalPages = Math.ceil(totalProducts / productsPerPage);

    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            appData.pagination.currentPage = currentPage - 1;
            renderProducts();
            updatePagination();
            updateProductsCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = '1';
        firstButton.addEventListener('click', () => {
            appData.pagination.currentPage = 1;
            renderProducts();
            updatePagination();
            updateProductsCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(firstButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            appData.pagination.currentPage = i;
            renderProducts();
            updatePagination();
            updateProductsCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(pageButton);
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }

        const lastButton = document.createElement('button');
        lastButton.textContent = totalPages;
        lastButton.addEventListener('click', () => {
            appData.pagination.currentPage = totalPages;
            renderProducts();
            updatePagination();
            updateProductsCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(lastButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            appData.pagination.currentPage = currentPage + 1;
            renderProducts();
            updatePagination();
            updateProductsCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(nextButton);

    // PERBAIKAN: Update pagination info dengan jumlah produk yang difilter
    const startProduct = (currentPage - 1) * productsPerPage + 1;
    const endProduct = Math.min(currentPage * productsPerPage, totalProducts);

    paginationInfo.textContent = `Menampilkan ${startProduct}-${endProduct} dari ${totalProducts} produk`;
}

// PERBAIKAN: Update products count dengan filter yang dipertahankan
function updateProductsCount() {
    const productsCount = elements.productsCount;
    if (!productsCount) return;

    const { currentPage, productsPerPage } = appData.pagination;

    // PERBAIKAN: Hitung total produk berdasarkan filter aktif
    let totalProducts = appData.products.length;
    if (appData.activeFilter.category !== 'Semua' || appData.activeFilter.searchTerm) {
        const filteredProducts = appData.products.filter(product => {
            const matchesCategory = appData.activeFilter.category === 'Semua' ||
                product.category === appData.activeFilter.category;
            const matchesSearch = !appData.activeFilter.searchTerm ||
                product.name.toLowerCase().includes(appData.activeFilter.searchTerm) ||
                product.description.toLowerCase().includes(appData.activeFilter.searchTerm) ||
                product.category.toLowerCase().includes(appData.activeFilter.searchTerm);
            return matchesCategory && matchesSearch;
        });
        totalProducts = filteredProducts.length;
    }

    const startProduct = (currentPage - 1) * productsPerPage + 1;
    const endProduct = Math.min(currentPage * productsPerPage, totalProducts);

    productsCount.textContent = `Menampilkan ${startProduct}-${endProduct} dari ${totalProducts} produk`;
}

// Setup grid layout controls
function setupGridLayoutControls() {
    if (!elements.grid2Btn || !elements.grid3Btn || !elements.grid4Btn) return;

    const setActiveLayout = (columns) => {
        elements.grid2Btn.classList.remove('active');
        elements.grid3Btn.classList.remove('active');
        elements.grid4Btn.classList.remove('active');

        if (columns === 2) elements.grid2Btn.classList.add('active');
        if (columns === 3) elements.grid3Btn.classList.add('active');
        if (columns === 4) elements.grid4Btn.classList.add('active');

        appData.pagination.gridColumns = columns;

        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }

        renderProducts();
    };

    elements.grid2Btn.addEventListener('click', () => setActiveLayout(2));
    elements.grid3Btn.addEventListener('click', () => setActiveLayout(3));
    elements.grid4Btn.addEventListener('click', () => setActiveLayout(4));

    const screenWidth = window.innerWidth;
    let initialColumns = 2;

    if (screenWidth >= 1024) {
        initialColumns = 4;
    } else if (screenWidth >= 768) {
        initialColumns = 3;
    }

    setActiveLayout(initialColumns);

    window.addEventListener('resize', () => {
        const newScreenWidth = window.innerWidth;
        let newColumns = 2;

        if (newScreenWidth >= 1024) {
            newColumns = 4;
        } else if (newScreenWidth >= 768) {
            newColumns = 3;
        }

        if (appData.pagination.gridColumns !== newColumns) {
            setActiveLayout(newColumns);
        }
    });
}

// PERBAIKAN: Setup event listeners dengan filter yang dipertahankan
function setupEventListeners() {
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('click', function (e) {
            if (e.target.classList.contains('category-btn')) {
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');

                const category = e.target.dataset.category;
                appData.pagination.currentPage = 1;
                appData.activeFilter.category = category; // SIMPAN FILTER AKTIF
                appData.activeFilter.searchTerm = ''; // Reset search

                // Reset search input jika ada
                if (elements.searchInput) {
                    elements.searchInput.value = '';
                }

                filterProducts(category);
            }
        });
    }

    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            appData.pagination.currentPage = 1;
            appData.activeFilter.searchTerm = searchTerm; // SIMPAN FILTER SEARCH
            filterProductsBySearch(searchTerm);
        });
    }

    if (elements.productsGrid) {
        elements.productsGrid.addEventListener('click', function (e) {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                e.stopPropagation();
                const productId = e.target.dataset.id;
                if (productId) {
                    handleAddDeleteButton(productId);
                }
            }
            else if (e.target.classList.contains('product-description')) {
                e.preventDefault();
                e.stopPropagation();
                const description = e.target.dataset.description;
                const productName = e.target.dataset.productName;
                if (description) {
                    showDescriptionModal(productName, description);
                }
            }
        });
    }

    if (elements.cartItems) {
        elements.cartItems.addEventListener('click', function (e) {
            const key = e.target.dataset.key || e.target.closest('[data-key]')?.dataset.key;

            if (!key) return;

            if (e.target.classList.contains('plus') || e.target.closest('.plus')) {
                addToCartByKey(key);
            } else if (e.target.classList.contains('minus') || e.target.closest('.minus')) {
                removeFromCartByKey(key);
            } else if (e.target.classList.contains('cart-delete-btn') || e.target.closest('.cart-delete-btn')) {
                deleteFromCartByKey(key);
            }
        });

        // Event listener untuk input quantity secara langsung
        elements.cartItems.addEventListener('change', function (e) {
            if (e.target.classList.contains('cart-quantity-input')) {
                const key = e.target.dataset.key;
                const newQty = parseInt(e.target.value);
                updateCartQtyByKey(key, newQty);
            }
        });
    }

    if (elements.productsGrid) {
        elements.productsGrid.addEventListener('click', function (e) {
            if (e.target.closest('.product-image-container') && !e.target.closest('.category-badge') && !e.target.closest('.gallery-badge')) {
                const productId = e.target.closest('.product-image-container').dataset.productId;
                showProductGallery(productId);
            }
        });
    }

    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeImageModal);
    }
    if (elements.imageModal) {
        elements.imageModal.addEventListener('click', function (e) {
            if (e.target === elements.imageModal) {
                closeImageModal();
            }
        });
    }

    if (elements.closeDescriptionModal) {
        elements.closeDescriptionModal.addEventListener('click', closeDescriptionModal);
    }
    if (elements.descriptionModal) {
        elements.descriptionModal.addEventListener('click', function (e) {
            if (e.target === elements.descriptionModal) {
                closeDescriptionModal();
            }
        });
    }

    if (elements.closeCart) {
        elements.closeCart.addEventListener('click', function () {
            elements.cartSummary.classList.remove('active');
        });
    }

    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', function () {
            elements.cartSummary.classList.remove('active');
            showCheckoutModal();
        });
    }

    if (elements.closeCheckout) {
        elements.closeCheckout.addEventListener('click', closeCheckoutModal);
    }
    if (elements.checkoutModal) {
        elements.checkoutModal.addEventListener('click', function (e) {
            if (e.target === elements.checkoutModal) {
                closeCheckoutModal();
            }
        });
    }

    if (elements.confirmCheckout) {
        elements.confirmCheckout.addEventListener('click', function () {
            processCheckout();
        });
    }

    if (elements.navCartToggle) {
        elements.navCartToggle.addEventListener('click', function (e) {
            // Hanya tampilkan cart panel jika elemen cart-summary ada (halaman index)
            // Halaman about/contact akan navigasi normal ke index.html
            if (elements.cartSummary) {
                e.preventDefault();
                toggleCartFromNavbar();
            }
        });
    }

    // ===== EVENT LISTENER PRINTER =====
    const connectPrinterBtn = document.getElementById('connect-printer-btn');
    if (connectPrinterBtn) {
        connectPrinterBtn.addEventListener('click', function () {
            if (window.DjandesPrinter) {
                window.DjandesPrinter.connect();
            }
        });
    }

    const printStrukBtn = document.getElementById('print-struk-btn');
    if (printStrukBtn) {
        printStrukBtn.addEventListener('click', function () {
            if (window.DjandesPrinter) {
                window.DjandesPrinter.print();
            }
        });
    }
    // ===== END EVENT LISTENER PRINTER =====

    // =================================================================================
    // EVENT LISTENER UNTUK MODAL BARU
    // =================================================================================
    if (elements.boxSelectionModal) {
        elements.boxSelectionModal.addEventListener('click', function (e) {
            if (e.target === elements.boxSelectionModal) {
                closeBoxSelectionModal();
            }
        });
    }

    if (elements.snackBoxModal) {
        elements.snackBoxModal.addEventListener('click', function (e) {
            if (e.target === elements.snackBoxModal) {
                closeSnackBoxModal();
            }
        });
    }

    if (elements.snackBoxComponents) {
        elements.snackBoxComponents.addEventListener('change', updateSnackBoxSelection);
    }

    if (elements.snackBoxConfirmBtn) {
        elements.snackBoxConfirmBtn.addEventListener('click', confirmSnackBoxSelection);
    }

    if (elements.closeBoxSelection) {
        elements.closeBoxSelection.addEventListener('click', closeBoxSelectionModal);
    }

    if (elements.closeSnackBox) {
        elements.closeSnackBox.addEventListener('click', closeSnackBoxModal);
    }

    setupGridLayoutControls();
}

// =================================================================================
// FUNGSI-FUNGSI MODAL BARU YANG DIPERBAIKI
// =================================================================================

// Fungsi untuk menampilkan modal pilihan box dengan quantity controls
// Fungsi untuk menampilkan modal pilihan box dengan quantity controls
function showBoxSelectionModal(productId, callback) {
    const product = appData.products.find(p => p.id == productId);
    if (!product) return;

    const applicableBoxOptions = appData.opsiBoxGlobal.filter(boxOption =>
        boxOption.kategori_berlaku.includes(product.category)
    );

    if (applicableBoxOptions.length === 0) {
        showNotification('Tidak ada opsi box yang tersedia untuk produk ini', 'warning');
        callback(null, 1);
        return;
    }

    const title = document.getElementById('box-selection-title');
    const container = document.getElementById('box-options-container');
    const qtyInput = document.getElementById('box-qty-input');
    const minusBtn = document.getElementById('box-qty-minus');
    const plusBtn = document.getElementById('box-qty-plus');
    const searchInput = document.getElementById('box-search-input');
    const confirmBtn = document.getElementById('box-confirm-btn');

    title.textContent = 'Pilih Box untuk: ' + product.name;
    qtyInput.value = product.minimal_order || 1;
    qtyInput.min = product.minimal_order || 1;
    searchInput.value = '';

    function drawBoxGrid(boxes) {
        if (boxes.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--accent-color); padding: 30px; font-size: 0.9rem;">Pencarian tidak ditemukan</div>`;
            return;
        }

        container.innerHTML = boxes.map(boxOption => {
            const optimizedImage = getOptimizedImageKitUrl(boxOption.gambar, { width: 250, quality: 75 });
            return `
                <div class="box-option" data-box-id="${boxOption.id}">
                    <div class="box-option-image">
                        <img src="${optimizedImage}" alt="${boxOption.nama}" onerror="this.src='${CONFIG.DEFAULT_IMAGE}'" 
                             style="cursor: zoom-in;" 
                             onclick="event.stopPropagation(); window.showBoxGallery('${boxOption.id}')">
                    </div>
                    <div class="box-option-info">
                        <h4>${boxOption.nama}</h4>
                        <span class="box-option-price">+Rp ${boxOption.tambahan_harga.toLocaleString('id-ID')}</span>
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.box-option').forEach(el => {
            el.addEventListener('click', function () {
                container.querySelectorAll('.box-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });

        const first = container.querySelector('.box-option');
        if (first) first.classList.add('active');
    }

    drawBoxGrid(applicableBoxOptions);

    searchInput.oninput = function () {
        const keyword = this.value.toLowerCase().trim();
        const filtered = applicableBoxOptions.filter(box => box.nama.toLowerCase().includes(keyword));
        drawBoxGrid(filtered);
    };

    minusBtn.onclick = function () {
        let value = parseInt(qtyInput.value) || product.minimal_order || 1;
        const min = product.minimal_order || 1;
        if (value > min) {
            qtyInput.value = value - 1;
        }
    };

    plusBtn.onclick = function () {
        let value = parseInt(qtyInput.value) || product.minimal_order || 1;
        qtyInput.value = value + 1;
    };

    qtyInput.oninput = function () {
        let value = parseInt(this.value) || product.minimal_order || 1;
        const min = product.minimal_order || 1;
        if (value < min) {
            this.value = min;
            showNotification(`Minimal order untuk produk ini adalah ${min}`, 'warning');
        }
    };

    confirmBtn.onclick = function () {
        const activeCard = container.querySelector('.box-option.active');
        if (!activeCard) {
            showNotification('Silakan pilih salah satu opsi box terlebih dahulu', 'warning');
            return;
        }
        const boxId = activeCard.dataset.boxId;
        const boxOption = applicableBoxOptions.find(b => b.id == boxId);
        const qty = parseInt(qtyInput.value) || product.minimal_order || 1;

        callback(boxOption, qty);
        closeBoxSelectionModal();
    };

    elements.boxSelectionModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fungsi untuk menutup modal pilihan box
function closeBoxSelectionModal() {
    elements.boxSelectionModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Fungsi untuk menampilkan modal snack box dengan quantity controls
function showSnackBoxModal(productId, callback) {
    const product = appData.products.find(p => p.id == productId);
    if (!product || !product.komponen_paket) {
        showNotification('Produk snack box tidak memiliki konfigurasi kue', 'error');
        return;
    }

    const { produk_id_yang_boleh_dipilih, jumlah_wajib_pilih } = product.komponen_paket;

    const snackBoxComponents = elements.snackBoxComponents;
    snackBoxComponents.innerHTML = '';

    // Tambahkan quantity controls di bagian atas modal
    const quantityControls = document.createElement('div');
    quantityControls.className = 'modal-quantity-controls';
    quantityControls.innerHTML = `
        <div class="modal-quantity-section">
            <h4>Mau berapa (Box)?</h4>
            <div class="quantity-controls-centered">
                <button class="quantity-btn minus" id="snack-modal-minus">-</button>
                <input type="number" class="quantity-input" id="snack-modal-quantity-input" value="${product.minimal_order}" min="${product.minimal_order}" max="9999">
                <button class="quantity-btn plus" id="snack-modal-plus">+</button>
            </div>
            ${product.minimal_order > 1 ? `<p class="min-order-info">minimal order: ${product.minimal_order}</p>` : ''}
        </div>
    `;
    snackBoxComponents.appendChild(quantityControls);

    // Setup quantity controls event listeners
    const modalQuantityInput = document.getElementById('snack-modal-quantity-input');
    const modalMinusBtn = document.getElementById('snack-modal-minus');
    const modalPlusBtn = document.getElementById('snack-modal-plus');

    modalMinusBtn.addEventListener('click', function () {
        let value = parseInt(modalQuantityInput.value) || product.minimal_order;
        if (value > product.minimal_order) {
            modalQuantityInput.value = value - 1;
        }
    });

    modalPlusBtn.addEventListener('click', function () {
        let value = parseInt(modalQuantityInput.value) || product.minimal_order;
        if (value < 9999) {
            modalQuantityInput.value = value + 1;
        }
    });

    modalQuantityInput.addEventListener('input', function () {
        let value = parseInt(this.value) || product.minimal_order;
        if (value < product.minimal_order) {
            this.value = product.minimal_order;
            showNotification(`Minimal order untuk produk ini adalah ${product.minimal_order}`, 'warning');
        } else if (value > 9999) {
            this.value = 9999;
        }
    });



    // Buat opsi komponen
    const componentsGrid = document.createElement('div');
    componentsGrid.className = 'snack-box-components-grid';

    produk_id_yang_boleh_dipilih.forEach(componentId => {
        const componentProduct = appData.products.find(p => p.id === componentId);
        if (!componentProduct) return;

        const componentOption = document.createElement('div');
        componentOption.className = 'snack-box-component';
        componentOption.dataset.productId = componentId;

        const optimizedImage = getOptimizedImageKitUrl(componentProduct.image, { width: 100, quality: 60 });

        componentOption.innerHTML = `
            <div class="component-image">
                <img src="${optimizedImage}" alt="${componentProduct.name}" onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
            </div>
            <div class="component-info">
                <h4>${componentProduct.name}</h4>
                <p class="component-price">Rp ${componentProduct.price.toLocaleString('id-ID')}</p>
            </div>
            <div class="component-checkbox">
                <input type="checkbox" id="component-${componentId}" value="${componentId}">
            </div>
        `;

        componentsGrid.appendChild(componentOption);
    });

    snackBoxComponents.appendChild(componentsGrid);

    // Set judul dan informasi modal
    document.getElementById('snack-box-title').textContent = product.name;
    document.getElementById('snack-box-description').textContent = `Pilih ${jumlah_wajib_pilih} dari ${produk_id_yang_boleh_dipilih.length} daftar kue untuk isi dalam box`;

    // Reset counter dan setup event listeners untuk checkbox
    setupSnackBoxCheckboxListeners(product);

    // Simpan callback untuk digunakan saat konfirmasi
    window.snackBoxCallback = callback;
    window.snackBoxProduct = product;

    elements.snackBoxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Setup event listeners untuk checkbox komponen snack box - PERBAIKAN
function setupSnackBoxCheckboxListeners(product) {
    // Tunggu sebentar agar DOM selesai render
    setTimeout(() => {
        const checkboxes = elements.snackBoxComponents.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            // Hapus event listener lama jika ada
            checkbox.removeEventListener('change', checkbox._changeHandler);

            // Tambah event listener baru
            checkbox._changeHandler = function () {
                updateSnackBoxSelection(product);
            };
            checkbox.addEventListener('change', checkbox._changeHandler);
        });

        // Initial update
        updateSnackBoxSelection(product);
    }, 100);
}

// Fungsi untuk memperbarui pemilihan snack box - DIPERBAIKI
function updateSnackBoxSelection(product) {
    const checkedComponents = document.querySelectorAll('#snack-box-components input[type="checkbox"]:checked');
    const count = checkedComponents.length;
    const requiredCount = product.komponen_paket.jumlah_wajib_pilih;

    elements.snackBoxSelectedCount.textContent = `${count} item dipilih (wajib: ${requiredCount})`;

    // Aktifkan/nonaktifkan tombol konfirmasi
    elements.snackBoxConfirmBtn.disabled = count !== requiredCount;

    // Beri feedback visual
    if (count < requiredCount) {
        elements.snackBoxSelectedCount.style.color = '#FF6B6B';
    } else if (count > requiredCount) {
        elements.snackBoxSelectedCount.style.color = '#FFA500';
    } else {
        elements.snackBoxSelectedCount.style.color = '#4CAF50';
    }
}

// Fungsi untuk menutup modal snack box
function closeSnackBoxModal() {
    elements.snackBoxModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    window.snackBoxCallback = null;
    window.snackBoxProduct = null;
}

// Fungsi untuk mengkonfirmasi pemilihan snack box
function confirmSnackBoxSelection() {
    const checkedComponents = document.querySelectorAll('#snack-box-components input[type="checkbox"]:checked');
    const selectedComponentIds = Array.from(checkedComponents).map(input => parseInt(input.value));
    const quantity = parseInt(document.getElementById('snack-modal-quantity-input').value) || 1;
    const product = window.snackBoxProduct;

    // Validasi jumlah komponen yang dipilih
    const requiredCount = product.komponen_paket.jumlah_wajib_pilih;
    if (selectedComponentIds.length !== requiredCount) {
        showNotification(`Harus memilih tepat ${requiredCount} kue`, 'warning');
        return;
    }

    if (window.snackBoxCallback) {
        window.snackBoxCallback(selectedComponentIds, quantity);
    }

    closeSnackBoxModal();
}

// =================================================================================
// FUNGSI UTAMA TAMBAH KE KERANJANG YANG DIPERBAIKI
// =================================================================================

function handleAddDeleteButton(productId) {
    const product = appData.products.find(p => p.id == productId);
    if (!product) return;

    // Cek status stok
    if (product.status_stok === 'habis') {
        showNotification('Produk ini sedang habis stok', 'warning');
        return;
    }

    // Cek apakah produk sudah ada di keranjang (untuk fungsi hapus)
    const isInCart = isProductInCart(productId);

    // Jika sudah di keranjang, tampilkan konfirmasi hapus
    if (isInCart) {
        if (confirm('Hapus produk ini dari keranjang?')) {
            removeProductFromCart(productId);
            showNotification('Produk dihapus dari keranjang', 'success');
        }
        return;
    }

    // Jika belum di keranjang, buka modal sesuai tipe produk
    window.currentProductId = productId;

    // Cek minimal order
    if (product.minimal_order > 1) {
        showNotification(`Minimal order untuk produk ini adalah ${product.minimal_order}`, 'info');
    }

    // Jika produk tipe tunggal
    if (product.tipe_produk === 'tunggal') {
        // Jika opsi produk aktif, tampilkan modal pilihan box
        if (product.opsi_produk_aktif) {
            showBoxSelectionModal(productId, function (boxOption, quantity) {
                if (boxOption) {
                    // Tambahkan ke keranjang dengan box option
                    addProductToCartWithBox(product, boxOption, quantity);
                }
            });
        } else {
            // Untuk produk tanpa opsi box, langsung tambah dengan quantity minimal order
            addProductToCart(product, product.minimal_order);
        }
    }
    // Jika produk tipe paket snack box - PERBAIKAN: PASTIKAN MODAL DIBUKA
    else if (product.tipe_produk === 'paket_snack_box') {
        // PERBAIKAN: Pastikan modal snack box dibuka
        if (!product.komponen_paket) {
            showNotification('Produk snack box tidak memiliki konfigurasi kue', 'error');
            return;
        }

        // Tampilkan modal pemilihan komponen TERLEBIH DAHULU
        showSnackBoxModal(productId, function (selectedComponentIds, quantity) {
            // Setelah komponen dipilih, tampilkan modal pilihan box
            showBoxSelectionModal(productId, function (boxOption) {
                if (boxOption) {
                    // Tambahkan ke keranjang dengan box option dan komponen
                    addProductToCartWithBoxAndComponents(product, boxOption, selectedComponentIds, quantity);
                }
            });
        });
    }
}

// Fungsi untuk menambahkan produk ke keranjang tanpa box
function addProductToCart(product, quantity) {
    appData.cart[product.id] = quantity;

    updateCart();
    updateProductButtons();
    saveCartToStorage();
    showNotification(`${quantity} ${product.name} ditambahkan`, 'success');
}

// Fungsi untuk menambahkan produk ke keranjang dengan box
function addProductToCartWithBox(product, boxOption, quantity) {
    const cartKey = `${product.id}_${boxOption.id}`;
    appData.cart[cartKey] = quantity;

    // Simpan informasi tambahan
    if (!appData.cartInfo) appData.cartInfo = {};
    appData.cartInfo[cartKey] = {
        productId: product.id,
        boxOptionId: boxOption.id,
        boxOptionName: boxOption.nama,
        boxOptionPrice: boxOption.tambahan_harga
    };

    updateCart();
    updateProductButtons();
    saveCartToStorage();

    const totalPrice = (product.price + boxOption.tambahan_harga) * quantity;
    showNotification(`${quantity} ${product.name} ditambahkan.`, 'success');
}

// Fungsi untuk menambahkan produk ke keranjang dengan box dan komponen
function addProductToCartWithBoxAndComponents(product, boxOption, components, quantity) {
    const cartKey = `${product.id}_${boxOption.id}`;
    appData.cart[cartKey] = quantity;

    // Simpan informasi tambahan
    if (!appData.cartInfo) appData.cartInfo = {};
    appData.cartInfo[cartKey] = {
        productId: product.id,
        boxOptionId: boxOption.id,
        boxOptionName: boxOption.nama,
        boxOptionPrice: boxOption.tambahan_harga,
        components: components
    };

    updateCart();
    updateProductButtons();
    saveCartToStorage();

    const totalPrice = (product.price + boxOption.tambahan_harga) * quantity;

    // Dapatkan nama-nama komponen untuk notifikasi
    const componentNames = components.map(id => {
        const componentProduct = appData.products.find(p => p.id === id);
        return componentProduct ? componentProduct.name : '';
    }).filter(name => name).join(', ');

    showNotification(`${quantity} paket ${product.name} dengan ${boxOption.nama} dan kue (${componentNames}) ditambahkan ke keranjang! Total: Rp ${totalPrice.toLocaleString('id-ID')}`, 'success');
}

// Fungsi untuk menghapus produk dari keranjang
function removeProductFromCart(productId) {
    // Hapus dari cart biasa
    if (appData.cart[productId]) {
        delete appData.cart[productId];
    }

    // Hapus dari cartInfo (untuk produk dengan box)
    if (appData.cartInfo) {
        for (const key in appData.cartInfo) {
            if (appData.cartInfo[key].productId === productId) {
                delete appData.cart[key];
                delete appData.cartInfo[key];
            }
        }
    }

    updateCart();
    updateProductButtons();
    saveCartToStorage();
}

// Update tombol produk berdasarkan status keranjang
function updateProductButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const productId = button.dataset.id;
        const isInCart = isProductInCart(productId);

        if (isInCart) {
            button.textContent = 'Hapus';
            button.classList.add('delete-mode');
        } else {
            button.textContent = 'Tambah';
            button.classList.remove('delete-mode');
        }
    });
}

// Fungsi tambahan untuk mengelola keranjang dengan key
function addToCartByKey(key) {
    if (!appData.cart[key]) {
        appData.cart[key] = 0;
    }
    appData.cart[key]++;

    updateCart();
    updateProductButtons();
    saveCartToStorage();
}

function removeFromCartByKey(key) {
    if (appData.cart[key] && appData.cart[key] > 0) {
        appData.cart[key]--;
        if (appData.cart[key] === 0) {
            delete appData.cart[key];
            // Hapus juga info cart jika ada
            if (appData.cartInfo && appData.cartInfo[key]) {
                delete appData.cartInfo[key];
            }
        }

        updateCart();
        updateProductButtons();
        saveCartToStorage();
    }
}

function deleteFromCartByKey(key) {
    if (confirm('Hapus item ini dari keranjang?')) {
        delete appData.cart[key];
        // Hapus juga info cart jika ada
        if (appData.cartInfo && appData.cartInfo[key]) {
            delete appData.cartInfo[key];
        }

        updateCart();
        updateProductButtons();
        saveCartToStorage();
        showNotification('Item dihapus dari keranjang', 'success');
    }
}

function updateCartQtyByKey(key, newQty) {
    let productId = key;
    if (appData.cartInfo && appData.cartInfo[key]) {
        productId = appData.cartInfo[key].productId;
    }
    const product = appData.products.find(p => p.id == productId);
    const minOrder = (product && product.minimal_order) || 1;

    if (isNaN(newQty) || newQty <= 0) {
        delete appData.cart[key];
        if (appData.cartInfo && appData.cartInfo[key]) {
            delete appData.cartInfo[key];
        }
        showNotification('Item dihapus dari keranjang', 'success');
    } else {
        if (newQty < minOrder) {
            newQty = minOrder;
            showNotification(`Minimal order: ${minOrder}`, 'warning');
        }
        appData.cart[key] = newQty;
    }

    updateCart();
    updateProductButtons();
    saveCartToStorage();
}

// PERBAIKAN: Filter functions dengan state yang dipertahankan
function filterProducts(category) {
    // SIMPAN FILTER YANG AKTIF
    appData.activeFilter.category = category;
    appData.activeFilter.searchTerm = ''; // Reset search ketika filter kategori

    if (category === 'Semua') {
        renderProducts();
    } else {
        const filteredProducts = appData.products.filter(product =>
            product.category === category
        );
        renderProducts(filteredProducts);
    }
    updatePagination();
    updateProductsCount();
}

function filterProductsBySearch(searchTerm) {
    // SIMPAN FILTER SEARCH
    appData.activeFilter.searchTerm = searchTerm;

    if (!searchTerm) {
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        filterProducts(activeCategory);
        return;
    }

    const filteredProducts = appData.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
    updatePagination();
    updateProductsCount();
}

// Cart and product functions
function toggleCartFromNavbar() {
    if (elements.cartSummary) {
        const totalItems = getTotalItems();
        if (totalItems > 0) {
            elements.cartSummary.classList.toggle('active');

            if (elements.checkoutModal && elements.checkoutModal.classList.contains('active')) {
                closeCheckoutModal();
            }
            if (elements.imageModal && elements.imageModal.classList.contains('active')) {
                closeImageModal();
            }
            if (elements.descriptionModal && elements.descriptionModal.classList.contains('active')) {
                closeDescriptionModal();
            }
        } else {
            showNotification('Keranjang belanja kosong!', 'warning');
        }
    }
}

// Modal functions
function showDescriptionModal(productName, description) {
    if (!elements.descriptionModal || !elements.descriptionModalTitle || !elements.descriptionModalText) return;

    elements.descriptionModalTitle.textContent = productName;
    elements.descriptionModalText.textContent = description;
    elements.descriptionModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDescriptionModal() {
    if (!elements.descriptionModal) return;

    elements.descriptionModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showProductGallery(productId) {
    const product = appData.products.find(p => p.id == productId);
    if (!product) return;

    const imageUrls = getProductImageUrls(product);
    const images = imageUrls.gallery;
    let currentImageIndex = 0;

    showImageModal(images[currentImageIndex], product.name);

    if (images.length > 1) {
        addGalleryNavigation(images, currentImageIndex);
    }
}

function addGalleryNavigation(images, currentIndex) {
    const modalContent = document.querySelector('.modal-content');

    document.querySelectorAll('.gallery-nav, .gallery-indicator').forEach(el => el.remove());

    if (images.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'gallery-nav gallery-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'gallery-nav gallery-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

        const indicator = document.createElement('div');
        indicator.className = 'gallery-indicator';
        indicator.textContent = `${currentIndex + 1} / ${images.length}`;

        modalContent.appendChild(prevBtn);
        modalContent.appendChild(nextBtn);
        modalContent.appendChild(indicator);

        let currentImageIndex = currentIndex;
        const modalImage = document.getElementById('modal-image');

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            modalImage.src = images[currentImageIndex];
            indicator.textContent = `${currentImageIndex + 1} / ${images.length}`;
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % images.length;
            modalImage.src = images[currentImageIndex];
            indicator.textContent = `${currentImageIndex + 1} / ${images.length}`;
        });
    }
}

function showImageModal(imageSrc, altText) {
    if (!elements.imageModal || !elements.modalImage) return;

    elements.modalImage.src = imageSrc || CONFIG.DEFAULT_IMAGE;
    elements.modalImage.alt = altText;
    elements.imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    if (!elements.imageModal) return;

    document.querySelectorAll('.gallery-nav, .gallery-indicator').forEach(el => el.remove());
    elements.imageModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showCheckoutModal() {
    if (!elements.checkoutModal) return;

    const totalItems = getTotalItems();
    if (totalItems === 0) {
        showNotification('Keranjang belanja kosong!', 'error');
        return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (elements.pickupDate) {
        elements.pickupDate.value = tomorrow.toISOString().split('T')[0];
    }
    if (elements.pickupTime) {
        elements.pickupTime.value = '10:00';
    }
    if (elements.customerName) {
        elements.customerName.value = '';
    }
    if (elements.customerNote) {
        elements.customerNote.value = '';
    }

    elements.checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    if (!elements.checkoutModal) return;

    elements.checkoutModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ============================================================
// ONLINE ORDER: Generate Kode Referensi (format mirip POS)
// ============================================================
function generateOnlineRefId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    return `DJ-${year}${month}${day}-${hrs}${mins}-${random}`;
}

// ============================================================
// ONLINE ORDER: Simpan pesanan ke Supabase sebagai Pending
// ============================================================
async function saveOnlineOrderToSupabase(refId, customerName, pickupDate, pickupTime) {
    const totalBilling = getTotalPrice();

    // Bangun items payload sesuai format POS { productId: qty }
    const itemsPayload = {};
    Object.keys(appData.cart).forEach(key => {
        const qty = appData.cart[key];
        if (qty <= 0) return;
        if (appData.cartInfo && appData.cartInfo[key]) {
            const id = appData.cartInfo[key].productId;
            itemsPayload[id] = (itemsPayload[id] || 0) + qty;
        } else {
            itemsPayload[key] = qty;
        }
    });

    const payload = {
        invoice_code: refId,
        customer_name: customerName || 'Pelanggan Online',
        pickup_date: pickupDate || null,
        pickup_time: pickupTime ? (pickupTime.length === 5 ? pickupTime + ':00' : pickupTime) : null,
        payment_status: 'Kurang Bayar',
        payment_method: 'TUNAI',
        total_billing: totalBilling,
        previous_dp: 0,
        amount_paid: 0,
        debt: totalBilling,
        change: 0,
        items: itemsPayload,
        cart_info: {
            cart: appData.cart,
            cartInfo: appData.cartInfo || {}
        },
        source: 'online',
        updated_at: new Date().toISOString()
    };

    if (navigator.onLine && window.supabaseClient) {
        try {
            const { error } = await window.supabaseClient
                .from('transactions')
                .insert(payload);
            if (error) throw error;
            console.log('[DJANDES] Pesanan online tersimpan ke Supabase:', refId);
        } catch (err) {
            console.error('[DJANDES] Gagal simpan ke Supabase, tersimpan lokal:', err.message);
            // Fallback ke localStorage
            const localLog = JSON.parse(localStorage.getItem('offline_transactions_log')) || [];
            localLog.unshift(payload);
            localStorage.setItem('offline_transactions_log', JSON.stringify(localLog));
        }
    } else {
        // Offline: simpan ke localStorage saja
        const localLog = JSON.parse(localStorage.getItem('offline_transactions_log')) || [];
        localLog.unshift(payload);
        localStorage.setItem('offline_transactions_log', JSON.stringify(localLog));
        console.warn('[DJANDES] Offline: pesanan online tersimpan ke localStorage saja.');
    }
}

async function processCheckout() {
    const customerName = elements.customerName ? elements.customerName.value.trim() : '';
    const pickupDate = elements.pickupDate ? elements.pickupDate.value : '';
    const pickupTime = elements.pickupTime ? elements.pickupTime.value : '';
    const customerNote = elements.customerNote ? elements.customerNote.value.trim() : '';

    if (!customerName) {
        showNotification('Harap masukkan nama Anda!', 'error');
        return;
    }

    if (!pickupDate) {
        showNotification('Harap pilih tanggal pengambilan!', 'error');
        return;
    }

    if (!pickupTime) {
        showNotification('Harap pilih jam pengambilan!', 'error');
        return;
    }

    // 1. Buat nomor referensi pesanan online
    const refId = generateOnlineRefId();

    // 2. Simpan ke Supabase sebagai Pending (sebelum WA dikirim)
    await saveOnlineOrderToSupabase(refId, customerName, pickupDate, pickupTime);

    // 3. Kirim WA dengan nomor referensi
    const formattedDate = formatDate(pickupDate);
    sendWhatsAppOrder(customerName, formattedDate, pickupTime, refId, customerNote);

    closeCheckoutModal();
    appData.cart = {};
    appData.cartInfo = {};
    updateCart();
    updateProductButtons();
    saveCartToStorage();
    showNotification('Pesanan berhasil dikirim! Keranjang telah dikosongkan.', 'success');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function sendWhatsAppOrder(customerName, pickupDate, pickupTime, refId, customerNote = '') {
    const whatsappNumber = appData.contactInfo.whatsapp.replace(/\D/g, '');

    let message = `Halo, saya ingin memesan kue dari ${appData.siteSettings.title}:\n\n`;
    if (refId) {
        message += `📋 *Nomor Referensi Pesanan: ${refId}*\n`;
    }
    message += `*Data Pemesan:*\n`;
    message += `Nama: ${customerName}\n`;
    message += `Tanggal Pengambilan: ${pickupDate}\n`;
    message += `Jam Pengambilan: ${pickupTime}\n`;
    if (customerNote) {
        message += `Catatan: ${customerNote}\n`;
    }
    message += `\n`;
    message += `*Detail Pesanan:*\n`;

    Object.keys(appData.cart).forEach(key => {
        const quantity = appData.cart[key];
        if (quantity <= 0) return;

        let product, boxOptionName = '', boxOptionPrice = 0, components = [];

        if (appData.cartInfo && appData.cartInfo[key]) {
            const cartInfo = appData.cartInfo[key];
            product = appData.products.find(p => p.id === cartInfo.productId);
            boxOptionName = cartInfo.boxOptionName || '';
            boxOptionPrice = cartInfo.boxOptionPrice || 0;
            components = cartInfo.components || [];
        } else {
            product = appData.products.find(p => p.id == key);
        }

        if (product) {
            const itemPrice = product.price + boxOptionPrice;
            const totalItemPrice = itemPrice * quantity;
            message += `- ${product.name} (${quantity}) - Rp ${totalItemPrice.toLocaleString('id-ID')}\n`;

            if (boxOptionName) {
                message += `  Box: ${boxOptionName} (+Rp ${boxOptionPrice.toLocaleString('id-ID')})\n`;
            }

            if (components.length > 0) {
                const componentNames = components.map(id => {
                    const componentProduct = appData.products.find(p => p.id === id);
                    return componentProduct ? componentProduct.name : '';
                }).filter(name => name).join(', ');
                message += `  Kue: ${componentNames}\n`;
            }
        }
    });

    const totalPrice = getTotalPrice();
    message += `\n*Total: Rp ${totalPrice.toLocaleString('id-ID')}*\n\n`;
    message += `Silakan konfirmasi ketersediaan dan total pembayaran. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    showNotification('Pesanan berhasil dikirim ke WhatsApp!', 'success');
}

function getTotalItems() {
    let total = 0;
    Object.keys(appData.cart).forEach(productId => {
        total += appData.cart[productId];
    });
    return total;
}

function getTotalPrice() {
    let total = 0;

    Object.keys(appData.cart).forEach(key => {
        const quantity = appData.cart[key];
        if (quantity <= 0) return;

        let product, boxOptionPrice = 0;

        // Cek apakah ini item dengan box option
        if (appData.cartInfo && appData.cartInfo[key]) {
            const cartInfo = appData.cartInfo[key];
            product = appData.products.find(p => p.id === cartInfo.productId);
            boxOptionPrice = cartInfo.boxOptionPrice || 0;
        } else {
            // Item biasa
            product = appData.products.find(p => p.id == key);
        }

        if (product) {
            total += (product.price + boxOptionPrice) * quantity;
        }
    });

    return total;
}

function updateCheckoutItems() {
    if (!elements.checkoutItems) return;

    elements.checkoutItems.innerHTML = '';

    Object.keys(appData.cart).forEach(key => {
        const quantity = appData.cart[key];
        if (quantity <= 0) return;

        let product, boxOptionName = '', boxOptionPrice = 0, components = [];

        if (appData.cartInfo && appData.cartInfo[key]) {
            const cartInfo = appData.cartInfo[key];
            product = appData.products.find(p => p.id === cartInfo.productId);
            boxOptionName = cartInfo.boxOptionName || '';
            boxOptionPrice = cartInfo.boxOptionPrice || 0;
            components = cartInfo.components || [];
        } else {
            product = appData.products.find(p => p.id == key);
        }

        if (!product) return;

        const itemDiv = document.createElement('div');
        itemDiv.style.marginBottom = '8px';
        itemDiv.style.paddingBottom = '8px';
        itemDiv.style.borderBottom = '1px solid #eee';

        // Tampilkan nama komponen jika ada
        let componentsInfo = '';
        if (components.length > 0) {
            const componentNames = components.map(id => {
                const componentProduct = appData.products.find(p => p.id === id);
                return componentProduct ? componentProduct.name : '';
            }).filter(name => name).join(', ');

            if (componentNames) {
                componentsInfo = `<div style="font-size: 0.8rem; color: #666;">Kue: ${componentNames}</div>`;
            }
        }

        itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <span>${product.name} (${quantity})</span>
                <span>Rp ${((product.price + boxOptionPrice) * quantity).toLocaleString('id-ID')}</span>
            </div>
            ${boxOptionName ? `<div style="font-size: 0.8rem; color: #666;">Box: ${boxOptionName} (+Rp ${boxOptionPrice.toLocaleString('id-ID')})</div>` : ''}
            ${componentsInfo}
        `;
        elements.checkoutItems.appendChild(itemDiv);
    });

    const totalPrice = getTotalPrice();
    const totalDiv = document.createElement('div');
    totalDiv.style.marginTop = '10px';
    totalDiv.style.paddingTop = '10px';
    totalDiv.style.borderTop = '2px solid #ddd';
    totalDiv.style.fontWeight = 'bold';
    totalDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <span>Total:</span>
            <span>Rp ${totalPrice.toLocaleString('id-ID')}</span>
        </div>
    `;
    elements.checkoutItems.appendChild(totalDiv);
}

// Page initialization functions
function initializeAboutPage() {
    console.log('Initializing about page...');

    const aboutTitle = document.getElementById('about-title');
    const aboutDescription = document.getElementById('about-description');
    const aboutDetail = document.getElementById('about-detail');
    const aboutHistory = document.getElementById('about-history');
    const aboutVision = document.getElementById('about-vision');
    const aboutMission = document.getElementById('about-mission');
    const aboutCommitment = document.getElementById('about-commitment');
    const aboutQuality = document.getElementById('about-quality');
    const aboutFresh = document.getElementById('about-fresh');
    const aboutService = document.getElementById('about-service');
    const aboutDelivery = document.getElementById('about-delivery');

    if (aboutTitle) aboutTitle.textContent = appData.aboutContent.title || 'Tentang DJANDES';
    if (aboutDescription) aboutDescription.textContent = appData.aboutContent.description || 'Sweet & Savoury - Kue Basah, Hantaran';
    if (aboutDetail) aboutDetail.textContent = appData.aboutContent.detail || 'DJANDES adalah home made kue basah lokal yang menyajikan berbagai macam kue tradisional dan modern dengan cita rasa autentik dan kualitas terbaik.';
    if (aboutHistory) aboutHistory.textContent = appData.aboutContent.history || 'Berdiri sejak 2021, DJANDES telah melayani puluhan pelanggan dengan berbagai produk kue basah yang lezat dan berkualitas.';
    if (aboutVision) aboutVision.textContent = appData.aboutContent.vision || 'Menjadi toko kue basah terdepan yang selalu memberikan pengalaman terbaik bagi pelanggan.';
    if (aboutMission) aboutMission.textContent = appData.aboutContent.mission || 'Menyediakan kue basah dengan bahan berkualitas, rasa autentik, dan pelayanan terbaik.';
    if (aboutCommitment) aboutCommitment.textContent = appData.aboutContent.commitment || 'Kami berkomitmen untuk selalu menggunakan bahan-bahan terbaik dan menjaga cita rasa tradisional dalam setiap produk yang kami sajikan.';
    if (aboutQuality) aboutQuality.textContent = appData.aboutContent.quality || 'Menggunakan bahan-bahan pilihan dan proses pembuatan yang higienis untuk menjamin kualitas terbaik.';
    if (aboutFresh) aboutFresh.textContent = appData.aboutContent.fresh || 'Semua kue dibuat fresh setiap hari sehingga Anda selalu mendapatkan produk yang segar dan enak.';
    if (aboutService) aboutService.textContent = appData.aboutContent.service || 'Kami siap melayani dengan ramah dan profesional untuk memastikan pengalaman berbelanja yang menyenangkan.';
    if (aboutDelivery) aboutDelivery.textContent = appData.aboutContent.delivery || 'Melayani pengantaran pesanan dengan jasa kurir, cepat dan tepat waktu ke seluruh area di Blitar (syarat & ketentuan berlaku).';

    console.log('About page initialized with data:', appData.aboutContent);
}

function initializeContactPage() {
    console.log('Initializing contact page...');

    const contactPhone = document.getElementById('contact-phone');
    const contactWhatsapp = document.getElementById('contact-whatsapp');
    const contactEmail = document.getElementById('contact-email');
    const contactAddress = document.getElementById('contact-address');
    const contactHours = document.getElementById('contact-hours');
    const contactMap = document.getElementById('contact-map');

    if (contactPhone) contactPhone.textContent = appData.contactInfo.phone;
    if (contactWhatsapp) contactWhatsapp.textContent = appData.contactInfo.whatsapp;
    if (contactEmail) contactEmail.textContent = appData.contactInfo.email;
    if (contactAddress) contactAddress.textContent = appData.contactInfo.address;
    if (contactHours) contactHours.textContent = appData.contactInfo.businessHours;
    if (contactMap && appData.contactInfo.mapUrl) {
        contactMap.src = appData.contactInfo.mapUrl;
    }

    console.log('Contact page initialized with data:', appData.contactInfo);
}
