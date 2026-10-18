/**
 * ANUx-WRT Web Portal v2 — Interactive Controller
 * Filters, animated counters, scroll reveals, staggered row entrances.
 */

document.addEventListener("DOMContentLoaded", () => {
  let allFirmware = [];
  let filteredFirmware = [];

  const filters = { search: "", category: "all", kernelFlavor: "all", bootMode: "all", tunnel: "all" };

  const searchInput = document.getElementById("searchInput");
  const firmwareListEl = document.getElementById("firmwareList");
  const totalFwCountEl = document.getElementById("totalFwCount");
  const totalDownloadsEl = document.getElementById("totalDownloads");
  const totalSizeEl = document.getElementById("totalSize");
  const filteredCountEl = document.getElementById("filteredCount");

  // ---------- Inline SVG icon set (no emoji) ----------
  const I = {
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 9.4a15 15 0 0 1 20 0"/><path d="M5 12.9a10 10 0 0 1 14 0"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M12 20h.01"/></svg>',
    wifiOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12.9a10 10 0 0 1 5.2-2.8"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M12 20h.01"/><path d="m3 3 18 18"/></svg>',
    sd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><path d="M10 13h4M10 17h4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2z"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>'
  };

  init();

  async function init() {
    setupReveal();
    setupHeader();
    setupBurger();
    setupCardGlow();
    setupFilterEvents();
    await loadFirmwareData();
  }

  // ---------- Scroll reveal ----------
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target;
          if (el.dataset.delay) el.style.setProperty("--reveal-delay", el.dataset.delay + "ms");
          el.classList.add("visible");
          io.unobserve(el);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
  }

  // ---------- Header shrink on scroll ----------
  function setupHeader() {
    const header = document.getElementById("siteHeader");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Mobile nav ----------
  function setupBurger() {
    const burger = document.getElementById("navBurger");
    const nav = document.querySelector(".nav-links");
    if (!burger || !nav) return;
    burger.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  // ---------- Cursor glow on feature cards ----------
  function setupCardGlow() {
    document.querySelectorAll(".feature-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // ---------- Animated counters ----------
  function countUp(el, target, opts = {}) {
    if (!el) return;
    const duration = opts.duration || 1400;
    const format = opts.format || (v => Math.round(v).toLocaleString("id-ID"));
    const start = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = format(target); return; }
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = format(target);
    }
    requestAnimationFrame(frame);
  }

  // ---------- Data loading ----------
  async function loadFirmwareData() {
    firmwareListEl.innerHTML = `
      <div class="empty-state">
        <div class="spinner"></div>
        <p style="margin-top:18px;">Menghubungi GitHub Releases...</p>
      </div>`;

    const result = await ReleasesProvider.fetchReleases();
    const rawAssets = result.data || [];
    const isLive = !!result.isLive;
    const dataSource = result.source || "latifangren/ANUx-WRT";

    const statusBadge = document.getElementById("dataSourceBadge");
    if (statusBadge) {
      if (isLive) {
        statusBadge.className = "source-badge live";
        statusBadge.innerHTML = `<span class="sdot"></span> Live &mdash; GitHub Releases (${escapeHtml(dataSource)})`;
      } else {
        statusBadge.className = "source-badge preview";
        statusBadge.innerHTML = `<span class="sdot"></span> Pratinjau &mdash; menunggu rilis pertama`;
      }
    }

    allFirmware = rawAssets.map(asset => {
      const meta = FirmwareParser.parseFilename(asset.name) || {};
      return {
        ...meta,
        rawFilename: asset.name,
        sizeBytes: asset.size || 0,
        formattedSize: FirmwareParser.formatBytes(asset.size || 0),
        downloadCount: asset.download_count || 0,
        downloadUrl: asset.browser_download_url || "#"
      };
    });

    updateOverallStats();
    applyFilters();
  }

  function updateOverallStats() {
    const totalCount = allFirmware.length;
    const totalDl = allFirmware.reduce((a, c) => a + c.downloadCount, 0);
    const totalBytes = allFirmware.reduce((a, c) => a + c.sizeBytes, 0);

    countUp(totalFwCountEl, totalCount, { duration: 1100 });
    countUp(totalDownloadsEl, totalDl, { duration: 1500 });
    countUp(totalSizeEl, totalBytes, {
      duration: 1600,
      format: v => FirmwareParser.formatBytes(Math.round(v))
    });
  }

  // ---------- Filters ----------
  function setupFilterEvents() {
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        filters.search = e.target.value.toLowerCase().trim();
        applyFilters();
      });
    }
    setupChipGroup("categoryChips", "category");
    setupChipGroup("kernelChips", "kernelFlavor");
    setupChipGroup("bootChips", "bootMode");
    setupChipGroup("tunnelChips", "tunnel");
  }

  function setupChipGroup(containerId, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener("click", e => {
      const btn = e.target.closest(".chip-btn");
      if (!btn) return;
      container.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filters[filterKey] = btn.getAttribute("data-val");
      applyFilters();
    });
  }

  function applyFilters() {
    filteredFirmware = allFirmware.filter(fw => {
      if (filters.search) {
        const hay = `${fw.rawFilename} ${fw.deviceName} ${fw.kernel} ${fw.kernelFlavor} ${fw.bootMode} ${fw.tunnelText} ${fw.os} ${fw.wifi || ""}`.toLowerCase();
        if (!hay.includes(filters.search)) return false;
      }
      if (filters.category !== "all" && fw.category !== filters.category) return false;
      if (filters.kernelFlavor !== "all" && fw.kernelFlavor !== filters.kernelFlavor) return false;
      if (filters.bootMode !== "all") {
        if (filters.bootMode === "modsdcard" && !fw.bootMode.includes("MODSDCARD")) return false;
        if (filters.bootMode === "emmc" && fw.bootMode.includes("MODSDCARD")) return false;
      }
      if (filters.tunnel !== "all" && !fw.tunnelText.toLowerCase().includes(filters.tunnel.toLowerCase())) return false;
      return true;
    });
    renderList();
  }

  // ---------- Row rendering with stagger ----------
  function renderList() {
    if (filteredCountEl) {
      filteredCountEl.innerHTML = `Menampilkan <strong>${filteredFirmware.length}</strong> dari <strong>${allFirmware.length}</strong> firmware`;
    }

    if (filteredFirmware.length === 0) {
      firmwareListEl.innerHTML = `
        <div class="empty-state">
          <h3>Tidak ada firmware yang cocok</h3>
          <p>Coba ubah kata kunci atau kombinasi filter.</p>
        </div>`;
      return;
    }

    const html = filteredFirmware.map(fw => {
      const osClass = fw.os === "ImmortalWrt" ? "badge-os-immortal" : "badge-os-openwrt";
      const isModSdcard = (fw.bootMode || "").includes("MODSDCARD");

      let wifiBadge = "";
      if (fw.wifi === "WIFI ON") wifiBadge = `<span class="badge badge-wifion">${I.wifi}Wi-Fi ON</span>`;
      else if (fw.wifi === "WIFI OFF") wifiBadge = `<span class="badge badge-wifioff">${I.wifiOff}Wi-Fi OFF</span>`;

      const modBadge = isModSdcard
        ? `<span class="badge badge-modsdcard">${I.sd}MicroSD Boot</span>`
        : `<span class="badge badge-emmc">${I.bolt}eMMC / Direct</span>`;

      return `
        <div class="firmware-row">
          <div class="fw-main-info">
            <div class="fw-header-line">
              <span class="fw-device-title">${escapeHtml(fw.deviceName)}</span>
              <span class="badge ${osClass}">${escapeHtml(fw.os)}${fw.osVersion ? " " + escapeHtml(fw.osVersion) : ""}</span>
              <span class="badge badge-kernel">${I.chip}${escapeHtml(fw.kernel)} &middot; ${escapeHtml(fw.kernelFlavor)}</span>
              ${modBadge}
              ${wifiBadge}
              <span class="badge badge-tunnel">${I.link}${escapeHtml(fw.tunnelText)}</span>
            </div>
            <div class="fw-meta-line">
              <span class="fw-meta-item">Ukuran <strong>${escapeHtml(fw.formattedSize)}</strong></span>
              <span class="fw-meta-item">Format <strong>${escapeHtml(fw.rootfs)}</strong></span>
              <span class="fw-meta-item">Rilis <strong>${escapeHtml(fw.dateStr || "Terbaru")}</strong></span>
              <span class="fw-meta-item">Diunduh <strong>${Number(fw.downloadCount).toLocaleString("id-ID")}&times;</strong></span>
            </div>
            <div><span class="fw-filename">${escapeHtml(fw.rawFilename)}</span></div>
          </div>
          <div class="fw-actions">
            <button class="btn-copy" data-filename="${escapeAttr(fw.rawFilename)}">${I.copy}<span>Salin Nama</span></button>
            <a href="${escapeAttr(fw.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="btn-download">${I.download}Unduh</a>
          </div>
        </div>`;
    }).join("");

    firmwareListEl.innerHTML = html;

    // staggered entrance
    const rows = firmwareListEl.querySelectorAll(".firmware-row");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rows.forEach((row, i) => {
      if (reduce) { row.classList.add("row-in"); return; }
      row.style.transitionDelay = Math.min(i, 14) * 45 + "ms";
      requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("row-in")));
    });

    // copy buttons (event delegation-safe binding)
    firmwareListEl.querySelectorAll(".btn-copy").forEach(btn => {
      btn.addEventListener("click", () => copyToClipboard(btn.dataset.filename, btn));
    });
  }

  function copyToClipboard(text, btn) {
    const done = () => {
      const label = btn.querySelector("span");
      const old = label ? label.textContent : "";
      btn.classList.add("copied");
      btn.innerHTML = `${I.check}<span>Tersalin</span>`;
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = `${I.copy}<span>${old || "Salin Nama"}</span>`;
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  // ---------- Escaping ----------
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }
});
