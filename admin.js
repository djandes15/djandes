// Import configuration
const CONFIG = window.CONFIG;
const DEFAULT_DATA = window.DEFAULT_DATA;

// Application State
let appData = { ...DEFAULT_DATA };
let editingProductId = null;
let editingBoxOptionIndex = null; // TAMBAHKAN VARIABLE UNTUK TRACK EDIT OPSI BOX

// DOM Elements
let elements = {};

// --- ADMIN SESSION MANAGEMENT ---
function saveAdminSession() {
    localStorage.setItem('djandes_admin_session', 'true');
}

function clearAdminSession() {
    localStorage.removeItem('djandes_admin_session');
}

function isAdminLoggedIn() {
    return localStorage.getItem('djandes_admin_session') === 'true';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('Admin panel initializing...');
    initializeElements();

    if (isAdminLoggedIn()) {
        console.log('Admin session found, skipping login.');
        elements.loginScreen.style.display = 'none';
        elements.adminPanel.style.display = 'block';
    }

    initializeApp();
    setupEventListeners();
    setupMobileSidebar();
});

// Initialize DOM elements dengan field multiple images
function initializeElements() {
    elements = {
        // Login elements
        loginScreen: document.getElementById('login-screen'),
        adminPanel: document.getElementById('admin-panel'),
        adminPassword: document.getElementById('admin-password'),
        loginBtn: document.getElementById('login-btn'),
        loginError: document.getElementById('login-error'),
        logoutBtn: document.getElementById('logout-btn'),
        message: document.getElementById('message'),
        dataStatus: document.getElementById('data-status'),

        // Site settings
        siteTitle: document.getElementById('admin-site-title'),
        siteDescription: document.getElementById('admin-site-description'),
        logoUrl: document.getElementById('admin-logo-url'),
        saveSiteSettings: document.getElementById('save-site-settings'),

        // Social media
        socialInputs: document.getElementById('social-inputs'),
        saveSocialSettings: document.getElementById('save-social-settings'),

        // Contact info
        contactWhatsapp: document.getElementById('admin-contact-whatsapp'),
        contactPhone: document.getElementById('admin-contact-phone'),
        contactEmail: document.getElementById('admin-contact-email'),
        contactAddress: document.getElementById('admin-contact-address'),
        contactMap: document.getElementById('admin-contact-map'),
        contactHours: document.getElementById('admin-contact-hours'),
        saveContactSettings: document.getElementById('save-contact-settings'),

        // About content
        aboutTitle: document.getElementById('admin-about-title'),
        aboutDescription: document.getElementById('admin-about-description'),
        aboutDetail: document.getElementById('admin-about-detail'),
        aboutHistory: document.getElementById('admin-about-history'),
        aboutVision: document.getElementById('admin-about-vision'),
        aboutMission: document.getElementById('admin-about-mission'),
        aboutCommitment: document.getElementById('admin-about-commitment'),
        aboutQuality: document.getElementById('admin-about-quality'),
        aboutFresh: document.getElementById('admin-about-fresh'),
        aboutService: document.getElementById('admin-about-service'),
        aboutDelivery: document.getElementById('admin-about-delivery'),
        saveAboutSettings: document.getElementById('save-about-settings'),

        // Categories
        categoryName: document.getElementById('admin-category-name'),
        addCategory: document.getElementById('add-category'),
        categoriesList: document.getElementById('categories-list'),

        // =================================================================================
        // ELEMEN BARU UNTUK OPSI BOX - DIPERBAIKI
        // =================================================================================
        // Box Options Management
        boxOptionsList: document.getElementById('box-options-list'),
        addBoxOption: document.getElementById('add-box-option'),
        boxOptionName: document.getElementById('admin-box-option-name'),
        boxOptionImage: document.getElementById('admin-box-option-image'),
        boxOptionPrice: document.getElementById('admin-box-option-price'),
        boxOptionCategories: document.getElementById('admin-box-option-categories'),

        // Products
        productName: document.getElementById('admin-product-name'),
        productPrice: document.getElementById('admin-product-price'),
        productDescription: document.getElementById('admin-product-description'),
        productUpload: document.getElementById('product-upload'),
        uploadBtn: document.getElementById('upload-btn'),
        productImages: document.getElementById('product-images'),
        imagePreviews: document.getElementById('image-previews'),
        openLibraryBtn: document.getElementById('open-library-btn'),
        productCategory: document.getElementById('admin-product-category'),
        productFormModal: document.getElementById('product-form-modal'),

        // BOX OPTIONS FIELDS
        boxUpload: document.getElementById('box-upload'),
        boxUploadBtn: document.getElementById('box-upload-btn'),
        openBoxLibraryBtn: document.getElementById('open-box-library-btn'),
        boxImageInput: document.getElementById('admin-box-option-image'),
        boxImagePreview: document.getElementById('box-image-preview'),

        // Other elements
        productType: document.getElementById('admin-product-type'),
        productStockStatus: document.getElementById('admin-product-stock-status'),
        productMinOrder: document.getElementById('admin-product-min-order'),
        productBoxOption: document.getElementById('admin-product-box-option'),
        snackBoxComponents: document.getElementById('admin-snack-box-components'),
        snackBoxRequiredCount: document.getElementById('admin-snack-box-required-count'),
        addProduct: document.getElementById('add-product'),
        updateProduct: document.getElementById('update-product'),
        cancelEdit: document.getElementById('cancel-edit'),
        productsList: document.getElementById('products-list'),
        productSearch: document.getElementById('product-search'),
        categoryFilter: document.getElementById('category-filter'),
        exportData: document.getElementById('export-data'),
        saveToGithub: document.getElementById('save-to-github'),
        refreshData: document.getElementById('refresh-data'),

        // Media Library Common
        libraryModal: document.getElementById('library-modal'),
        libraryGrid: document.getElementById('library-grid'),
        libraryStatus: document.getElementById('library-status'),
        librarySearch: document.getElementById('library-search'),
        closeLibrary: document.getElementById('close-library'),
        closeLibraryBtn: document.getElementById('close-library-btn'),
    };

    // VARIABEL GLOBAL UNTUK GALERI
    window.galleryTarget = 'product';
}

// ==========================================
// FUNGSI GLOBAL UNTUK MANAJEMEN GAMBAR
// ==========================================
window.removeImageUrl = function (idx) {
    if (!elements.productImages) return;
    let urls = elements.productImages.value.split(/[\n,]+/).map(u => u.trim()).filter(u => u && u.startsWith('http'));
    urls.splice(idx, 1);
    elements.productImages.value = urls.join(',\n');
    window.updateImagePreviews();
};

window.updateImagePreviews = function () {
    if (!elements.productImages || !elements.imagePreviews) return;
    const urls = elements.productImages.value.split(/[\n,]+/).map(u => u.trim()).filter(u => u && u.startsWith('http'));
    elements.imagePreviews.innerHTML = '';
    urls.forEach((url, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'position:relative; width:80px; height:80px; margin-bottom:10px;';
        div.innerHTML = `
            <img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:1px solid #ddd;">
            <button type="button" onclick="window.removeImageUrl(${idx})" style="position:absolute; top:-5px; right:-5px; background:#ef4444; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 2px 5px rgba(0,0,0,0.2)">&times;</button>
        `;
        elements.imagePreviews.appendChild(div);
    });
};

window.useImageFromLibrary = function (url, cardElement) {
    if (window.galleryTarget === 'box') {
        elements.boxImageInput.value = url;
        window.updateBoxImagePreview();
        elements.libraryModal.classList.remove('active');
        showMessage('Gambar Box dipilih.', 'success');
    } else {
        if (!elements.productImages) return;
        let urls = elements.productImages.value.split(/[\n,]+/).map(u => u.trim()).filter(u => u && u.startsWith('http'));
        const index = urls.indexOf(url);
        if (index > -1) {
            urls.splice(index, 1);
            if (cardElement) {
                cardElement.style.borderColor = '#f1f5f9';
                const check = cardElement.querySelector('.check-badge');
                if (check) check.remove();
            }
        } else {
            urls.push(url);
            if (cardElement) {
                cardElement.style.borderColor = '#7a5af5';
                const badge = document.createElement('div');
                badge.className = 'check-badge';
                badge.style.cssText = 'position:absolute; top:5px; left:5px; background:#7a5af5; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.2); font-size:12px; z-index:2;';
                badge.innerHTML = '<i class="fas fa-check"></i>';
                cardElement.appendChild(badge);
            }
        }
        elements.productImages.value = urls.join(',\n');
        window.updateImagePreviews();
    }
};

window.updateBoxImagePreview = function () {
    if (!elements.boxImageInput || !elements.boxImagePreview) return;
    const url = elements.boxImageInput.value.trim();
    if (url) {
        elements.boxImagePreview.innerHTML = `
            <div style="position:relative; display:inline-block;">
                <img src="${url}" style="width:120px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #ddd;">
                <button type="button" onclick="window.clearBoxImage()" style="position:absolute; top:-5px; right:-5px; background:#ef4444; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 2px 5px rgba(0,0,0,0.2)">&times;</button>
            </div>
        `;
    } else {
        elements.boxImagePreview.innerHTML = '';
    }
};

window.clearBoxImage = function () {
    if (elements.boxImageInput) {
        elements.boxImageInput.value = '';
        window.updateBoxImagePreview();
    }
};

window.deleteFromStorage = async function (fileName, btn) {
    if (!confirm(`Hapus permanen ${fileName}?`)) return;
    try {
        const { error } = await window.supabaseClient.storage.from('product-images').remove([`products/${fileName}`]);
        if (error) throw error;
        btn.closest('.library-item').remove();
        showMessage('File dihapus.', 'success');
    } catch (err) { showMessage('Gagal: ' + err.message, 'error'); }
};

