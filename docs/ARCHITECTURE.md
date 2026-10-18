# ANUx-WRT Web — Arsitektur v3 ("the router computer")

Situs statis murni (HTML/CSS/JS vanilla), deploy via GitHub Pages. Tanpa build step.

Referensi desain: shot Dribbble Zajno "Landing Page Design for an Open-Source
AI Tool" (Superlinked) — halaman sebagai satu motherboard: chassis gelap,
board abu hangat, trace PCB, sekrup sudut, LED, panel LCD, boot sequence.

## Struktur

```text
anux-wrt-web/
├── index.html          # boot overlay, board, hero chip + modul, explorer, fitur, perangkat, panduan
├── css/style.css       # seluruh styling v3 (board/chassis/LCD/LED/trace)
├── js/main.js          # boot, LCD cycler, filter, render, count-up, reveal
├── js/parser.js        # parser nama file firmware -> metadata (tidak berubah sejak v1)
├── js/releases.js      # provider data (cache key berversi _v3)
└── docs/               # ARCHITECTURE.md, ROADMAP.md
```

## Bahasa visual

| Elemen | Implementasi |
|---|---|
| Chassis | `.chassis` padding gelap `#0b0c0e`, `.board` radius 18px + shadow |
| Sekrup sudut | `.screw` — radial gradient + slot, rotasi acak per sudut |
| Trace PCB | SVG inline `.trace-layer`: trace statis abu + `.traces-live` copper dengan animasi `stroke-dashoffset` |
| Pin array | `.pin-strip` — repeating-linear-gradient |
| LED | `.led` — dot copper + glow, blink 2.4s (delay bervariasi via `.d2/.d3`) |
| LCD | `.lcd-panel` — inset gelap, teks amber `#ffb000` + text-shadow, scanlines via repeating gradient |
| Boot overlay | `#bootOverlay` — baris log diketik + progress bar "LINKING… %", max 6 detik, klik untuk skip |
| Tipografi | Barlow Condensed (display, uppercase), IBM Plex Mono (label/LCD), Inter (body) |

## Kejujuran mode pratinjau

- Badge sumber: `PRATINJAU — DATA CONTOH` (amber) vs `LIVE — <repo>` (hijau).
- Di preview mode: tombol unduh jadi disabled "Segera", kolom "DIUNDUH" disembunyikan,
  tombol "Salin" disembunyikan, counter hasil filter melabeli "DATA CONTOH".
- Tidak ada angka dummy yang disajikan seolah data asli.

## Aliran data

Sama seperti v2: `ReleasesProvider` (cache 15 mnt → API → fallback) →
`FirmwareParser.parseFilename` → filter 5 dimensi → render `.firmware-row`
dengan stagger hanya di render pertama / setelah idle 600ms (tidak per keystroke).
