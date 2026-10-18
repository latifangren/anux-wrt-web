# ANUx-WRT Web Portal — v3 "the router computer"

Portal resmi & katalog unduhan firmware **[ANUx-WRT](https://github.com/latifangren/ANUx-WRT)**.

Retheme total mengikuti bahasa desain motherboard (v3), v4: full-bleed + dark mode (ref: Zajno/Superlinked
di Dribbble): halaman sebagai satu board — chassis gelap, sekrup sudut, trace PCB
berdenyut, pin array, LED, panel LCD cycler, dan boot sequence. Palet charcoal +
abu hangat + copper; tipografi Barlow Condensed / IBM Plex Mono / Inter.

Fungsi v1/v2/v3 dipertahankan penuh (GitHub Releases API + cache + fallback,
5 dimensi filter, parser nama file, XSS escaping) plus mode pratinjau yang jujur
(badge "DATA CONTOH", tombol unduh disabled sampai rilis pertama ada).

```text
├── index.html          # boot overlay, board, hero chip + modul, explorer, fitur, perangkat, panduan
├── css/style.css       # seluruh styling v3
├── js/main.js          # boot, LCD cycler, filter, render, count-up, reveal
├── js/parser.js        # parser nama file -> metadata (stabil sejak v1)
├── js/releases.js      # provider data rilis (cache key _v3)
└── docs/               # ARCHITECTURE.md, ROADMAP.md
```

Dev lokal: `python3 -m http.server 8000` → http://localhost:8000