// --- IMAGE OPTIMIZATION ---
// Fungsi ini sekarang hanya membersihkan URL dari query params lama.
// Optimasi dilakukan saat upload (client-side WebP compression).
function getOptimizedImageKitUrl(originalUrl, options = {}) {
    if (!originalUrl || originalUrl === CONFIG.DEFAULT_IMAGE) {
        return originalUrl;
    }

    // Jika masih URL ImageKit lama, tetap terapkan transformasi agar backward-compatible
    if (originalUrl.includes('ik.imagekit.io')) {
        const defaultOptions = { width: 400, quality: 75, format: 'webp' };
        const config = { ...defaultOptions, ...options };
        const baseUrl = originalUrl.split('?')[0];
        const params = [`w-${config.width}`, `q-${config.quality}`, `f-${config.format}`].join(',');
        return `${baseUrl}?tr=${params}`;
    }

    // Untuk URL Supabase: kembalikan URL bersih (tanpa query params lama)
    return originalUrl.split('?')[0];
}

// --- DATA LOADING FUNCTIONS ---
async function loadSeparatedDataFromGitHub() {
    try {
        const dataFiles = CONFIG.DATA_FILES;
        const loadedData = {};

        const loadPromises = Object.entries(dataFiles).map(async ([key, filename]) => {
            try {
                const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/${filename}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = atob(data.content);
                    const parsedData = JSON.parse(content);

                    const propertyMap = {
                        'site-settings.json': 'siteSettings',
                        'social-media.json': 'socialMedia',
                        'contact-info.json': 'contactInfo',
                        'about-content.json': 'aboutContent',
                        'categories.json': 'categories',
                        'products.json': 'products',
                        'sales-data.json': 'salesData',
                        'theme-settings.json': 'themeSettings',
                        'box-options.json': 'opsiBoxGlobal'
                    };

                    const propertyName = propertyMap[filename];
                    if (propertyName) {
                        loadedData[propertyName] = parsedData[propertyName] || parsedData;
                    }
                }
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error);
                const propertyMap = {
                    'site-settings.json': 'siteSettings',
                    'social-media.json': 'socialMedia',
                    'contact-info.json': 'contactInfo',
                    'about-content.json': 'aboutContent',
                    'categories.json': 'categories',
                    'products.json': 'products',
                    'sales-data.json': 'salesData',
                    'theme-settings.json': 'themeSettings',
                    'box-options.json': 'opsiBoxGlobal'
                };
                const propertyName = propertyMap[filename];
                if (propertyName && DEFAULT_DATA[propertyName]) {
                    loadedData[propertyName] = DEFAULT_DATA[propertyName];
                }
            }
        });

        await Promise.all(loadPromises);

        Object.keys(loadedData).forEach(key => {
            if (loadedData[key] !== undefined) {
                appData[key] = loadedData[key];
            }
        });

    } catch (error) {
        console.error('Failed to load separated data:', error);
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

    appData = newData;
}

// Initialize the application
async function initializeApp() {
    try {
        console.log('Loading data from GitHub...');
        if (elements.dataStatus) {
            elements.dataStatus.innerHTML = '<p><i class="fas fa-sync fa-spin"></i> Memuat data dari GitHub...</p>';
        }

        await loadSeparatedDataFromGitHub();

        if (elements.dataStatus) {
            elements.dataStatus.innerHTML = '<p style="color: green;"><i class="fas fa-check-circle"></i> Data berhasil dimuat dari GitHub</p>';
        }

        showMessage('Data berhasil dimuat dari GitHub', 'success');

        if (elements.adminPanel.style.display === 'block') {
            renderAdminPanel();
        }

    } catch (error) {
        console.error('Failed to load data from GitHub:', error);

        if (elements.dataStatus) {
            elements.dataStatus.innerHTML = '<p style="color: red;"><i class="fas fa-times-circle"></i> Gagal memuat data: ' + error.message + '</p>';
        }

        showMessage('Menggunakan data lokal', 'warning');

        if (elements.adminPanel.style.display === 'block') {
            renderAdminPanel();
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Login
    elements.loginBtn.addEventListener('click', login);
    elements.adminPassword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') login();
    });

    // Logout
    elements.logoutBtn.addEventListener('click', logout);

    // Site settings
    elements.saveSiteSettings.addEventListener('click', saveSiteSettings);

    // Social settings
    elements.saveSocialSettings.addEventListener('click', saveSocialSettings);

    // Contact settings
    elements.saveContactSettings.addEventListener('click', saveContactSettings);

    // About settings
    elements.saveAboutSettings.addEventListener('click', saveAboutSettings);

    // Categories
    elements.addCategory.addEventListener('click', addCategory);

    // Products
    elements.addProduct.addEventListener('click', addProduct);
    elements.updateProduct.addEventListener('click', updateProduct);
    elements.cancelEdit.addEventListener('click', cancelEdit);

    // Product search and filter
    if (elements.productSearch) {
        elements.productSearch.addEventListener('input', filterProducts);
    }
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('change', filterProducts);
    }

    // Backup
    elements.exportData.addEventListener('click', exportData);
    elements.saveToGithub.addEventListener('click', saveToGitHub);
    elements.refreshData.addEventListener('click', function () {
        initializeApp();
    });

    // =================================================================================
    // EVENT LISTENER BARU UNTUK OPSI BOX DAN TIPE PRODUK - DIPERBAIKI
    // =================================================================================
    // Box Options - DIPERBAIKI: Gunakan delegated event handling
    if (elements.addBoxOption) {
        elements.addBoxOption.addEventListener('click', handleBoxOptionAction);
    }

    // Product Type Change
    if (elements.productType) {
        elements.productType.addEventListener('change', handleProductTypeChange);
    }

    // MIGRATION BUTTON
    const migrateBtn = document.getElementById('migrate-to-supabase');
    if (migrateBtn) {
        migrateBtn.addEventListener('click', migrateToSupabase);
    }

    // UPLOAD IMAGE BUTTON
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', handleFileUpload);
    }

    // MEDIA LIBRARY BUTTONS
    if (elements.openLibraryBtn) {
        elements.openLibraryBtn.addEventListener('click', () => {
            window.galleryTarget = 'product'; // Set target ke produk
            elements.libraryModal.classList.add('active');
            window.openMediaLibrary();
        });
    }

    if (elements.openBoxLibraryBtn) {
        elements.openBoxLibraryBtn.addEventListener('click', () => {
            window.galleryTarget = 'box'; // Set target ke box
            elements.libraryModal.classList.add('active');
            window.openMediaLibrary();
        });
    }

    if (elements.boxUploadBtn) {
        elements.boxUploadBtn.addEventListener('click', handleBoxFileUpload);
    }

    if (elements.boxImageInput) {
        elements.boxImageInput.addEventListener('input', window.updateBoxImagePreview);
    }

    if (elements.closeLibrary) {
        elements.closeLibrary.addEventListener('click', () => {
            elements.libraryModal.classList.remove('active');
        });
    }
    if (elements.closeLibraryBtn) {
        elements.closeLibraryBtn.addEventListener('click', () => elements.libraryModal.classList.remove('active'));
    }

    // SEARCH IN LIBRARY
    if (elements.librarySearch) {
        elements.librarySearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const searchItems = elements.libraryGrid.querySelectorAll('.library-item');
            searchItems.forEach(item => {
                const name = item.dataset.name.toLowerCase();
                item.style.display = name.includes(term) ? 'block' : 'none';
            });
        });
    }

    // Change preview on URL change
    if (elements.productImages) {
        elements.productImages.addEventListener('input', window.updateImagePreviews);
    }

    // Close modal on click outside
    window.addEventListener('click', (event) => {
        if (event.target == elements.libraryModal) {
            elements.libraryModal.classList.remove('active');
        }
        if (elements.productFormModal && event.target == elements.productFormModal) {
            window.closeProductModal();
        }
    });
}

