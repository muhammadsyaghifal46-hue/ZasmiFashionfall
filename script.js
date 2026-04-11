let cart = [];
let currentProduct = {};
let currentImages = [];
let imgIndex = 0;
let selectedColor = "";
let selectedSize = "";

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
} 

// =========================================
// 1. LOGIKA DETAIL PRODUK (ALA SHOPEE)
// =========================================

// Fungsi untuk membuka Modal Detail
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('view-detail-btn')) {
        const btn = e.target;
        
        // Ambil data dari atribut tombol
        currentProduct = {
            name: btn.getAttribute('data-name'),
            prices: JSON.parse(btn.getAttribute('data-prices')) // Pastikan di HTML sudah pakai data-prices
        };
        
        currentImages = JSON.parse(btn.getAttribute('data-images'));
        const colors = JSON.parse(btn.getAttribute('data-colors'));
        const sizes = JSON.parse(btn.getAttribute('data-sizes'));

        // Reset pilihan variasi & slider
        imgIndex = 0;
        selectedColor = "";
        selectedSize = "";
        
        // Isi konten Modal Detail
        document.getElementById('detail-name').innerText = currentProduct.name;
        document.getElementById('main-detail-img').src = currentImages[0];

        // === LOGIKA MENAMPILKAN RANGE HARGA AWAL ===
        let minPrice = Math.min(...currentProduct.prices);
        let maxPrice = Math.max(...currentProduct.prices);

        if (minPrice !== maxPrice) {
            // Tampilkan range (contoh: Rp 235.000 - Rp 300.000) jika ukuran belum diklik
            document.getElementById('detail-price').innerText = `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`;
        } else {
            // Tampilkan 1 harga jika semua ukuran harganya sama
            document.getElementById('detail-price').innerText = `Rp ${minPrice.toLocaleString('id-ID')}`;
        }

        // Set default price ke harga termurah untuk jaga-jaga
        currentProduct.price = minPrice; 

        // Tampilkan pilihan Warna & Ukuran
        renderOptions('color-options', colors, 'color');
        renderOptions('size-options', sizes, 'size');

        resetQty();

        // Buka modal detail
        document.getElementById('product-detail-modal').style.display = "block";
    }
});

// Fungsi untuk membuat tombol pilihan variasi (Warna/Ukuran)
function renderOptions(elementId, items, type) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";
    
    items.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = item;
        
        btn.onclick = () => {
            // Hapus kelas 'selected'
            document.querySelectorAll(`#${elementId} .option-btn`).forEach(b => b.classList.remove('selected'));
            // Tambah kelas 'selected'
            btn.classList.add('selected');
            
            if(type === 'color') {
                selectedColor = item;
                // Logika ganti gambar
                if (currentImages[index]) {
                    imgIndex = index; 
                    document.getElementById('main-detail-img').src = currentImages[imgIndex];
                }
            }
            
            if(type === 'size') {
                selectedSize = item;
                
                if (currentProduct.prices && currentProduct.prices[index]) {
                    // Update harga satuan produk yang aktif
                    currentProduct.price = currentProduct.prices[index];
                    
                    // Panggil fungsi hitung total harga otomatis
                    updateModalPriceDisplay(); 
                }
            }
        }; // Akhir dari event onclick
        container.appendChild(btn);
    });
}
// Fungsi Navigasi Slider Gambar
function nextImg() {
    imgIndex = (imgIndex + 1) % currentImages.length;
    document.getElementById('main-detail-img').src = currentImages[imgIndex];
}

function prevImg() {
    imgIndex = (imgIndex - 1 + currentImages.length) % currentImages.length;
    document.getElementById('main-detail-img').src = currentImages[imgIndex];
}

