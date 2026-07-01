// Configuration for Supabase (New Database & Storage)
window.CONFIG = {
    SUPABASE_URL: 'https://rboiicqwzcdjxhnhkzkl.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJib2lpY3F3emNkanhobmhremtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NDg2NDEsImV4cCI6MjA5NjIyNDY0MX0.Hjp4dCWf5bYnsXq1rnS-B9Cz70jQ4nP096sf-9ibl-s',

    // Image Optimization (ImageKit tetap dipakai untuk resize otomatis)
    IMAGEKIT_URL_ENDPOINT: 'https://ik.imagekit.io/robingladys/',
    DEFAULT_IMAGE: 'img/gambar.jpg',
    IMAGE_PROXY_URL: 'https://djandes.turuxballo.workers.dev',


    IMAGEKIT_OPTIONS: {
        THUMBNAIL: { width: 400, quality: 75, format: 'webp' },
        GALLERY: { width: 800, quality: 85, format: 'auto' },
        LOGO: { width: 200, quality: 90, format: 'webp' },
        PRODUCT: { width: 600, quality: 80, format: 'auto' }
    }
};

// Inisialisasi Supabase Client secara Global
const { createClient } = window.supabase;
window.supabaseClient = createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);

// Default data structure dengan SEMUA DATA PRODUK untuk offline mode
window.DEFAULT_DATA = {
    siteSettings: {
        title: "DJANDES",
        description: "Jl. Anggrek , RT 004 / RW 013, Tegalrejo, Sawentar, Kanigoro, Blitar.",
        logo: "img/gambar.jpg"
    },
    socialMedia: {
        facebook: "",
        instagram: "https://www.instagram.com/djandes15",
        twitter: "",
        tiktok: "https://www.tiktok.com/@djandes15?_t=ZS-90ortEzTnzY&_r=1"
    },
    contactInfo: {
        whatsapp: "+62 858-1200-6225",
        phone: "+62 858-1200-6225",
        email: "sidoelrasta@gmail.com",
        address: "Jl. Anggrek , RT 004 / RW 013, Tegalrejo, Sawentar, Kanigoro, Blitar.",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3949.8109453560633!2d112.2325264!3d-8.1207225!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78ebac417b43f7%3A0x806e165d29a57022!2sDjandes%20Sweet%20and%20Savoury!5e0!3m2!1sen!2sid!4v1761329279400!5m2!1sen!2sid",
        businessHours: "Senin - Minggu: 08:00 - 18:00 WIB"
    },
    aboutContent: {
        title: "Tentang DJANDES",
        description: "Sweet & Savoury - Kue Basah, Hantaran",
        detail: "DJANDES adalah home made kue basah lokal yang menyajikan berbagai macam kue tradisional dan modern dengan cita rasa autentik dan kualitas terbaik.",
        history: "Berdiri sejak 2021, DJANDES telah melayani puluhan pelanggan dengan berbagai produk kue basah yang lezat dan berkualitas.",
        vision: "Menjadi toko kue basah terdepan yang selalu memberikan pengalaman terbaik bagi pelanggan.",
        mission: "Menyediakan kue basah dengan bahan berkualitas, rasa autentik, dan pelayanan terbaik.",
        commitment: "Kami berkomitmen untuk selalu menggunakan bahan-bahan terbaik dan menjaga cita rasa tradisional dalam setiap produk yang kami sajikan.",
        quality: "Menggunakan bahan-bahan pilihan dan proses pembuatan yang higienis untuk menjamin kualitas terbaik.",
        fresh: "Semua kue dibuat fresh setiap hari sehingga Anda selalu mendapatkan produk yang segar dan enak.",
        service: "Kami siap melayani dengan ramah dan profesional untuk memastikan pengalaman berbelanja yang menyenangkan.",
        delivery: "Melayani pengantaran pesanan dengan jasa kurir, cepat dan tepat waktu ke seluruh area di Blitar (syarat & ketentuan berlaku)."
    },

    themeSettings: {
        primaryColor: "#3498db",
        secondaryColor: "#2980b9",
        backgroundColor: "#ecf0f1",
        textColor: "#2c3e50"
    }
};
