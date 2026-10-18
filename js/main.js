/**
 * ANUx-WRT Web Portal - Main Interactive Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  let allFirmware = [];
  let filteredFirmware = [];

  // Filter states
  const filters = {
    search: "",
    category: "all",
    kernelFlavor: "all",
    bootMode: "all",
    tunnel: "all"
  };

  // DOM Elements
  const searchInput = document.getElementById("searchInput");
  const firmwareListEl = document.getElementById("firmwareList");
  const totalFwCountEl = document.getElementById("totalFwCount");
  const totalDownloadsEl = document.getElementById("totalDownloads");
  const totalSizeEl = document.getElementById("totalSize");
  const filteredCountEl = document.getElementById("filteredCount");

  // Init
  init();

  async function init() {
    setupFilterEvents();
    await loadFirmwareData();
  }

  async function loadFirmwareData() {
    firmwareListEl.innerHTML = `
      <div class="empty-state">
        <div class="spinner"></div>
        <p style="margin-top: 16px;">Memuat data rilis firmware dari server...</p>
      </div>
    `;

    const rawAssets = await ReleasesProvider.fetchReleases();

    allFirmware = rawAssets.map(asset => {
      const meta = FirmwareParser.parseFilename(asset.name);
      return {
        ...meta,
        sizeBytes: asset.size,
        formattedSize: FirmwareParser.formatBytes(asset.size),
        downloadCount: asset.download_count || 0,
        downloadUrl: asset.browser_download_url
      };
    });

    updateOverallStats();
    applyFilters();
  }

  function updateOverallStats() {
    const totalCount = allFirmware.length;
    const totalDl = allFirmware.reduce((acc, cur) => acc + cur.downloadCount, 0);
    const totalBytes = allFirmware.reduce((acc, cur) => acc + cur.sizeBytes, 0);

    if (totalFwCountEl) totalFwCountEl.textContent = totalCount.toLocaleString("id-ID");
    if (totalDownloadsEl) totalDownloadsEl.textContent = totalDl.toLocaleString("id-ID");
    if (totalSizeEl) totalSizeEl.textContent = FirmwareParser.formatBytes(totalBytes);
  }

  function setupFilterEvents() {
    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        filters.search = e.target.value.toLowerCase().trim();
        applyFilters();
      });
    }

    // Category chips
    setupChipGroup("categoryChips", "category");
    setupChipGroup("kernelChips", "kernelFlavor");
    setupChipGroup("bootChips", "bootMode");
    setupChipGroup("tunnelChips", "tunnel");
  }

  function setupChipGroup(containerId, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener("click", (e) => {
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
      // 1. Search text match
      if (filters.search) {
        const hay = `${fw.rawFilename} ${fw.deviceName} ${fw.kernel} ${fw.kernelFlavor} ${fw.bootMode} ${fw.tunnelText} ${fw.os} ${fw.wifi || ""}`.toLowerCase();
        if (!hay.includes(filters.search)) return false;
      }

      // 2. Category match
      if (filters.category !== "all") {
        if (fw.category !== filters.category) return false;
      }

      // 3. Kernel Flavor match
      if (filters.kernelFlavor !== "all") {
        if (fw.kernelFlavor !== filters.kernelFlavor) return false;
      }

      // 4. Boot Mode match
      if (filters.bootMode !== "all") {
        if (filters.bootMode === "modsdcard" && !fw.bootMode.includes("MODSDCARD")) return false;
        if (filters.bootMode === "emmc" && fw.bootMode.includes("MODSDCARD")) return false;
      }

      // 5. Tunnel match
      if (filters.tunnel !== "all") {
        if (!fw.tunnelText.toLowerCase().includes(filters.tunnel.toLowerCase())) return false;
      }

      return true;
    });

    renderList();
  }

  function renderList() {
    if (filteredCountEl) {
      filteredCountEl.textContent = `${filteredFirmware.length} dari ${allFirmware.length} firmware`;
    }

    if (filteredFirmware.length === 0) {
      firmwareListEl.innerHTML = `
        <div class="empty-state">
          <h3>Tidak Ada Firmware yang Cocok</h3>
          <p>Coba sesuaikan kata kunci pencarian atau ubah kombinasi filter kategori.</p>
        </div>
      `;
      return;
    }

    const html = filteredFirmware.map(fw => {
      const osClass = fw.os === "ImmortalWrt" ? "badge-os-immortal" : "badge-os-openwrt";
      const isModSdcard = fw.bootMode.includes("MODSDCARD");
      
      let wifiBadge = "";
      if (fw.wifi === "WIFI ON") {
        wifiBadge = `<span class="badge badge-wifion">📶 Wi-Fi ON</span>`;
      } else if (fw.wifi === "WIFI OFF") {
        wifiBadge = `<span class="badge badge-wifioff">🚫 Wi-Fi OFF</span>`;
      }

      const modBadge = isModSdcard 
        ? `<span class="badge badge-modsdcard">💾 MicroSD Boot (MODSDCARD)</span>` 
        : `<span class="badge" style="background: rgba(255,255,255,0.08); color: var(--text-secondary);">⚡ eMMC / Direct</span>`;

      return `
        <div class="firmware-row">
          <div class="fw-main-info">
            <div class="fw-header-line">
              <span class="fw-device-title">${escapeHtml(fw.deviceName)}</span>
              <span class="badge ${osClass}">${escapeHtml(fw.os)} ${escapeHtml(fw.osVersion || "")}</span>
              <span class="badge badge-kernel">🐧 ${escapeHtml(fw.kernel)} (${escapeHtml(fw.kernelFlavor)})</span>
              ${modBadge}
              ${wifiBadge}
              <span class="badge badge-tunnel">🚀 ${escapeHtml(fw.tunnelText)}</span>
            </div>

            <div class="fw-meta-line">
              <span class="fw-meta-item">📦 Ukuran: <strong>${escapeHtml(fw.formattedSize)}</strong></span>
              <span class="fw-meta-item">📁 Format: <strong>${escapeHtml(fw.rootfs)}</strong></span>
              <span class="fw-meta-item">📅 Rilis: <strong>${escapeHtml(fw.dateStr || "Terbaru")}</strong></span>
              <span class="fw-meta-item">⬇️ Diunduh: <strong>${escapeHtml(fw.downloadCount.toLocaleString("id-ID"))}x</strong></span>
            </div>

            <div>
              <span class="fw-filename">${escapeHtml(fw.rawFilename)}</span>
            </div>
          </div>

          <div class="fw-actions">
            <button class="btn-copy" onclick="copyToClipboard('${escapeAttr(fw.rawFilename)}', this)" title="Salin Nama File">
              📋 Salin Nama
            </button>
            <a href="${escapeAttr(fw.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="btn-download">
              ⬇️ Unduh Firmware
            </a>
          </div>
        </div>
      `;
    }).join("");

    firmwareListEl.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(str) {
    if (!str) return "";
    return String(str).replace(/"/g, "&quot;");
  }

  window.copyToClipboard = function(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      const origText = btnElement.innerHTML;
      btnElement.innerHTML = "✅ Tersalin!";
      btnElement.style.borderColor = "var(--accent-green)";
      btnElement.style.color = "var(--accent-green)";
      setTimeout(() => {
        btnElement.innerHTML = origText;
        btnElement.style.borderColor = "";
        btnElement.style.color = "";
      }, 1500);
    });
  };
});