// Fungsi Konfirmasi Tambah ke Keranjang (Membaca jumlah Kuantitas)
document.getElementById('confirm-add-to-cart').onclick = function() {
    if(!selectedColor || !selectedSize) {
        alert("Silahkan pilih Warna dan Ukuran terlebih dahulu!");
        return;
    }
    
    // Ambil nilai kuantitas dari input, jika gagal default ke 1
    let qtyInput = document.getElementById('qty-input');
    let qtyValue = qtyInput ? parseInt(qtyInput.value) : 1;
    if (isNaN(qtyValue) || qtyValue < 1) qtyValue = 1;

    // Masukkan ke array cart dengan informasi variasi & Qty
    cart.push({
        name: `${currentProduct.name} (${selectedColor}, ${selectedSize})`,
        price: currentProduct.price,
        qty: qtyValue
    });
    
    updateCartUI();
    document.getElementById('product-detail-modal').style.display = "none";
    alert("Berhasil ditambahkan ke keranjang!");
};

document.querySelectorAll(".product-image").forEach(container => {
    const slider = container.querySelector(".image-slider");

    if (!slider) return; // ⬅️ penting biar tidak error

    const images = slider.querySelectorAll("img");

    let index = 0;
    let interval;

    container.addEventListener("mouseenter", () => {
        interval = setInterval(() => {
            index++;
            if (index >= images.length) index = 0;
            slider.style.transform = `translateX(-${index * 100}%)`;
        }, 1500);
    });

    container.addEventListener("mouseleave", () => {
        clearInterval(interval);
        slider.style.transform = "translateX(0)";
        index = 0;
    });
});

// =========================================
// FITUR TAMBAH/KURANG KUANTITAS DI MODAL
// =========================================
function increaseQty() {
    let qtyInput = document.getElementById('qty-input');
    if (qtyInput) {
        let currentValue = parseInt(qtyInput.value) || 1;
        qtyInput.value = currentValue + 1;
        
        // Panggil fungsi update harga setiap kuantitas nambah
        updateModalPriceDisplay(); 
    }
}

function decreaseQty() {
    let qtyInput = document.getElementById('qty-input');
    if (qtyInput) {
        let currentValue = parseInt(qtyInput.value) || 1;
        if (currentValue > 1) { 
            qtyInput.value = currentValue - 1;
            
            // Panggil fungsi update harga setiap kuantitas kurang
            updateModalPriceDisplay(); 
        }
    }
}

function resetQty() {
    let qtyInput = document.getElementById('qty-input');
    if (qtyInput) {
        qtyInput.value = 1;
    }
}

// Fungsi untuk update harga di layar Modal (Harga Satuan x Kuantitas)
function updateModalPriceDisplay() {
    let qtyInput = document.getElementById('qty-input');
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;
    if (isNaN(qty) || qty < 1) qty = 1;

    // Cek apakah ukuran belum dipilih DAN ada range harga
    if (!selectedSize && currentProduct.prices) {
        let minPrice = Math.min(...currentProduct.prices);
        let maxPrice = Math.max(...currentProduct.prices);
        
        if (minPrice !== maxPrice) {
            // Jika masih range harga, kalikan range-nya dengan kuantitas
            document.getElementById('detail-price').innerText = `Rp ${(minPrice * qty).toLocaleString('id-ID')} - Rp ${(maxPrice * qty).toLocaleString('id-ID')}`;
            return;
        }
    }

    // Jika ukuran sudah dipilih atau harganya cuma ada 1 macam
    let totalPrice = currentProduct.price * qty;
    document.getElementById('detail-price').innerText = "Rp " + totalPrice.toLocaleString('id-ID');
}

// =========================================
// 2. LOGIKA KERANJANG BELANJA
// =========================================