// ==========================================
// FUNGSI GALERI & MEDIA (GLOBAL)
// ==========================================
window.openMediaLibrary = async function () {
    if (!elements.libraryModal) return;
    elements.libraryStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat galeri...';
    elements.libraryGrid.innerHTML = '';

    try {
        const client = window.supabaseClient;
        const { data, error } = await client.storage.from('product-images').list('products', {
            limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) throw error;
        if (!data || data.length === 0) { elements.libraryStatus.innerHTML = 'Galeri kosong.'; return; }

        elements.libraryStatus.innerHTML = `Ditemukan ${data.length} file di storage.`;

        const currentUrls = elements.productImages.value.split(/[\n,]+/).map(u => u.trim());

        data.forEach(file => {
            if (file.name === '.emptyFolderPlaceholder') return;
            const { data: { publicUrl } } = client.storage.from('product-images').getPublicUrl(`products/${file.name}`);

            const isSelected = currentUrls.includes(publicUrl);
            const card = document.createElement('div');
            card.className = 'library-item';
            card.dataset.name = file.name;
            card.style.cssText = `padding:12px; position:relative; background:white; cursor:pointer; border: 2px solid ${isSelected ? '#7a5af5' : '#f1f5f9'}; border-radius:16px;`;

            card.innerHTML = `
                ${isSelected ? '<div class="check-badge" style="position:absolute; top:5px; left:5px; background:#7a5af5; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.2); font-size:12px; z-index:2;"><i class="fas fa-check"></i></div>' : ''}
                <img src="${publicUrl}" style="width:100%; height:120px; object-fit:cover; border-radius:10px;" onclick="window.useImageFromLibrary('${publicUrl}', this.parentElement)">
                <div style="font-size:11px; margin:8px 10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#475569;">${file.name}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 5px;">
                    <span style="font-size:10px; color:#94a3b8;">ID: ${file.name.substring(0, 6)}...</span>
                    <button type="button" onclick="event.stopPropagation(); window.deleteFromStorage('${file.name}', this)" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px;" title="Hapus permanen">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            elements.libraryGrid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        elements.libraryStatus.innerHTML = 'Gagal memuat galeri.';
    }
}

// ==========================================
// KOMPRESI GAMBAR CLIENT-SIDE KE WEBP
// ==========================================
/**
 * Mengkompresi file gambar ke format WebP menggunakan Canvas API browser.
 * Tidak butuh library eksternal. Dijalankan sebelum upload ke Supabase.
 * @param {File} file - File gambar asli dari input
 * @param {object} options - { maxWidth, maxHeight, quality }
 * @returns {Promise<{blob: Blob, originalSize: number, compressedSize: number}>}
 */
async function compressImageToWebP(file, options = {}) {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;
    const originalSize = file.size;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            // Hitung ukuran baru dengan mempertahankan aspect ratio
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Gagal mengkompresi gambar.'));
                        return;
                    }
                    resolve({ blob, originalSize, compressedSize: blob.size });
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Gagal memuat gambar untuk kompresi.'));
        };

        img.src = objectUrl;
    });
}

// HANDLE FILE UPLOAD TO SUPABASE STORAGE (dengan kompresi WebP otomatis)
async function handleFileUpload() {
    const files = elements.productUpload.files;
    if (files.length === 0) {
        showMessage('Pilih file terlebih dahulu!', 'error');
        return;
    }

    elements.uploadBtn.disabled = true;
    elements.uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengompresi...';

    try {
        const client = window.supabaseClient;
        const uploadedUrls = [];
        let totalOriginalKB = 0;
        let totalCompressedKB = 0;

        for (const file of files) {
            // Kompresi gambar ke WebP sebelum upload
            showMessage(`Mengompresi ${file.name}...`, 'info');
            const { blob, originalSize, compressedSize } = await compressImageToWebP(file, {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.82
            });

            totalOriginalKB += originalSize / 1024;
            totalCompressedKB += compressedSize / 1024;

            // Selalu simpan sebagai .webp
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
            const filePath = `products/${fileName}`;

            elements.uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';

            const { error: uploadError } = await client.storage
                .from('product-images')
                .upload(filePath, blob, { contentType: 'image/webp' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = client.storage
                .from('product-images')
                .getPublicUrl(filePath);

            uploadedUrls.push(publicUrl);
        }

        const currentUrls = elements.productImages.value ? elements.productImages.value.split(',').map(u => u.trim()) : [];
        const combinedUrls = [...currentUrls, ...uploadedUrls].filter(u => u).join(', ');

        elements.productImages.value = combinedUrls;
        updateImagePreviews();

        const savedKB = totalOriginalKB - totalCompressedKB;
        const savedPercent = totalOriginalKB > 0 ? Math.round((savedKB / totalOriginalKB) * 100) : 0;
        showMessage(
            `✓ ${files.length} gambar diupload (WebP). Hemat ${savedPercent}% (${Math.round(savedKB)}KB dari ${Math.round(totalOriginalKB)}KB)`,
            'success'
        );
        elements.productUpload.value = '';

    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Gagal upload: ' + error.message, 'error');
    } finally {
        elements.uploadBtn.disabled = false;
        elements.uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
    }
}

// HANDLE BOX IMAGE UPLOAD (dengan kompresi WebP otomatis)
async function handleBoxFileUpload() {
    if (!elements.boxUpload || !elements.boxUpload.files.length) {
        showMessage('Pilih file gambar box!', 'warning');
        return;
    }

    const file = elements.boxUpload.files[0];
    elements.boxUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    elements.boxUploadBtn.disabled = true;

    try {
        const client = window.supabaseClient;

        // Kompresi gambar box sebelum upload (ukuran lebih kecil karena hanya thumbnail)
        const { blob, originalSize, compressedSize } = await compressImageToWebP(file, {
            maxWidth: 600,
            maxHeight: 600,
            quality: 0.80
        });

        const fileName = `box-${Math.random().toString(36).substring(2)}-${Date.now()}.webp`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await client.storage.from('product-images').upload(filePath, blob, { contentType: 'image/webp' });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = client.storage.from('product-images').getPublicUrl(filePath);

        elements.boxImageInput.value = publicUrl;
        window.updateBoxImagePreview();

        const savedPercent = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;
        showMessage(`Gambar box diupload (WebP, hemat ${savedPercent}%)!`, 'success');

    } catch (error) {
        showMessage('Gagal upload: ' + error.message, 'error');
    } finally {
        elements.boxUploadBtn.innerHTML = '<i class="fas fa-upload"></i>';
        elements.boxUploadBtn.disabled = false;
    }
}

// Initialize the application with Supabase
async function initializeApp() {
    elements.dataStatus.innerHTML = '<i class="fas fa-sync fa-spin"></i> Memuat data dari Supabase...';
    try {
        const client = window.supabaseClient;
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

        if (products) appData.products = products;
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

        window.appData = appData;
        elements.dataStatus.innerHTML = '<span style="color: #2ecc71;"><i class="fas fa-check-circle"></i> Terhubung ke Supabase</span>';

        if (isAdminLoggedIn()) {
            renderAdminPanel();
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        elements.dataStatus.innerHTML = '<span style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> Gagal memuat data</span>';
        showMessage('Gagal memuat data dari Supabase: ' + error.message, 'error');
    }
}

// FUNGSI MIGRASI OTOMATIS KE SUPABASE
async function migrateToSupabase() {
    if (!confirm('Apakah Anda yakin ingin memindahkan semua data lokal ke Supabase? Data yang ada di Supabase akan diperbarui.')) return;

    const btn = document.getElementById('migrate-to-supabase');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Memigrasi...';

    try {
        const client = window.supabaseClient;

        // 1. Migrasi Kategori
        console.log('Migrating categories...');
        const cats = appData.categories.filter(c => c !== 'Semua');
        for (const cat of cats) {
            await client.from('categories').upsert({ name: cat }, { onConflict: 'name' });
        }

        // 2. Migrasi Produk
        console.log('Migrating products...');
        for (const product of appData.products) {
            await client.from('products').upsert({
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                images: product.images || [product.image],
                category: product.category,
                status_stok: product.status_stok,
                minimal_order: product.minimal_order,
                opsi_produk_aktif: product.opsi_produk_aktif,
                tipe_produk: product.tipe_produk,
                snack_box_required_count: product.komponen_paket ? product.komponen_paket.jumlah_wajib_pilih : null,
                snack_box_components: product.komponen_paket ? product.komponen_paket.produk_id_yang_boleh_dipilih : null
            });
        }

        // 3. Migrasi Opsi Box
        console.log('Migrating box options...');
        if (appData.opsiBoxGlobal) {
            for (const box of appData.opsiBoxGlobal) {
                await client.from('box_options').upsert({
                    id: box.id,
                    nama: box.nama,
                    gambar: box.gambar,
                    tambahan_harga: box.tambahan_harga,
                    kategori_berlaku: box.kategori_berlaku
                });
            }
        }

        // 4. Migrasi Configs (Settings, Social, Contact, About)
        console.log('Migrating site configs...');
        const configs = [
            { id: 'site_settings', data: appData.siteSettings },
            { id: 'social_media', data: appData.socialMedia },
            { id: 'contact_info', data: appData.contactInfo },
            { id: 'about_content', data: appData.aboutContent }
        ];

        for (const config of configs) {
            await client.from('site_configs').upsert(config);
        }

        alert('✓ MIGRASI BERHASIL! Semua data sudah pindah ke Supabase.');
        location.reload(); // Refresh untuk melihat perubahan

    } catch (err) {
        console.error('Migration failed:', err);
        alert('Gagal Migrasi: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Setup mobile sidebar functionality
function setupMobileSidebar() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const adminSidebar = document.getElementById('admin-sidebar');
    const adminOverlay = document.getElementById('admin-overlay');
    const menuItems = document.querySelectorAll('.menu-item[data-tab]'); // Hanya yang punya data-tab

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            adminSidebar.classList.toggle('active');
            adminOverlay.classList.toggle('active');
        });
    }

    if (adminOverlay) {
        adminOverlay.addEventListener('click', function () {
            adminSidebar.classList.remove('active');
            adminOverlay.classList.remove('active');
        });
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const tabId = this.getAttribute('data-tab');

            // Simpan tab terakhir ke localStorage
            localStorage.setItem('djandes_active_tab', tabId);

            menuItems.forEach(mi => mi.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

            this.classList.add('active');
            const targetTab = document.getElementById(`${tabId}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }

            // Jika tab Laporan Penjualan dibuka, muat laporan otomatis
            if (tabId === 'sales-report' && typeof window.loadSalesReport === 'function') {
                window.loadSalesReport();
            }

            if (window.innerWidth <= 1024) {
                adminSidebar.classList.remove('active');
                adminOverlay.classList.remove('active');
            }
        });
    });

    // RESTORASI TAB TERAKHIR SAAT HALAMAN DIMUAT
    const lastTab = localStorage.getItem('djandes_active_tab');
    if (lastTab) {
        const savedMenuItem = document.querySelector(`.menu-item[data-tab="${lastTab}"]`);
        const savedTab = document.getElementById(`${lastTab}-tab`);
        if (savedMenuItem && savedTab) {
            document.querySelectorAll('.menu-item[data-tab]').forEach(mi => mi.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            savedMenuItem.classList.add('active');
            savedTab.classList.add('active');
        }
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth > 1024) {
            adminSidebar.classList.remove('active');
            adminOverlay.classList.remove('active');
        }
    });
}

