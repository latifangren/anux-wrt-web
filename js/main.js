/**
 * ANUx-WRT Web Portal v3 — "the router computer"
 * Boot sequence, LCD cycler, honest preview mode, filters, staggered rows.
 */

document.addEventListener("DOMContentLoaded", () => {
  let allFirmware = [];
  let filteredFirmware = [];
  let isPreviewMode = true;
  let lastRenderAt = 0;
  let firstRenderDone = false;

  const filters = { search: "", category: "all", kernelFlavor: "all", bootMode: "all", tunnel: "all" };

  const searchInput = document.getElementById("searchInput");
  const firmwareListEl = document.getElementById("firmwareList");
  const totalFwCountEl = document.getElementById("totalFwCount");
  const totalDownloadsEl = document.getElementById("totalDownloads");
  const totalSizeEl = document.getElementById("totalSize");
  const filteredCountEl = document.getElementById("filteredCount");

  const I = {
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'
  };

  init();

  async function init() {
    setupTheme();
    setupReveal();
    setupHeader();
    setupBurger();
    setupLcd();
    setupFilterEvents();
    runBoot(() => loadFirmwareData());
  }

  // ---------- Theme toggle (light/dark), persisted ----------
  function setupTheme() {
    const root = document.documentElement;
    const btn = document.getElementById("themeToggle");
    const label = document.getElementById("themeLabel");
    const apply = t => {
      root.setAttribute("data-theme", t);
      if (label) label.textContent = t === "dark" ? "LIGHT" : "DARK";
      try { localStorage.setItem("anuxwrt_theme", t); } catch (e) {}
    };
    // head pre-script already set data-theme; just sync the label
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    if (label) label.textContent = current === "dark" ? "LIGHT" : "DARK";
    if (btn) btn.addEventListener("click", () => {
      apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  // ---------- Boot sequence ----------
  function runBoot(done) {
    const overlay = document.getElementById("bootOverlay");
    const linesEl = document.getElementById("bootLines");
    const fill = document.getElementById("bootFill");
    const pct = document.getElementById("bootPct");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!overlay || reduce) { done(); return; }

    const lines = [
      "> mem check ............ <span class='ok'>OK</span>",
      "> board rev 2.0 ........ <span class='ok'>OK</span>",
      "> mount /firmware ...... <span class='ok'>OK</span>",
      "> link github api ...... "
    ];
    let li = 0, progress = 0, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      overlay.classList.add("done");
      setTimeout(() => overlay.remove(), 600);
      done();
    };
    overlay.addEventListener("click", finish, { once: true });

    const typeLine = () => {
      if (li < lines.length) {
        const div = document.createElement("div");
        div.innerHTML = lines[li];
        linesEl.appendChild(div);
        li++;
        setTimeout(typeLine, 220);
      }
    };
    typeLine();

    const tick = () => {
      progress = Math.min(100, progress + 4 + Math.random() * 9);
      fill.style.width = progress + "%";
      pct.textContent = "LINKING… " + Math.floor(progress) + "%";
      if (progress >= 100) {
        const last = linesEl.lastChild;
        if (last) last.innerHTML += "<span class='ok'>OK</span>";
        setTimeout(finish, 350);
      } else {
        setTimeout(tick, 90 + Math.random() * 120);
      }
    };
    setTimeout(tick, 500);
    // hard cap: never trap the user
    setTimeout(() => { if (document.body.contains(overlay)) finish(); }, 6000);
  }

  // ---------- LCD device cycler ----------
  function setupLcd() {
    const wordEl = document.getElementById("lcdWord");
    const countEl = document.getElementById("lcdCount");
    const prev = document.getElementById("lcdPrev");
    const next = document.getElementById("lcdNext");
    if (!wordEl) return;
    const words = ["ZTE B860H", "RASPBERRY PI 5", "X86_64 MINI PC", "NANOPI R5S", "ORANGE PI 5", "HG680P", "MANGOPI M28K"];
    let idx = 0, timer = null;
    const show = i => {
      idx = (i + words.length) % words.length;
      wordEl.classList.add("swap");
      setTimeout(() => {
        wordEl.textContent = words[idx];
        if (countEl) countEl.textContent = String(idx + 1).padStart(2, "0");
        wordEl.classList.remove("swap");
      }, 180);
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => show(idx + 1), 4200); };
    if (prev) { const go = () => { show(idx - 1); auto(); }; prev.addEventListener("click", go); prev.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); }
    if (next) { const go = () => { show(idx + 1); auto(); }; next.addEventListener("click", go); next.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) auto();
  }

  // ---------- Scroll reveal ----------
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("visible")); return; }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target;
          if (el.dataset.delay) el.style.setProperty("--reveal-delay", el.dataset.delay + "ms");
          el.classList.add("visible");
          io.unobserve(el);
        }
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
  }

  function setupHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupBurger() {
    const burger = document.getElementById("navBurger");
    const nav = document.querySelector(".nav-links");
    if (!burger || !nav) return;
    burger.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  // ---------- Animated counters ----------
  function countUp(el, target, opts = {}) {
    if (!el) return;
    const duration = opts.duration || 1400;
    const format = opts.format || (v => Math.round(v).toLocaleString("id-ID"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = format(target); return; }
    const start = performance.now();
    (function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(frame); else el.textContent = format(target);
    })(start);
  }

  // ---------- Data ----------
  async function loadFirmwareData() {
    firmwareListEl.innerHTML = `
      <div class="empty-state">
        <div class="spinner"></div>
        <p style="margin-top:18px;">MEMERIKSA GITHUB RELEASES…</p>
      </div>`;

    const result = await ReleasesProvider.fetchReleases();
    const rawAssets = result.data || [];
    isPreviewMode = !result.isLive;
    const dataSource = result.source || "latifangren/ANUx-WRT";

    const badge = document.getElementById("dataSourceBadge");
    if (badge) {
      if (isPreviewMode) {
        badge.className = "spec-val small preview";
        badge.textContent = "PRATINJAU — DATA CONTOH";
      } else {
        badge.className = "spec-val small live";
        badge.textContent = "LIVE — " + dataSource.toUpperCase();
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
    countUp(totalSizeEl, totalBytes, { duration: 1600, format: v => FirmwareParser.formatBytes(Math.round(v)) });
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
      container.querySelectorAll(".chip-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
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

  // ---------- Rows ----------
  function renderList() {
    if (filteredCountEl) {
      filteredCountEl.innerHTML = `MENAMPILKAN <strong>${filteredFirmware.length}</strong> / <strong>${allFirmware.length}</strong> UNIT${isPreviewMode ? " — <strong>DATA CONTOH</strong>" : ""}`;
    }

    if (filteredFirmware.length === 0) {
      firmwareListEl.innerHTML = `
        <div class="empty-state">
          <h3>Tidak ada unit yang cocok</h3>
          <p>Ubah kata kunci atau kombinasi filter.</p>
        </div>`;
      return;
    }

    const html = filteredFirmware.map(fw => {
      const osBadge = fw.os === "ImmortalWrt"
        ? `<span class="badge b-os-immortal"><span class="swatch"></span>${escapeHtml(fw.os)}${fw.osVersion ? " " + escapeHtml(fw.osVersion) : ""}</span>`
        : `<span class="badge b-os-openwrt"><span class="swatch"></span>${escapeHtml(fw.os)}${fw.osVersion ? " " + escapeHtml(fw.osVersion) : ""}</span>`;
      const isModSdcard = (fw.bootMode || "").includes("MODSDCARD");
      const modBadge = isModSdcard
        ? `<span class="badge b-sd"><span class="swatch"></span>MicroSD Boot</span>`
        : `<span class="badge b-emmc"><span class="swatch"></span>eMMC / Direct</span>`;
      let wifiBadge = "";
      if (fw.wifi === "WIFI ON") wifiBadge = `<span class="badge b-wifion"><span class="swatch"></span>Wi-Fi ON</span>`;
      else if (fw.wifi === "WIFI OFF") wifiBadge = `<span class="badge b-wifioff"><span class="swatch"></span>Wi-Fi OFF</span>`;

      // Honest preview mode: no fake download buttons
      const action = isPreviewMode
        ? `<span class="btn-download disabled" title="Menunggu rilis firmware pertama">${I.download}Segera</span>`
        : `<a href="${escapeAttr(fw.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="btn-download">${I.download}Unduh</a>`;

      return `
        <div class="firmware-row">
          <div class="fw-slot"><span class="led"></span><span class="fw-pins"></span></div>
          <div class="fw-main-info">
            <div class="fw-header-line">
              <span class="fw-device-title">${escapeHtml(fw.deviceName)}</span>
              ${osBadge}
              <span class="badge b-kernel"><span class="swatch"></span>${escapeHtml(fw.kernel)} · ${escapeHtml(fw.kernelFlavor)}</span>
              ${modBadge}${wifiBadge}
              <span class="badge b-tunnel"><span class="swatch"></span>${escapeHtml(fw.tunnelText)}</span>
            </div>
            <div class="fw-meta-line">
              <span>UKURAN <strong>${escapeHtml(fw.formattedSize)}</strong></span>
              <span>FORMAT <strong>${escapeHtml(fw.rootfs)}</strong></span>
              <span>RILIS <strong>${escapeHtml(fw.dateStr || "—")}</strong></span>
              ${isPreviewMode ? "" : `<span>DIUNDUH <strong>${Number(fw.downloadCount).toLocaleString("id-ID")}×</strong></span>`}
            </div>
            <div><span class="fw-filename">${escapeHtml(fw.rawFilename)}</span></div>
          </div>
          <div class="fw-actions">
            ${isPreviewMode ? "" : `<button class="btn-copy" data-filename="${escapeAttr(fw.rawFilename)}">${I.copy}<span>Salin</span></button>`}
            ${action}
          </div>
        </div>`;
    }).join("");

    firmwareListEl.innerHTML = html;

    // staggered entrance — only on first render or after idle (>600ms), never per keystroke
    const now = performance.now();
    const animate = !firstRenderDone || (now - lastRenderAt > 600);
    lastRenderAt = now; firstRenderDone = true;
    const rows = firmwareListEl.querySelectorAll(".firmware-row");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rows.forEach((row, i) => {
      if (reduce || !animate) { row.classList.add("row-in"); return; }
      row.style.transitionDelay = Math.min(i, 12) * 50 + "ms";
      requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("row-in")));
    });

    firmwareListEl.querySelectorAll(".btn-copy").forEach(btn => {
      btn.addEventListener("click", () => copyToClipboard(btn.dataset.filename, btn));
    });
  }

  function copyToClipboard(text, btn) {
    const done = () => {
      btn.classList.add("copied");
      btn.innerHTML = `${I.check}<span>Tersalin</span>`;
      setTimeout(() => { btn.classList.remove("copied"); btn.innerHTML = `${I.copy}<span>Salin</span>`; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }
});