function updateCartUI() {
    const cartList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    
    cartCount.innerText = cart.length;

    if (cart.length === 0) {
        cartList.innerHTML = '<p style="text-align:center; color:#999; padding: 20px;">Keranjang kosong</p>';
        calculateTotal();
        return;
    }

    cartList.innerHTML = '';
    cart.forEach((item, index) => {
        // Tampilan list keranjang dengan tambahan tombol (+/-)
        cartList.innerHTML += `
            <div class="cart-item" style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                <input type="checkbox" class="cart-checkbox" data-index="${index}" checked onchange="calculateTotal()">
                
                <div class="item-info" style="flex-grow:1; margin-left:10px;">
                    <div style="font-size:0.9rem; font-weight:600;">${item.name}</div>
                    <div style="color:#8d6e63; font-size:0.9rem;">Rp ${item.price.toLocaleString('id-ID')}</div>
                </div>
                
                <div class="quantity-selector cart-qty" style="display:flex; align-items:center; margin-right:15px; border: 1px solid #ddd; border-radius: 4px;">
                    <button type="button" class="qty-btn minus" style="width:25px;height:25px;border:none;background:#f9f9f9;cursor:pointer;" onclick="changeCartQty(${index}, -1)">−</button>
                    <input type="text" class="qty-input-cart" style="width:30px;height:25px;text-align:center;border:none;border-left:1px solid #ddd;border-right:1px solid #ddd;" value="${item.qty}" readonly>
                    <button type="button" class="qty-btn plus" style="width:25px;height:25px;border:none;background:#f9f9f9;cursor:pointer;" onclick="changeCartQty(${index}, 1)">+</button>
                </div>

                <button class="delete-item" onclick="removeItem(${index})" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
            </div>
        `;
    });
    calculateTotal();
}

// Fungsi untuk merubah jumlah item langsung di dalam Keranjang
function changeCartQty(index, change) {
    cart[index].qty += change;
    
    // Jangan biarkan kuantitas barang menjadi 0
    if (cart[index].qty < 1) {
        cart[index].qty = 1;
    }
    
    updateCartUI(); // Update UI keranjang & hitung ulang harga
}

function calculateTotal() {
    const checkboxes = document.querySelectorAll('.cart-checkbox');
    const totalPriceElement = document.getElementById('total-price');
    let total = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const index = cb.getAttribute('data-index');
            // Menghitung harga dikalikan jumlah barang (Qty)
            total += (cart[index].price * cart[index].qty);
        }
    });

    totalPriceElement.innerText = "Rp " + total.toLocaleString('id-ID');
}

function removeItem(index) {
    if(confirm("Hapus item ini?")) {
        cart.splice(index, 1);
        updateCartUI();
    }
}

// =========================================
// 3. MODAL CONTROL (BUKA/TUTUP)
// =========================================

const cartModal = document.getElementById('cart-modal');
const detailModal = document.getElementById('product-detail-modal');

// Buka Keranjang
document.getElementById('open-cart').onclick = () => { 
    cartModal.style.display = "block"; 
    updateCartUI(); 
};

// Tutup Keranjang
document.querySelector('.close-btn').onclick = () => cartModal.style.display = "none";

// Tutup Detail Produk
document.querySelector('.close-detail').onclick = () => detailModal.style.display = "none";

// Tutup modal jika klik di luar area konten
window.onclick = (e) => { 
    if (e.target == cartModal) cartModal.style.display = "none"; 
    if (e.target == detailModal) detailModal.style.display = "none";
};

// =========================================
// 4. CHECKOUT VIA WHATSAPP
// =========================================

document.getElementById('checkout-whatsapp').onclick = function() {
    const checkboxes = document.querySelectorAll('.cart-checkbox');
    let selectedItems = [];
    let totalHarga = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const index = cb.getAttribute('data-index');
            selectedItems.push(cart[index]);
            // Hitung harga * kuantitas
            totalHarga += (cart[index].price * cart[index].qty);
        }
    });

    if (selectedItems.length === 0) return alert("Pilih barang dulu!");

    const noWA = "6281567682342"; 
    let listPesan = "";
    
    // Bikin daftar barang pakai %0A untuk enter
    selectedItems.forEach((item, i) => {
        // Format: 1. Nama Barang (Warna, Ukuran) (1x) [ENTER]
        listPesan += `${i + 1}. ${item.name} (${item.qty}x)%0A`;
    });
    
    // Susun format pesan utuhnya pakai %0A
    // %0A%0A artinya enter 2 kali (biar ada jarak spasi kosong)
    const pesan = `Halo Admin Zasmi Fashion, saya ingin memesan:%0A%0A${listPesan}%0A*Total Tagihan: Rp ${totalHarga.toLocaleString('id-ID')}*%0A%0AMohon info selanjutnya ya min.`;
    
    // Langsung buka link WhatsApp dengan pesan yang sudah ada kode %0A-nya
    window.open(`https://wa.me/${noWA}?text=${pesan}`, "_blank");
};