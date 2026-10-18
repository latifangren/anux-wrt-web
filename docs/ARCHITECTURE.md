# Arsitektur Web Portal ANUx-WRT

Dokumen ini menjelaskan rancangan arsitektur teknis, teknologi, dan alur integrasi data untuk web portal **ANUx-WRT**.

---

## 1. Prinsip Desain
* **Zero Backend Overhead**: Berjalan murni sebagai Static Site (HTML5/CSS3/Vanilla JS atau Static Site Generator seperti Vite/Astro) tanpa membutuhkan server PHP atau database berat.
* **Hosting**: GitHub Pages (`https://latifangren.github.io/anux-wrt-web/` atau custom domain kustom via `CNAME`).
* **Dynamic Release Fetching**: Memanfaatkan GitHub REST API publik untuk mengambil rilis dan aset download terbaru secara otomatis tanpa perlu mengedit HTML setiap ada rilis baru.

---

## 2. Struktur Modul Rencana

```text
web/anux-wrt-web/
├── index.html              # Halaman depan (Landing page & ringkasan)
├── downloads/              # Katalog download firmware interaktif
│   └── index.html
├── guides/                 # Panduan instalasi dan flashing per-device
│   ├── amlogic-stb.html
│   ├── raspberry-pi.html
│   └── x86-pc.html
├── assets/                 # Aset statis
│   ├── css/                # Tema Dark/Light & style responsif
│   ├── js/                 # GitHub API release parser & filter perangkat
│   └── img/                # Logo, ikon perangkat, dan screenshot UI
└── docs/                   # Dokumentasi pengembang web
    ├── ARCHITECTURE.md
    └── ROADMAP.md
```

---

## 3. Integrasi GitHub Releases API

Untuk menyajikan link unduhan firmware `.img.gz` terbaru:
* **Endpoint API**:  
  `GET https://api.github.com/repos/latifangren/ANUx-WRT/releases/latest`
* **Parser Logika**:
  - Ambil daftar array `assets`.
  - Ekstrak nama file berformat `ANUx-<BASE>-<BRANCH>-<TARGET>-<TUNNEL>-<DATE>.img.gz`.
  - Kelompokkan aset berdasarkan kategori:
    1. **x86_64** (PC / Mini PC)
    2. **Raspberry Pi** (Pi 2B, 3B, 4B, 5)
    3. **Amlogic TV Box** (B860H, HG680P, S905X3, S905X4)
    4. **Rockchip** (NanoPi, OrangePi 5)
    5. **Allwinner** (OrangePi Zero 2/3, 3 LTS)
  - Tampilkan tombol unduh langsung dengan label ukuran file dan jumlah download.

---

## 4. Keamanan & Performa
* Menggunakan cache browser (LocalStorage) untuk menyimpan hasil query GitHub API selama 10–30 menit agar tidak terkena *rate-limit* GitHub API unauthenticated (60 request/jam).
* Menggunakan SVG icons dan CSS native variable untuk menjamin *bundle size* di bawah 200 KB.