// Login function
async function login() {
    const password = elements.adminPassword.value;

    if (!password) {
        elements.loginError.textContent = 'Password tidak boleh kosong!';
        elements.loginError.style.display = 'block';
        return;
    }

    elements.loginBtn.disabled = true;
    elements.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    elements.loginError.style.display = 'none';

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: 'admin@djandes.com',
            password: password
        });

        if (error) {
            throw error;
        }

        saveAdminSession();
        document.documentElement.setAttribute('data-admin', 'in');
        renderAdminPanel();
        showMessage('Login berhasil!', 'success');
    } catch (err) {
        console.error('Login error:', err);
        elements.loginError.textContent = 'Password salah!';
        elements.loginError.style.display = 'block';
        elements.adminPassword.value = '';
        elements.adminPassword.focus();
    } finally {
        elements.loginBtn.disabled = false;
        elements.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// Logout function
async function logout() {
    try {
        await window.supabaseClient.auth.signOut();
    } catch (err) {
        console.error('Logout error:', err);
    }
    clearAdminSession();
    document.documentElement.setAttribute('data-admin', 'out');
    elements.adminPassword.value = '';
    elements.loginError.style.display = 'none';
    resetProductForm();
}

// Render admin panel dengan ImageKit optimization untuk preview
function renderAdminPanel() {
    console.log('Rendering admin panel with data:', appData);

    // Site settings
    elements.siteTitle.value = appData.siteSettings.title || '';
    elements.siteDescription.value = appData.siteSettings.description || '';
    elements.logoUrl.value = appData.siteSettings.logo || '';

    // Social media
    renderSocialInputs();

    // Contact info
    elements.contactWhatsapp.value = appData.contactInfo.whatsapp || '';
    elements.contactPhone.value = appData.contactInfo.phone || '';
    elements.contactEmail.value = appData.contactInfo.email || '';
    elements.contactAddress.value = appData.contactInfo.address || '';
    elements.contactMap.value = appData.contactInfo.mapUrl || '';
    elements.contactHours.value = appData.contactInfo.businessHours || '';

    // About content
    if (appData.aboutContent) {
        elements.aboutTitle.value = appData.aboutContent.title || '';
        elements.aboutDescription.value = appData.aboutContent.description || '';
        elements.aboutDetail.value = appData.aboutContent.detail || '';
        elements.aboutHistory.value = appData.aboutContent.history || '';
        elements.aboutVision.value = appData.aboutContent.vision || '';
        elements.aboutMission.value = appData.aboutContent.mission || '';
        elements.aboutCommitment.value = appData.aboutContent.commitment || '';
        elements.aboutQuality.value = appData.aboutContent.quality || '';
        elements.aboutFresh.value = appData.aboutContent.fresh || '';
        elements.aboutService.value = appData.aboutContent.service || '';
        elements.aboutDelivery.value = appData.aboutContent.delivery || '';
    } else {
        appData.aboutContent = {
            title: '',
            description: '',
            detail: '',
            history: '',
            vision: '',
            mission: '',
            commitment: '',
            quality: '',
            fresh: '',
            service: '',
            delivery: ''
        };
    }

    // Categories
    renderCategories();

    // Products
    renderProductsList();
    setupProductFilters();

    // Reset product form
    resetProductForm();

    // Update dashboard stats
    updateDashboardStats();

    // =================================================================================
    // RENDER ELEMEN BARU - DIPERBAIKI
    // =================================================================================
    // Render opsi box
    renderBoxOptions();

    // Render kategori untuk checkbox
    renderCategoriesForCheckbox();

    // Render produk untuk komponen snack box
    renderProductsForSnackBox();
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalProducts = document.getElementById('total-products');
    const totalCategories = document.getElementById('total-categories');
    const lastUpdate = document.getElementById('last-update');
    const dataSize = document.getElementById('data-size');

    if (totalProducts) totalProducts.textContent = appData.products.length;
    if (totalCategories) totalCategories.textContent = appData.categories.filter(c => c !== 'Semua').length;
    if (lastUpdate) lastUpdate.textContent = new Date().toLocaleDateString('id-ID');
    if (dataSize) dataSize.textContent = '~' + JSON.stringify(appData).length + ' bytes';
}

// Render social media inputs
function renderSocialInputs() {
    const socialInputsContainer = elements.socialInputs;
    socialInputsContainer.innerHTML = '';

    const socialPlatforms = [
        { key: 'facebook', icon: 'fab fa-facebook-f', placeholder: 'URL Facebook' },
        { key: 'instagram', icon: 'fab fa-instagram', placeholder: 'URL Instagram' },
        { key: 'twitter', icon: 'fab fa-twitter', placeholder: 'URL Twitter' },
        { key: 'tiktok', icon: 'fab fa-tiktok', placeholder: 'URL TikTok' }
    ];

    socialPlatforms.forEach(platform => {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label for="social-${platform.key}">
                <i class="${platform.icon}"></i> ${platform.key.charAt(0).toUpperCase() + platform.key.slice(1)}
            </label>
            <input type="text" id="social-${platform.key}" class="form-control" 
                   value="${appData.socialMedia[platform.key] || ''}" 
                   placeholder="${platform.placeholder}">
        `;
        socialInputsContainer.appendChild(div);
    });
}

// Render categories
function renderCategories() {
    const categorySelect = elements.productCategory;
    categorySelect.innerHTML = '<option value="" disabled selected>-- Pilih Kategori --</option>';

    const availableCategories = appData.categories.filter(cat => cat !== 'Semua');

    availableCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    const categoriesList = elements.categoriesList;
    categoriesList.innerHTML = '';

    if (availableCategories.length === 0) {
        categoriesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Belum ada kategori. Tambahkan kategori baru.</p>';
        return;
    }

    availableCategories.forEach((category, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.innerHTML = `
            <span>${category}</span>
            <div class="item-actions">
                <button class="action-btn delete-btn" data-index="${index}" title="Hapus Kategori">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        categoriesList.appendChild(listItem);
    });

    categoriesList.addEventListener('click', function (e) {
        if (e.target.closest('.delete-btn')) {
            const button = e.target.closest('.delete-btn');
            const index = parseInt(button.dataset.index);
            deleteCategory(index);
        }
    });
}

// =================================================================================
// FUNGSI BARU UNTUK OPSI BOX - DIPERBAIKI LENGKAP
// =================================================================================

// Fungsi untuk menangani aksi opsi box (tambah/update) - BARU
function handleBoxOptionAction() {
    if (editingBoxOptionIndex !== null) {
        updateBoxOption();
    } else {
        addBoxOption();
    }
}

// Fungsi untuk menambahkan opsi box - DIPERBAIKI (Async & Supabase)
async function addBoxOption() {
    console.log('addBoxOption function called');

    const name = elements.boxOptionName.value.trim();
    const image = elements.boxOptionImage.value.trim();
    const price = parseInt(elements.boxOptionPrice.value);

    // Dapatkan kategori yang dipilih dari checkbox
    const categoryCheckboxes = elements.boxOptionCategories.querySelectorAll('input[type="checkbox"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);

    console.log('Form data:', { name, image, price, categories });

    if (!name || !image || isNaN(price) || price < 0 || categories.length === 0) {
        showMessage('Semua field harus diisi dengan benar! Nama, gambar, harga, dan minimal satu kategori harus dipilih.', 'error');
        return;
    }

    // Pastikan opsiBoxGlobal ada di appData
    if (!appData.opsiBoxGlobal) {
        appData.opsiBoxGlobal = [];
    }

    const newBoxOption = {
        id: "box_" + Date.now(),
        nama: name,
        gambar: image,
        tambahan_harga: price,
        kategori_berlaku: categories
    };

    console.log('New box option:', newBoxOption);

    appData.opsiBoxGlobal.push(newBoxOption);
    renderBoxOptions();
    resetBoxOptionForm();
    showMessage('Opsi box berhasil ditambahkan lokal!', 'success');

    // Simpan ke Supabase
    try {
        await saveToSupabase();
        showMessage('Opsi box berhasil disimpan ke Supabase!', 'success');
    } catch (err) {
        showMessage('Gagal menyimpan ke Supabase: ' + err.message, 'error');
    }
}

// Fungsi untuk merender opsi box - DIPERBAIKI
function renderBoxOptions() {
    const boxOptionsList = elements.boxOptionsList;
    if (!boxOptionsList) {
        console.error('boxOptionsList element not found');
        return;
    }

    boxOptionsList.innerHTML = '';

    // Pastikan opsiBoxGlobal ada
    if (!appData.opsiBoxGlobal || appData.opsiBoxGlobal.length === 0) {
        boxOptionsList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Belum ada opsi box. Tambahkan opsi box baru.</p>';
        return;
    }

    appData.opsiBoxGlobal.forEach((boxOption, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.innerHTML = `
            <div class="box-option-info">
                <div class="box-option-name">${boxOption.nama}</div>
                <div class="box-option-details">
                    <span class="box-option-price">+Rp ${boxOption.tambahan_harga.toLocaleString('id-ID')}</span>
                    <span class="box-option-categories">Berlaku untuk: ${boxOption.kategori_berlaku.join(', ')}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="action-btn edit-btn" data-index="${index}" title="Edit Opsi Box">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-index="${index}" title="Hapus Opsi Box">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        boxOptionsList.appendChild(listItem);
    });

    // Tambahkan event listener untuk edit dan delete
    boxOptionsList.addEventListener('click', function (e) {
        if (e.target.closest('.edit-btn')) {
            const button = e.target.closest('.edit-btn');
            const index = parseInt(button.dataset.index);
            editBoxOption(index);
        } else if (e.target.closest('.delete-btn')) {
            const button = e.target.closest('.delete-btn');
            const index = parseInt(button.dataset.index);
            deleteBoxOption(index);
        }
    });
}

// Fungsi untuk mengedit opsi box - DIPERBAIKI
function editBoxOption(index) {
    const boxOption = appData.opsiBoxGlobal[index];

    // Isi form dengan data yang ada
    elements.boxOptionName.value = boxOption.nama;
    elements.boxOptionImage.value = boxOption.gambar;
    elements.boxOptionPrice.value = boxOption.tambahan_harga;

    // Tampilkan preview gambar
    window.updateBoxImagePreview();

    // Set checkbox kategori
    const categoryCheckboxes = elements.boxOptionCategories.querySelectorAll('input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => {
        cb.checked = boxOption.kategori_berlaku.includes(cb.value);
    });

    // Set state editing
    editingBoxOptionIndex = index;

    // Ubah tombol tambah menjadi update
    elements.addBoxOption.textContent = 'Update Opsi Box';
    elements.addBoxOption.classList.add('editing');

    // Scroll ke form
    document.getElementById('box-options-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    showMessage('Edit mode aktif. Silakan ubah data opsi box.', 'success');
}

// Fungsi untuk update opsi box - DIPERBAIKI (Async & Supabase)
async function updateBoxOption() {
    if (editingBoxOptionIndex === null) return;

    const name = elements.boxOptionName.value.trim();
    const image = elements.boxOptionImage.value.trim();
    const price = parseInt(elements.boxOptionPrice.value);
    const categoryCheckboxes = elements.boxOptionCategories.querySelectorAll('input[type="checkbox"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);

    if (!name || !image || isNaN(price) || price < 0 || categories.length === 0) {
        showMessage('Semua field harus diisi dengan benar!', 'error');
        return;
    }

    // Update data yang ada, bukan buat baru
    appData.opsiBoxGlobal[editingBoxOptionIndex] = {
        ...appData.opsiBoxGlobal[editingBoxOptionIndex],
        nama: name,
        gambar: image,
        tambahan_harga: price,
        kategori_berlaku: categories
    };

    renderBoxOptions();
    resetBoxOptionForm();
    showMessage('Opsi box berhasil diupdate lokal!', 'success');

    try {
        await saveToSupabase();
        showMessage('Opsi box berhasil diupdate di Supabase!', 'success');
    } catch (err) {
        showMessage('Gagal update Supabase: ' + err.message, 'error');
    }
}

// Fungsi untuk menghapus opsi box - DIPERBAIKI (Eksplisit Supabase Delete)
async function deleteBoxOption(index) {
    const boxOption = appData.opsiBoxGlobal[index];

    if (confirm(`Apakah Anda yakin ingin menghapus opsi box "${boxOption.nama}"?`)) {
        try {
            // Hapus baris di database Supabase terlebih dahulu
            showMessage(`Menghapus Opsi Box dari Supabase...`, 'info');
            const { error } = await window.supabaseClient.from('box_options').delete().eq('id', boxOption.id);
            if (error) throw error;

            // Jika sukses, buang dari array lokal
            appData.opsiBoxGlobal.splice(index, 1);
            renderBoxOptions();
            showMessage('Opsi box berhasil dihapus dari cloud!', 'success');

            // Tetap jalankan update configs keseluruhan
            await saveToSupabase();
        } catch (err) {
            console.error('Delete box options error:', err);
            showMessage('Gagal menghapus opsi box: ' + err.message, 'error');
        }
    }
}

// Fungsi untuk mereset form opsi box - DIPERBAIKI
function resetBoxOptionForm() {
    elements.boxOptionName.value = '';
    elements.boxOptionImage.value = '';
    elements.boxOptionPrice.value = '';

    // Reset checkbox
    const categoryCheckboxes = elements.boxOptionCategories.querySelectorAll('input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => {
        cb.checked = false;
    });

    // Kembalikan tombol ke state tambah
    elements.addBoxOption.textContent = 'Tambah Opsi Box';
    elements.addBoxOption.classList.remove('editing');

    // Reset state editing
    editingBoxOptionIndex = null;
}

// Fungsi untuk menangani perubahan tipe produk
function handleProductTypeChange() {
    const productType = elements.productType.value;
    const snackBoxFields = document.getElementById('snack-box-fields');

    if (productType === 'paket_snack_box') {
        snackBoxFields.style.display = 'block';
    } else {
        snackBoxFields.style.display = 'none';
    }
}

// Perbarui fungsi renderCategories untuk checkbox kategori - DIPERBAIKI
function renderCategoriesForCheckbox() {
    const checkboxContainer = elements.boxOptionCategories;
    if (!checkboxContainer) {
        console.error('boxOptionCategories element not found');
        return;
    }

    checkboxContainer.innerHTML = '';

    const availableCategories = appData.categories.filter(cat => cat !== 'Semua');

    if (availableCategories.length === 0) {
        checkboxContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 10px;">Belum ada kategori. Tambahkan kategori terlebih dahulu.</p>';
        return;
    }

    availableCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'checkbox-group';
        div.innerHTML = `
            <input type="checkbox" id="cat-${category.replace(/\s+/g, '-')}" value="${category}">
            <label for="cat-${category.replace(/\s+/g, '-')}">${category}</label>
        `;
        checkboxContainer.appendChild(div);
    });
}

// Fungsi untuk merender produk untuk komponen snack box
function renderProductsForSnackBox() {
    const selectElement = elements.snackBoxComponents;
    if (!selectElement) return;

    selectElement.innerHTML = '';

    appData.products.forEach(product => {
        // Hanya tambahkan produk tipe tunggal sebagai komponen
        if (product.tipe_produk !== 'paket_snack_box') {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - Rp ${product.price.toLocaleString('id-ID')}`;
            selectElement.appendChild(option);
        }
    });
}

// Render products list dengan ImageKit optimized preview - DIPERBAIKI
function renderProductsList() {
    const productsList = elements.productsList;
    productsList.innerHTML = '';

    if (appData.products.length === 0) {
        productsList.innerHTML = '<p class="no-products">Belum ada produk. Tambahkan produk baru.</p>';
        return;
    }

    appData.products.forEach((product, index) => {
        const imageCount = product.images ? product.images.length : 1;
        const optimizedImage = getOptimizedImageKitUrl(product.image, { width: 100, quality: 60 });

        // Badge untuk status stok
        const stockBadge = product.status_stok === 'habis' ?
            '<span class="stock-badge out-of-stock">Habis</span>' :
            '<span class="stock-badge in-stock">Tersedia</span>';

        // Badge untuk minimal order
        const minOrderBadge = product.minimal_order > 1 ?
            `<span class="min-order-badge">Min. ${product.minimal_order}</span>` : '';

        // Badge untuk tipe produk
        const typeBadge = product.tipe_produk === 'paket_snack_box' ?
            '<span class="type-badge">Paket</span>' : '';

        // Badge untuk opsi produk
        const optionBadge = product.opsi_produk_aktif ?
            '<span class="option-badge">Pilihan Box</span>' : '';

        const listItem = document.createElement('div');
        listItem.className = 'product-item';
        listItem.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-badges">
                    ${stockBadge}
                    ${minOrderBadge}
                    ${typeBadge}
                    ${optionBadge}
                </div>
                <div class="product-details">
                    <span class="product-price">Rp ${product.price.toLocaleString('id-ID')}</span>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-description">${product.description}</div>
                <div class="product-preview">
                    <img src="${optimizedImage}" 
                         alt="${product.name}" 
                         style="max-width: 80px; max-height: 60px; object-fit: cover; border-radius: 4px;"
                         onerror="this.style.display='none'">
                </div>
                <div class="product-images-info">
                    <i class="fas fa-images"></i> ${imageCount} gambar
                    ${imageCount > 1 ? '(Gallery tersedia)' : ''}
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn edit" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="quick-action-btn delete" data-index="${index}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
        productsList.appendChild(listItem);
    });

    // Event listener untuk produk - DIPERBAIKI: Gunakan event delegation yang lebih baik
    setupProductsEventListeners();
}

// Setup event listeners untuk produk - BARU
function setupProductsEventListeners() {
    const productsList = elements.productsList;

    // Hapus event listener lama jika ada
    productsList.replaceWith(productsList.cloneNode(true));
    elements.productsList = document.getElementById('products-list');

    // Tambah event listener baru dengan event delegation
    elements.productsList.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.quick-action-btn.edit');
        const deleteBtn = e.target.closest('.quick-action-btn.delete');

        if (editBtn) {
            const index = parseInt(editBtn.dataset.index);
            editProduct(index);
            document.getElementById('product-form-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else if (deleteBtn) {
            const index = parseInt(deleteBtn.dataset.index);
            const product = appData.products[index];
            deleteProduct(index, product);
        }
    });
}

