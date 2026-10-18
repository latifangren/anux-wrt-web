# ANUx-WRT Web — Arsitektur v2 ("network pulse")

Situs statis murni (HTML/CSS/JS vanilla), deploy via GitHub Pages. Tanpa build step, tanpa framework.

## Struktur

```text
anux-wrt-web/
├── index.html          # struktur halaman: hero, explorer, fitur, perangkat, panduan, footer
├── css/style.css       # seluruh styling + keyframes animasi
├── js/net-canvas.js    # background canvas: node + paket data beranimasi
├── js/parser.js        # parser nama file firmware -> metadata (device, kernel, tunnel, ...)
├── js/releases.js      # provider data: GitHub Releases API + cache + fallback
├── js/main.js          # controller: filter, render list, count-up, reveal on scroll
└── docs/               # dokumentasi (file ini + ROADMAP.md)
```

## Aliran data

1. `ReleasesProvider.fetchReleases()`:
   - Cek `localStorage` (`anuxwrt_releases_cache_v2`, TTL 15 menit).
   - Fetch `GET api.github.com/repos/latifangren/ANUx-WRT/releases?per_page=100`,
     ambil asset `.img.gz` / `.img.xz` / `.tar.gz` dari semua rilis.
   - Gagal / kosong → dataset fallback lokal (14 file contoh, mode pratinjau).
2. `FirmwareParser.parseFilename(name)` mengubah tiap nama file menjadi
   `{ deviceName, category, os, osVersion, kernel, kernelFlavor, bootMode, wifi, rootfs, tunnelText, dateStr }`.
3. `main.js` menerapkan 5 filter (search, kategori, kernel, boot, tunnel),
   me-render `.firmware-row` dengan entrance stagger, dan menganimasikan
   counter statistik (count-up easeOutQuart).

## Animasi

| Area | Teknik |
|---|---|
| Background hero | `<canvas>` vanilla: node melayang + edge + paket glow (cyan/orange). Pause saat tab hidden, skip bila `prefers-reduced-motion`. |
| Judul hero | gradient text dengan `background-position` animation |
| Statistik | count-up via `requestAnimationFrame` |
| Section & kartu | `IntersectionObserver` → class `.visible` (translateY + fade, delay via `data-delay`) |
| Baris firmware | stagger `.row-in` per render (45ms/row, max 15) |
| Badge sumber | pulse dot (live hijau / pratinjau kuning) |
| Kartu fitur | radial glow mengikuti kursor (`--mx/--my`) |
| Loading | `.spinner` (border-top rotate) + skeleton shimmer |

## Catatan

- Tidak ada emoji di UI — ikon memakai inline SVG.
- Semua teks user-generated (nama file dsb.) di-escape via `escapeHtml`/`escapeAttr`.
- Cache key berversi (`_v2`) agar visitor lama tidak terjebak data basi.
