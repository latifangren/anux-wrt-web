# ANUx-WRT Web Portal — v2 "network pulse"

Portal resmi & katalog unduhan firmware **[ANUx-WRT](https://github.com/latifangren/ANUx-WRT)**.

Rebuild total dari v1: estetika "network pulse" — canvas animasi paket data di hero,
count-up statistik, scroll reveal, dan section Fitur / Perangkat / Panduan Flash.
Seluruh fungsi v1 dipertahankan (GitHub Releases API + cache 15 mnt + fallback dataset,
5 dimensi filter, parser nama file, proteksi XSS).

## Struktur

```text
├── index.html          # hero, explorer, fitur, perangkat, panduan, footer
├── css/style.css       # styling + seluruh keyframes animasi
├── js/net-canvas.js    # background canvas animasi (vanilla, tanpa lib)
├── js/parser.js        # parser nama file -> metadata firmware
├── js/releases.js      # provider data rilis (cache key berversi _v2)
├── js/main.js          # filter, render, count-up, reveal
└── docs/               # ARCHITECTURE.md, ROADMAP.md
```

## Deploy

Upload seluruh isi folder ini ke root repo `latifangren/anux-wrt-web`
(menimpa `index.html`, `css/`, `js/` lama), GitHub Pages akan serve otomatis.

## Dev lokal

```bash
python3 -m http.server 8000   # buka http://localhost:8000
```