// Fungsi untuk menghapus produk - DIPERBAIKI: Modal konfirmasi yang tidak berulang
function deleteProduct(index, product) {
    // Cek jika sudah ada modal, hapus dulu
    const existingModal = document.querySelector('.confirm-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'confirm-modal active';
    modal.innerHTML = `
        <div class="confirm-content">
            <div class="confirm-header">
                <div class="confirm-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="confirm-title">Konfirmasi Hapus</h3>
            </div>
            <p class="confirm-message">
                Apakah Anda yakin ingin menghapus produk "<strong>${product.name}</strong>"? 
                <br><br>
                <span style="color: #e74c3c; font-size: 14px;">
                    <i class="fas fa-exclamation-circle"></i> 
                    Tindakan ini tidak dapat dibatalkan!
                </span>
            </p>
            <div class="confirm-actions">
                <button class="btn btn-outline" id="cancel-delete">Batal</button>
                <button class="btn btn-danger" id="confirm-delete">Ya, Hapus</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners untuk modal - DIPERBAIKI: Gunakan once untuk menghindari multiple listeners
    document.getElementById('cancel-delete').addEventListener('click', function () {
        modal.remove();
    }, { once: true });

    document.getElementById('confirm-delete').addEventListener('click', async function () {
        try {
            const { error } = await window.supabaseClient.from('products').delete().eq('id', product.id);
            if (error) throw error;

            appData.products.splice(index, 1);
            renderProductsList();
            showMessage('Produk berhasil dihapus dari Supabase!', 'success');
            modal.remove();
        } catch (err) {
            showMessage('Gagal hapus: ' + err.message, 'error');
        }
    }, { once: true });

    // Close modal ketika klik di luar
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    }, { once: true });

    // Close modal dengan ESC key
    const handleEscKey = function (e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscKey);
        }
    };
    document.addEventListener('keydown', handleEscKey, { once: true });
}

// Hapus fungsi showDeleteConfirmation yang lama karena sudah diganti dengan deleteProduct

// Tambahkan fungsi untuk filter dan pencarian produk
function setupProductFilters() {
    const searchInput = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');

    const availableCategories = appData.categories.filter(cat => cat !== 'Semua');
    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    availableCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    let filteredProducts = appData.products;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product =>
            product.category === selectedCategory
        );
    }

    const productsList = elements.productsList;
    productsList.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<p class="no-products">Tidak ada produk yang cocok dengan filter.</p>';
        return;
    }

    filteredProducts.forEach((product, index) => {
        const originalIndex = appData.products.indexOf(product);
        const imageCount = product.images ? product.images.length : 1;
        const optimizedImage = getOptimizedImageKitUrl(product.image, { width: 100, quality: 60 });

        // Badge untuk status stok
        const stockBadge = product.status_stok === 'habis' ?
            '<span class="stock-badge out-of-stock">Habis</span>' :
            '<span class="stock-badge in-stock">Tersedia</span>';

        // Badge untuk minimal order
        const minOrderBadge = product.minimal_order > 1 ?
            `<span class="min-order-badge">Min. ${product.minimal_order}</span>` : '';

        // Badge untuk tipe produk
        const typeBadge = product.tipe_produk === 'paket_snack_box' ?
            '<span class="type-badge">Paket</span>' : '';

        // Badge untuk opsi produk
        const optionBadge = product.opsi_produk_aktif ?
            '<span class="option-badge">Pilihan Box</span>' : '';

        const listItem = document.createElement('div');
        listItem.className = 'product-item';
        listItem.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-badges">
                    ${stockBadge}
                    ${minOrderBadge}
                    ${typeBadge}
                    ${optionBadge}
                </div>
                <div class="product-details">
                    <span class="product-price">Rp ${product.price.toLocaleString('id-ID')}</span>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-description">${product.description}</div>
                <div class="product-preview">
                    <img src="${optimizedImage}" 
                         alt="${product.name}" 
                         style="max-width: 80px; max-height: 60px; object-fit: cover; border-radius: 4px;"
                         onerror="this.style.display='none'">
                </div>
                <div class="product-images-info">
                    <i class="fas fa-images"></i> ${imageCount} gambar
                    ${imageCount > 1 ? '(Gallery tersedia)' : ''}
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn edit" data-index="${originalIndex}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="quick-action-btn delete" data-index="${originalIndex}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
        productsList.appendChild(listItem);
    });

    // Setup event listeners untuk produk yang difilter
    setupProductsEventListeners();
}

// Save site settings
async function saveSiteSettings() {
    appData.siteSettings.title = elements.siteTitle.value;
    appData.siteSettings.description = elements.siteDescription.value;
    appData.siteSettings.logo = elements.logoUrl.value;

    showMessage('Pengaturan situs berhasil disimpan!', 'success');
    await saveToSupabase();
}

// Save social settings
async function saveSocialSettings() {
    appData.socialMedia.facebook = document.getElementById('social-facebook').value;
    appData.socialMedia.instagram = document.getElementById('social-instagram').value;
    appData.socialMedia.twitter = document.getElementById('social-twitter').value;
    appData.socialMedia.tiktok = document.getElementById('social-tiktok').value;

    showMessage('Pengaturan media sosial berhasil disimpan!', 'success');
    await saveToSupabase();
}

// Save contact settings
async function saveContactSettings() {
    appData.contactInfo.whatsapp = elements.contactWhatsapp.value;
    appData.contactInfo.phone = elements.contactPhone.value;
    appData.contactInfo.email = elements.contactEmail.value;
    appData.contactInfo.address = elements.contactAddress.value;

    // Auto-clean Google Maps URL
    let mapUrl = elements.contactMap.value;
    if (mapUrl.includes('<iframe')) {
        const match = mapUrl.match(/src="([^"]+)"/);
        if (match) mapUrl = match[1];
    }
    appData.contactInfo.mapUrl = mapUrl;

    appData.contactInfo.businessHours = elements.contactHours.value;

    showMessage('Informasi kontak berhasil disimpan!', 'success');
    await saveToSupabase();
}

// Save about settings
async function saveAboutSettings() {
    if (!appData.aboutContent) {
        appData.aboutContent = {};
    }

    appData.aboutContent.title = elements.aboutTitle.value;
    appData.aboutContent.description = elements.aboutDescription.value;
    appData.aboutContent.detail = elements.aboutDetail.value;
    appData.aboutContent.history = elements.aboutHistory.value;
    appData.aboutContent.vision = elements.aboutVision.value;
    appData.aboutContent.mission = elements.aboutMission.value;
    appData.aboutContent.commitment = elements.aboutCommitment.value;
    appData.aboutContent.quality = elements.aboutQuality.value;
    appData.aboutContent.fresh = elements.aboutFresh.value;
    appData.aboutContent.service = elements.aboutService.value;
    appData.aboutContent.delivery = elements.aboutDelivery.value;

    showMessage('Konten tentang kami berhasil disimpan!', 'success');
    await saveToSupabase();
}

// Add category
async function addCategory() {
    const categoryName = elements.categoryName.value.trim();

    if (!categoryName) {
        showMessage('Nama kategori tidak boleh kosong!', 'error');
        return;
    }

    const categoryExists = appData.categories.some(
        cat => cat.toLowerCase() === categoryName.toLowerCase()
    );

    if (categoryExists) {
        showMessage('Kategori sudah ada!', 'error');
        return;
    }

    appData.categories.push(categoryName);
    elements.categoryName.value = '';

    renderCategories();
    showMessage('Kategori berhasil ditambahkan!', 'success');
    await saveToSupabase();
}

// Delete category (Eksplisit Supabase Delete)
async function deleteCategory(index) {
    const availableCategories = appData.categories.filter(cat => cat !== 'Semua');
    const category = availableCategories[index];

    const productsInCategory = appData.products.filter(product => product.category === category);
    if (productsInCategory.length > 0) {
        showMessage(`Tidak dapat menghapus kategori "${category}" karena masih digunakan oleh ${productsInCategory.length} produk!`, 'error');
        return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category}"?`)) {
        try {
            // Hapus baris di database Supabase terlebih dahulu
            showMessage(`Menghapus kategori "${category}" dari Supabase...`, 'info');
            const { error } = await window.supabaseClient.from('categories').delete().eq('name', category);
            if (error) throw error;

            // Jika sukses, buang dari array lokal
            const actualIndex = appData.categories.indexOf(category);
            if (actualIndex !== -1) {
                appData.categories.splice(actualIndex, 1);
            }

            renderCategories();
            showMessage('Kategori berhasil dihapus dari cloud!', 'success');

            // Tetap jalankan upsert sisanya di configs
            await saveToSupabase();
        } catch (err) {
            console.error('Delete category error:', err);
            showMessage('Gagal menghapus kategori: ' + err.message, 'error');
        }
    }
}

