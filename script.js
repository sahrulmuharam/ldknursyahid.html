document.addEventListener('DOMContentLoaded', function() {

    /**
     * Menginisialisasi logika untuk navbar, seperti efek scroll dan menandai link aktif.
     */
    const initializeNavbar = () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            navbar.classList.toggle('navbar-scrolled', isScrolled);
        };

        const setActiveLink = () => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Default to 'index.html' if path is empty
            navbar.querySelectorAll('.nav-link, .dropdown-item').forEach(link => { // Changed 'navbarElement' to 'navbar'
                link.classList.remove('active');
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                    const parentDropdown = link.closest('.nav-item.dropdown');
                    if (parentDropdown) {
                        parentDropdown.querySelector('.dropdown-toggle')?.classList.add('active');
                    }
                }
            });
        };

        handleScroll();
        setActiveLink(); // Call setActiveLink immediately
        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(handleScroll);
        });
    };

    /**
     * Menginisialisasi validasi form Bootstrap.
     */
    const initializeFormValidation = () => {
        const forms = document.querySelectorAll('.needs-validation');
        forms.forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    };

    /**
     * Menginisialisasi fungsionalitas untuk halaman laporan (pencarian dan pengurutan tabel).
     */
    const initializeLaporanPage = () => {
        const table = document.getElementById('laporanTable'); // Pastikan elemen ada
        if (!table) return;

        const searchInput = document.getElementById('searchInput');
        const tbody = table.querySelector('tbody');
        const headers = table.querySelectorAll('th[data-sortable]');

        // Logika Pencarian
        if (searchInput && tbody) {
            searchInput.addEventListener('keyup', () => {
                const searchTerm = searchInput.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(row => {
                    const monthCellText = row.querySelector('td:first-child').textContent.toLowerCase();
                    row.style.display = monthCellText.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // Logika Pengurutan
        if (headers.length > 0 && tbody) {
            const directions = Array.from(headers).map(() => '');

            const transform = (index, content) => {
                // Kolom Bulan diurutkan secara kronologis
                if (index === 0) {
                    const monthOrder = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    return monthOrder.indexOf(content.trim());
                }
                // Kolom Pemasukan/Pengeluaran diurutkan sebagai angka
                if (index === 1 || index === 2) {
                    return parseFloat(content.replace(/[^0-9,-]+/g, ''));
                }
                return content;
            };

            headers.forEach((header, index) => {
                header.addEventListener('click', () => {
                    const direction = directions[index] === 'asc' ? 'desc' : 'asc';
                    const rows = Array.from(tbody.querySelectorAll('tr'));

                    const sortedRows = rows.sort((a, b) => {
                        const contentA = a.querySelectorAll('td')[index].innerText;
                        const contentB = b.querySelectorAll('td')[index].innerText;
                        const valueA = transform(index, contentA);
                        const valueB = transform(index, contentB);
                        return direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
                    });

                    tbody.innerHTML = '';
                    tbody.append(...sortedRows);

                    directions.fill('');
                    directions[index] = direction;
                });
            });
        }
    };

    /**
     * Menginisialisasi fungsionalitas untuk halaman detail laporan.
     */
    const initializeLaporanDetailPage = () => {
        if (!document.getElementById('laporan-bulan-title')) return; // Pastikan elemen ada

        const renderError = (message) => {
            document.getElementById('laporan-bulan-title').textContent = "Laporan Tidak Ditemukan";
            document.getElementById('laporan-summary').textContent = message || "Data untuk bulan yang Anda pilih tidak tersedia.";
        };

        // Data laporan dipindahkan kembali ke sini untuk menghilangkan ketergantungan pada fetch()
        const dataLaporan = {
            "Januari": { "pemasukan": [{ "item": "Donasi Anggota", "jumlah": 500000 }, { "item": "Hasil Penjualan Merchandise", "jumlah": 500000 }], "pengeluaran": [{ "item": "Biaya Kajian Pekanan", "jumlah": 300000 }, { "item": "Cetak Buletin Dakwah", "jumlah": 250000 }, { "item": "ATK Sekretariat", "jumlah": 250000 }] },
            "Februari": { "pemasukan": [{ "item": "Donasi Anggota", "jumlah": 500000 }, { "item": "Sponsor Acara Seminar", "jumlah": 750000 }], "pengeluaran": [{ "item": "Biaya Seminar", "jumlah": 600000 }, { "item": "Konsumsi Rapat", "jumlah": 150000 }, { "item": "Transportasi Pembicara", "jumlah": 200000 }] },
            "Maret": { "pemasukan": [{ "item": "Donasi Anggota", "jumlah": 500000 }, { "item": "Hasil Bazar Buku Bekas", "jumlah": 400000 }], "pengeluaran": [{ "item": "Biaya Kajian Pekanan", "jumlah": 300000 }, { "item": "Pembelian Buku untuk Perpustakaan", "jumlah": 200000 }, { "item": "Biaya Listrik & Internet Sekretariat", "jumlah": 200000 }] }
        };

        const params = new URLSearchParams(window.location.search);
        const bulan = params.get('bulan');
        const laporan = dataLaporan[bulan];
        const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

        if (laporan) {
            document.getElementById('laporan-bulan-title').textContent = `Detail Laporan Bulan ${bulan}`;
            const totalPemasukan = laporan.pemasukan.reduce((sum, item) => sum + item.jumlah, 0);
            const totalPengeluaran = laporan.pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
            const saldoAkhir = totalPemasukan - totalPengeluaran;

            document.getElementById('laporan-summary').textContent = `Total Pemasukan: ${formatRupiah(totalPemasukan)} | Total Pengeluaran: ${formatRupiah(totalPengeluaran)} | Saldo Akhir: ${formatRupiah(saldoAkhir)}`;

            const renderTableRows = (tbodyId, data) => {
                const tbody = document.getElementById(tbodyId);
                if (tbody) {
                    tbody.innerHTML = data.map(p => `<tr><td>${p.item}</td><td class="text-end">${formatRupiah(p.jumlah)}</td></tr>`).join('');
                }
            };

            renderTableRows('pemasukan-detail', laporan.pemasukan);
            document.getElementById('total-pemasukan').textContent = formatRupiah(totalPemasukan);

            renderTableRows('pengeluaran-detail', laporan.pengeluaran);
            document.getElementById('total-pengeluaran').textContent = formatRupiah(totalPengeluaran);
        } else {
            renderError();
        }
    };

    /**
     * Menginisialisasi event listener untuk modal galeri.
     */
    const initializeGalleryModal = () => {
        const galleryModal = document.getElementById('galleryModal'); // Pastikan elemen ada
        if (!galleryModal) return;

        galleryModal.addEventListener('show.bs.modal', (event) => {
            const triggerElement = event.relatedTarget;
            const imageSrc = triggerElement.getAttribute('data-img-src');
            const modalImage = document.getElementById('modalImage');
            if (modalImage) modalImage.src = imageSrc;
        });
    };

    /**
     * Menginisialisasi smooth scroll untuk anchor links.
     */
    const initializeSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => { // Pilih semua tautan yang mengarah ke ID
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId.length > 1) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        // Gunakan window.scrollTo untuk offset jika ada fixed header
                        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0; // Ambil tinggi navbar
                        window.scrollTo({ top: offsetTop - navbarHeight - 20, behavior: 'smooth' }); // Kurangi tinggi navbar + sedikit padding
                    }
                }
            });
        });
    };

    /**
     * Menginisialisasi lazy loading untuk gambar menggunakan Intersection Observer.
     * Gambar yang akan di-lazy load harus memiliki class 'lazy-load' dan atribut 'data-src'.
     * Contoh: <img src="placeholder.gif" data-src="actual-image.jpg" class="lazy-load" alt="...">
     */
    const initializeLazyLoading = () => {
        const lazyImages = document.querySelectorAll('img.lazy-load');

        if ('IntersectionObserver' in window) {
            let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;
                        if (lazyImage.dataset.src) { // Pastikan ada data-src
                            lazyImage.src = lazyImage.dataset.src;
                            // Jika ada srcset, bisa ditambahkan juga: lazyImage.srcset = lazyImage.dataset.srcset;
                        }
                        lazyImage.classList.remove('lazy-load');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            }, {
                rootMargin: '0px', // Margin di sekitar root (viewport)
                threshold: 0.01 // Trigger saat 1% dari elemen terlihat
            });

            lazyImages.forEach(function(lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            // Fallback untuk browser yang tidak mendukung Intersection Observer: muat semua gambar
            lazyImages.forEach(lazyImage => {
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                }
            });
        }
    };

    /**
     * Menginisialisasi efek fade-in saat elemen di-scroll ke dalam viewport.
     * Elemen harus memiliki kelas 'fade-in-on-scroll' atau 'fade-in-element'.
     */
    const initializeFadeInOnScroll = () => {
        const fadeInElements = document.querySelectorAll('.fade-in-on-scroll, .fade-in-element');

        if ('IntersectionObserver' in window) {
            let observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Stop observing once visible
                    }
                });
            }, {
                rootMargin: '0px',
                threshold: 0.1 // Trigger when 10% of the element is visible
            });

            fadeInElements.forEach(element => {
                // Check if element already has 'is-visible' (e.g., for pendaftaran-sukses.html)
                if (!element.classList.contains('is-visible')) {
                    observer.observe(element);
                }
            });
        } else {
            // Fallback for browsers without IntersectionObserver: show all elements immediately
            fadeInElements.forEach(element => {
                element.classList.add('is-visible');
            });
        }
    };

    /**
     * Mengupdate tahun hak cipta secara dinamis.
     */
    const updateCopyrightYear = () => {
        const copyrightYearElement = document.getElementById('copyright-year');
        if (copyrightYearElement) {
            copyrightYearElement.textContent = new Date().getFullYear();
        }
    };

    /**
     * Fungsi utama untuk menjalankan semua inisialisasi.
     */
    initializeNavbar(); // Panggil tanpa parameter
    initializeFormValidation();
    initializeLaporanPage();
    initializeLaporanDetailPage();
    initializeGalleryModal();
    initializeSmoothScroll();
    initializeLazyLoading(); // NEW: Call lazy loading
    initializeFadeInOnScroll(); // NEW: Call fade-in-on-scroll
    updateCopyrightYear(); // NEW: Call copyright year update
});