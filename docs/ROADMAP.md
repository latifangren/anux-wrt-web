# Rencana Pengembangan (Roadmap) Web Portal ANUx-WRT

Dokumen ini memetakan tahapan rilis dan fitur yang direncanakan untuk website portal **ANUx-WRT**.

---

## 🚩 Fase 1: Fondasi Repositori & Dokumentasi (Selesai ✅)
- [x] Inisialisasi struktur repositori lokal `web/anux-wrt-web`.
- [x] Dokumentasi arsitektur teknis (`ARCHITECTURE.md`).
- [x] Penyusunan rencana fitur dan integrasi API (`ROADMAP.md`).
- [x] Konfigurasi isolasi gitignore dari repositori utama firmware `ANUx-WRT`.

---

## 🚀 Fase 2: Landing Page & Katalog Unduhan (Tahap Berikutnya)
- [ ] Pembuatan `index.html` landing page dengan hero section, fitur unggulan (Footstrap & Vantage theme, 4G/5G modem, FileBrowser Go, Google BBR).
- [ ] Integrasi Dark Mode dan Light Mode switcher (auto-detect OS preference).
- [ ] Komponen filter unduhan perangkat (Tabs: x86, TV Box Amlogic, Raspberry Pi, Rockchip, Allwinner).
- [ ] Script JavaScript pemanggil GitHub Releases API dengan caching LocalStorage.

---

## 📖 Fase 3: Panduan & Dokumentasi Pengguna
- [ ] Panduan flashing MicroSD / USB drive menggunakan BalenaEtcher & Rufus.
- [ ] Panduan Mod SDCARD untuk STB ZTE B860H & Fiberhome HG680P.
- [ ] Panduan konfigurasi awal: login LuCI, setting APN modem 4G/5G, lock band frekuensi, dan aktivasi tunnel VPN (OpenClash/Nikki).
- [ ] FAQ & Troubleshooting umum (mengatasi read-only, port collision, TTL fix).

---

## 🌐 Fase 4: Deployment & Domain Kustom
- [ ] Penyiapan GitHub Actions workflow untuk auto-deploy ke GitHub Pages.
- [ ] Pendaftaran domain kustom (opsional) via konfigurasi `CNAME`.
- [ ] Optimasi SEO meta tags, OpenGraph sharing preview, dan favicon.