// =================================================================================
// FUNGSI PRODUK YANG SUDAH DIPERBAHARUI
// =================================================================================

// Add product dengan Supabase
async function addProduct() {
    const name = elements.productName.value.trim();
    const price = parseInt(elements.productPrice.value);
    const description = elements.productDescription.value.trim();
    const imagesInput = elements.productImages.value.trim();
    const category = elements.productCategory.value;
    const stockStatus = elements.productStockStatus.value;
    const minOrder = parseInt(elements.productMinOrder.value) || 1;
    const boxOptionActive = elements.productBoxOption.checked;
    const productType = elements.productType.value;

    const allImages = imagesInput ?
        imagesInput.split(',').map(url => url.trim()).filter(url => url) : [];

    if (!name || !price || !description || !category) {
        showMessage('Nama, harga, deskripsi, dan kategori harus diisi!', 'error');
        return;
    }

    const productId = Date.now();
    const newProduct = {
        id: productId,
        name,
        price,
        description,
        images: allImages.length > 0 ? allImages : [CONFIG.DEFAULT_IMAGE],
        category,
        status_stok: stockStatus,
        minimal_order: minOrder,
        opsi_produk_aktif: boxOptionActive,
        tipe_produk: productType
    };

    if (productType === 'paket_snack_box') {
        const selectedComponents = Array.from(elements.snackBoxComponents.selectedOptions)
            .map(option => parseInt(option.value));
        const requiredCount = parseInt(elements.snackBoxRequiredCount.value) || 1;
        newProduct.snack_box_components = selectedComponents;
        newProduct.snack_box_required_count = requiredCount;
    }

    try {
        const { error } = await window.supabaseClient.from('products').insert(newProduct);
        if (error) throw error;

        appData.products.unshift(newProduct);
        resetProductForm();
        renderProductsList();
        showMessage('Produk berhasil ditambahkan ke Supabase!', 'success');
    } catch (err) {
        showMessage('Gagal simpan ke Supabase: ' + err.message, 'error');
    }
}

// ==========================================
// KONTROL MODAL KELOLA PRODUK
// ==========================================
window.openAddProductModal = function () {
    resetProductForm(); // Reset Form local fields & set editingProductId = null

    // Ganti judul modal
    const modalTitle = document.getElementById('product-modal-title');
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Produk Baru';

    // Tampilkan modal
    if (elements.productFormModal) {
        elements.productFormModal.classList.add('active');
    }
    document.body.style.overflow = 'hidden'; // Kunci scroll halaman utama
};

window.closeProductModal = function () {
    if (elements.productFormModal) {
        elements.productFormModal.classList.remove('active');
    }
    document.body.style.overflow = 'auto'; // Aktifkan scroll halaman utama kembali
};

// Edit product
function editProduct(index) {
    const product = appData.products[index];
    editingProductId = product.id;

    elements.productName.value = product.name;
    elements.productPrice.value = product.price;
    elements.productDescription.value = product.description;
    elements.productCategory.value = product.category;
    elements.productStockStatus.value = product.status_stok || 'tersedia';
    elements.productMinOrder.value = product.minimal_order || 1;
    elements.productBoxOption.checked = product.opsi_produk_aktif !== false;
    elements.productType.value = product.tipe_produk || 'tunggal';

    // Trigger change event untuk menampilkan field snack box jika perlu
    handleProductTypeChange();

    // Jika tipe produk adalah paket snack box
    if (product.tipe_produk === 'paket_snack_box' && product.komponen_paket) {
        const { produk_id_yang_boleh_dipilih, jumlah_wajib_pilih } = product.komponen_paket;

        // Set selected options untuk komponen
        Array.from(elements.snackBoxComponents.options).forEach(option => {
            option.selected = produk_id_yang_boleh_dipilih.includes(parseInt(option.value));
        });

        elements.snackBoxRequiredCount.value = jumlah_wajib_pilih;
    }

    if (product.images && product.images.length > 0) {
        elements.productImages.value = product.images.join(', ');
    } else {
        elements.productImages.value = product.image || '';
    }

    elements.addProduct.style.display = 'none';
    elements.updateProduct.style.display = 'inline-block';
    elements.cancelEdit.style.display = 'inline-block';

    const formSection = document.getElementById('product-form-section');
    if (formSection) formSection.classList.add('edit-mode');

    // Tampilkan preview gambar saat edit
    updateImagePreviews();

    // Ubah judul modal & Munculkan modal edit
    const modalTitle = document.getElementById('product-modal-title');
    if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Produk: ${product.name}`;

    if (elements.productFormModal) {
        elements.productFormModal.classList.add('active');
    }
    document.body.style.overflow = 'hidden'; // Kunci scroll halaman utama

    showMessage('Form edit dimuat. Silakan ubah data produk.', 'success');
}

// Update product dengan multiple images
async function updateProduct() {
    if (editingProductId === null) return;

    const productIndex = appData.products.findIndex(p => p.id === editingProductId);
    if (productIndex === -1) return;

    const name = elements.productName.value.trim();
    const price = parseInt(elements.productPrice.value);
    const description = elements.productDescription.value.trim();
    const imagesInput = elements.productImages.value.trim();
    const category = elements.productCategory.value;
    const stockStatus = elements.productStockStatus.value;
    const minOrder = parseInt(elements.productMinOrder.value) || 1;
    const boxOptionActive = elements.productBoxOption.checked;
    const productType = elements.productType.value;

    const allImages = imagesInput ?
        imagesInput.split(',').map(url => url.trim()).filter(url => url) : [];

    if (!name || !price || !description || !category) {
        showMessage('Nama, harga, deskripsi, dan kategori harus diisi!', 'error');
        return;
    }

    if (isNaN(price) || price <= 0) {
        showMessage('Harga harus berupa angka yang valid!', 'error');
        return;
    }

    appData.products[productIndex] = {
        ...appData.products[productIndex],
        name,
        price,
        description,
        image: allImages.length > 0 ? allImages[0] : CONFIG.DEFAULT_IMAGE,
        images: allImages.length > 0 ? allImages : [CONFIG.DEFAULT_IMAGE],
        category,
        status_stok: stockStatus,
        minimal_order: minOrder,
        opsi_produk_aktif: boxOptionActive,
        tipe_produk: productType
    };

    // Jika tipe produk adalah paket snack box
    if (productType === 'paket_snack_box') {
        const selectedComponents = Array.from(elements.snackBoxComponents.selectedOptions)
            .map(option => parseInt(option.value));
        const requiredCount = parseInt(elements.snackBoxRequiredCount.value) || 1;

        if (selectedComponents.length < requiredCount) {
            showMessage(`Jumlah komponen yang dipilih harus minimal ${requiredCount}!`, 'error');
            return;
        }

        appData.products[productIndex].komponen_paket = {
            produk_id_yang_boleh_dipilih: selectedComponents,
            jumlah_wajib_pilih: requiredCount
        };
    } else {
        // Hapus field komponen_paket jika bukan tipe paket
        delete appData.products[productIndex].komponen_paket;
    }

    try {
        const { error } = await window.supabaseClient.from('products').update(appData.products[productIndex]).eq('id', editingProductId);
        if (error) throw error;

        resetProductForm();
        renderProductsList();
        showMessage('Produk berhasil diupdate di Supabase!', 'success');
    } catch (err) {
        showMessage('Gagal update: ' + err.message, 'error');
    }
}

// Cancel edit
function cancelEdit() {
    resetProductForm();
    showMessage('Edit dibatalkan.', 'warning');
}

// Reset product form
function resetProductForm() {
    elements.productName.value = '';
    elements.productPrice.value = '';
    elements.productDescription.value = '';
    elements.productImages.value = '';
    if (elements.productCategory.options.length > 0) {
        elements.productCategory.selectedIndex = 0;
    }

    elements.productStockStatus.value = 'tersedia';
    elements.productMinOrder.value = '1';
    elements.productBoxOption.checked = true;
    elements.productType.value = 'tunggal';
    handleProductTypeChange();

    // Reset komponen snack box
    Array.from(elements.snackBoxComponents.options).forEach(option => {
        option.selected = false;
    });
    elements.snackBoxRequiredCount.value = '1';

    elements.addProduct.style.display = 'inline-block';
    elements.updateProduct.style.display = 'none';
    elements.cancelEdit.style.display = 'none';

    const formSection = document.getElementById('product-form-section');
    if (formSection) formSection.classList.remove('edit-mode');

    // Reset previews
    elements.imagePreviews.innerHTML = '';
    elements.boxImageInput.value = '';
    window.updateBoxImagePreview();

    editingProductId = null;

    // Tutup popup modal
    window.closeProductModal();
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'katalog-backup.json';
    link.click();

    showMessage('Data berhasil di-export!', 'success');
}

// Save to Supabase (Replaces saveToGitHub)
async function saveToSupabase() {
    try {
        const client = window.supabaseClient;

        // Simpan Configs (Settings, Social, Contact, About)
        const configs = [
            { id: 'site_settings', data: appData.siteSettings },
            { id: 'social_media', data: appData.socialMedia },
            { id: 'contact_info', data: appData.contactInfo },
            { id: 'about_content', data: appData.aboutContent }
        ];

        for (const config of configs) {
            await client.from('site_configs').upsert(config);
        }

        // Kategori
        const cats = appData.categories.filter(c => c !== 'Semua');
        for (const cat of cats) {
            await client.from('categories').upsert({ name: cat }, { onConflict: 'name' });
        }

        // Opsi Box
        if (appData.opsiBoxGlobal) {
            for (const box of appData.opsiBoxGlobal) {
                await client.from('box_options').upsert({
                    id: box.id,
                    nama: box.nama,
                    gambar: box.gambar,
                    tambahan_harga: box.tambahan_harga,
                    kategori_berlaku: box.kategori_berlaku
                });
            }
        }

        return true;
    } catch (error) {
        console.error('Failed to save to Supabase:', error);
        throw error;
    }
}

// Legacy saveToGitHub function removed. Using direct Supabase updates now.
async function saveToGitHub() {
    // We already moved to Supabase. This function just keeps calling Supabase for backward compatibility in logic.
    await saveToSupabase();
}

// Show message
function showMessage(text, type) {
    const message = elements.message;
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';

    setTimeout(() => {
        message.style.display = 'none';
    }, 5000);
}
// ==========================================
// LAPORAN PENJUALAN — ADMIN PANEL
// ==========================================
(function () {
    'use strict';

    let _salesTrendChart = null;
    let _paymentMethodChart = null;
    let _reportData = []; // Data transaksi mentah yang sudah diambil

    // --- Fungsi Bantu ---
    function getDateRange(period) {
        const now = new Date();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                break;
            case 'yesterday':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
                todayEnd.setDate(todayEnd.getDate() - 1);
                break;
            case '7days':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
                break;
            case '30days':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
                break;
            case 'custom': {
                const s = document.getElementById('report-start-date')?.value;
                const e = document.getElementById('report-end-date')?.value;
                if (!s || !e) return null;
                startDate = new Date(s + 'T00:00:00');
                const endDate = new Date(e + 'T23:59:59');
                return { start: startDate, end: endDate };
            }
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
        }
        return { start: startDate, end: todayEnd };
    }

    function rupiah(num) {
        return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
    }

    function getDayLabel(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }

    // --- UI Helper ---
    function setCard(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    // --- Render Chart Tren Penjualan ---
    function renderTrendChart(labels, revenueSeries, receivedSeries) {
        const canvas = document.getElementById('salesTrendChart');
        if (!canvas || typeof Chart === 'undefined') return;

        if (_salesTrendChart) {
            _salesTrendChart.destroy();
            _salesTrendChart = null;
        }

        _salesTrendChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Total Omzet',
                        data: revenueSeries,
                        borderColor: '#7a5af5',
                        backgroundColor: 'rgba(122, 90, 245, 0.08)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#7a5af5',
                        pointRadius: 4,
                    },
                    {
                        label: 'Kas Diterima',
                        data: receivedSeries,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.06)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#10b981',
                        pointRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top', labels: { font: { size: 12 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${rupiah(ctx.parsed.y)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (val) => {
                                if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
                                if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'rb';
                                return 'Rp ' + val;
                            },
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: { ticks: { font: { size: 11 } }, grid: { display: false } }
                }
            }
        });
    }

    // --- Render Pie Chart Metode Pembayaran ---
    function renderPaymentChart(cashTotal, transferTotal) {
        const canvas = document.getElementById('paymentMethodChart');
        if (!canvas || typeof Chart === 'undefined') return;

        if (_paymentMethodChart) {
            _paymentMethodChart.destroy();
            _paymentMethodChart = null;
        }

        const total = cashTotal + transferTotal;
        if (total === 0) return;

        _paymentMethodChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Tunai', 'Transfer'],
                datasets: [{
                    data: [cashTotal, transferTotal],
                    backgroundColor: ['#10b981', '#3b82f6'],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${rupiah(ctx.parsed)}`
                        }
                    }
                }
            }
        });
    }

    // --- Render Tabel Produk Terlaris ---
    function renderTopProducts(productSummary) {
        const tbody = document.getElementById('report-top-products');
        if (!tbody) return;

        const products = window.appData?.products || [];
        let itemsList = Object.keys(productSummary).map(id => {
            const prodObj = products.find(p => String(p.id) === String(id));
            const name = prodObj ? prodObj.name : `ID: ${id}`;
            const price = prodObj ? Number(prodObj.price || 0) : 0;
            const qty = productSummary[id];
            return { name, qty, estimatedRevenue: price * qty };
        });

        itemsList.sort((a, b) => b.qty - a.qty);

        if (itemsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px; color:#94a3b8;">Tidak ada data produk</td></tr>`;
            return;
        }

        tbody.innerHTML = itemsList.map((item, idx) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 5px;">
                    <span style="display:inline-block; width:20px; height:20px; border-radius:50%; background: ${idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#e2e8f0'}; color:white; font-size:10px; font-weight:bold; text-align:center; line-height:20px; margin-right:8px;">${idx + 1}</span>
                    ${item.name}
                </td>
                <td style="padding: 10px 5px; text-align: right; font-weight: 600; color: #7a5af5;">${item.qty} pcs</td>
                <td style="padding: 10px 5px; text-align: right; font-size: 12px; color: #64748b;">${rupiah(item.estimatedRevenue)}</td>
            </tr>
        `).join('');
    }

    // --- FUNGSI UTAMA: Muat Data Laporan ---
    window.loadSalesReport = async function () {
        const period = document.getElementById('report-period-select')?.value || '7days';
        const range = getDateRange(period);
        if (!range) {
            alert('Harap pilih tanggal mulai dan selesai untuk periode kustom.');
            return;
        }

        const btnFetch = document.getElementById('btn-fetch-report');
        if (btnFetch) { btnFetch.disabled = true; btnFetch.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...'; }

        let transactions = [];

        try {
            if (navigator.onLine && window.supabaseClient) {
                const startISO = range.start.toISOString();
                const endISO = range.end.toISOString();
                const { data, error } = await window.supabaseClient
                    .from('transactions')
                    .select('*')
                    .gte('created_at', startISO)
                    .lte('created_at', endISO)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                transactions = data || [];
            } else {
                // Fallback: filter dari localStorage
                const local = JSON.parse(localStorage.getItem('offline_transactions_log')) || [];
                transactions = local.filter(t => {
                    if (!t.created_at && !t.updated_at) return false;
                    const d = new Date(t.created_at || t.updated_at);
                    return d >= range.start && d <= range.end;
                });
            }
        } catch (err) {
            console.error('[Report] Gagal mengambil data:', err.message);
            transactions = [];
        } finally {
            if (btnFetch) { btnFetch.disabled = false; btnFetch.innerHTML = '<i class="fas fa-sync-alt"></i> Tampilkan Laporan'; }
        }

        _reportData = transactions;
        processAndRenderReport(transactions, range);
    };

    // --- Proses dan Render Seluruh Laporan ---
    function processAndRenderReport(transactions, range) {
        let totalRevenue = 0;  // Omzet (total_billing semua status)
        let totalReceived = 0; // Kas aktual diterima (amount_paid)
        let totalDebt = 0;     // Piutang aktif
        let cashReceived = 0;
        let transferReceived = 0;
        let posCount = 0;
        let onlineCount = 0;
        let productSummary = {};

        // Buat map per-tanggal untuk grafik
        const dayMap = {};
        let cursor = new Date(range.start);
        cursor.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(range.end);
        rangeEnd.setHours(23, 59, 59, 999);

        while (cursor <= rangeEnd) {
            const key = cursor.toISOString().split('T')[0];
            dayMap[key] = { revenue: 0, received: 0 };
            cursor.setDate(cursor.getDate() + 1);
        }

        transactions.forEach(t => {
            const billing = Number(t.total_billing || 0);
            const paid = Number(t.amount_paid || 0);
            const debt = Number(t.debt || 0);
            const method = (t.payment_method || 'TUNAI').toUpperCase();
            const isOnline = t.source === 'online' || String(t.invoice_code || '').startsWith('ONL-');

            // Skip pesanan Pending yang belum dilunasi
            const isPending = (t.payment_status === 'Pending' || (isOnline && t.payment_status === 'Kurang Bayar'));

            if (!isPending) {
                totalRevenue += billing;
                totalReceived += paid;
                totalDebt += debt;

                if (method === 'TRANSFER') transferReceived += paid;
                else cashReceived += paid;
            }

            if (isOnline) onlineCount++; else posCount++;

            // Grafik per tanggal (semua transaksi)
            const dateKey = (t.created_at || t.updated_at || '').split('T')[0];
            if (dayMap[dateKey]) {
                dayMap[dateKey].revenue += billing;
                if (!isPending) dayMap[dateKey].received += paid;
            }

            // Rekap produk terjual
            if (t.items && typeof t.items === 'object') {
                Object.keys(t.items).forEach(prodId => {
                    const qty = Number(t.items[prodId] || 0);
                    if (qty > 0) productSummary[prodId] = (productSummary[prodId] || 0) + qty;
                });
            }
        });

        // Update cards
        setCard('report-total-revenue', rupiah(totalRevenue));
        setCard('report-total-received', rupiah(totalReceived));
        setCard('report-total-debt', rupiah(totalDebt));
        setCard('report-total-transactions', transactions.length);
        setCard('label-method-tunai', rupiah(cashReceived));
        setCard('label-method-transfer', rupiah(transferReceived));
        setCard('label-channel-pos', posCount + ' Trx');
        setCard('label-channel-online', onlineCount + ' Trx');

        // Grafik tren
        const dayKeys = Object.keys(dayMap).sort();
        const labels = dayKeys.map(getDayLabel);
        const revenueSeries = dayKeys.map(k => dayMap[k].revenue);
        const receivedSeries = dayKeys.map(k => dayMap[k].received);
        renderTrendChart(labels, revenueSeries, receivedSeries);

        // Pie chart metode bayar
        renderPaymentChart(cashReceived, transferReceived);

        // Tabel produk terlaris
        renderTopProducts(productSummary);
    }

    // --- Filter Tanggal Kustom Toggle ---
    window.onPeriodChange = function () {
        const period = document.getElementById('report-period-select')?.value;
        const customContainer = document.getElementById('custom-date-container');
        if (customContainer) {
            customContainer.style.display = (period === 'custom') ? 'flex' : 'none';
        }
    };

    // --- Ekspor CSV ---
    window.exportReportToCSV = function () {
        if (!_reportData || _reportData.length === 0) {
            alert('Tidak ada data untuk diekspor. Tampilkan laporan terlebih dahulu.');
            return;
        }

        const headers = ['Kode Nota', 'Nama Pelanggan', 'Tgl Pickup', 'Jam Pickup', 'Status', 'Metode', 'Omzet', 'Dibayar', 'Sisa', 'Sumber', 'Dibuat'];
        const rows = _reportData.map(t => [
            t.invoice_code || '',
            t.customer_name || '',
            t.pickup_date || '',
            t.pickup_time || '',
            t.payment_status || '',
            t.payment_method || '',
            t.total_billing || 0,
            t.amount_paid || 0,
            t.debt || 0,
            String(t.invoice_code || '').startsWith('ONL-') ? 'Online Web' : 'Kasir POS',
            t.created_at ? new Date(t.created_at).toLocaleString('id-ID') : '',
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `laporan-djandes-${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

})();
