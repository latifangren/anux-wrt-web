/**
 * ANUx-WRT Releases Data Provider
 * Fetches assets from GitHub Releases API with LocalStorage caching & fallback dataset.
 */

const ReleasesProvider = (() => {
  const REPO_OWNER = "latifangren";
  const REPO_NAME = "ANUx-WRT";
  const CACHE_KEY = "anuxwrt_releases_cache";
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  // Offline fallback dataset for local preview & offline demo
  const FALLBACK_RELEASES = [
    {
      name: "ANUx-OpenWrt-24.10.8-b860h-k6.12.11-flipy-openclash-nikki-03092026-MODSDCARD.img.gz",
      size: 310378496,
      download_count: 142,
      updated_at: "2026-09-03T14:32:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-b860h-k6.1.66-ophub-openclash-nikki-03092026-WIFIOFF.img.gz",
      size: 298844160,
      download_count: 88,
      updated_at: "2026-09-03T14:30:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-ImmortalWrt-23.05.7-OrangePi_3B-k5.10.160-rk35v-dbai-openclash-clashoo-03092026.img.gz",
      size: 338760000,
      download_count: 67,
      updated_at: "2026-09-03T15:10:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-25.12.5-x86_64-k6.12.11-openclash-passwall-03092026.img.gz",
      size: 126248960,
      download_count: 319,
      updated_at: "2026-09-03T16:00:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-x86_64-k6.6.6-no-tunnel-03092026.img.gz",
      size: 91226112,
      download_count: 154,
      updated_at: "2026-09-03T16:15:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-hg680p-k6.12.11-flipy-openclash-nikki-03092026-MODSDCARD.img.gz",
      size: 308281344,
      download_count: 110,
      updated_at: "2026-09-03T14:45:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-hg680p-k6.6.6-ophub-openclash-clashoo-03092026-WIFION.img.gz",
      size: 322961408,
      download_count: 94,
      updated_at: "2026-09-03T14:40:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-25.12.5-rpi-4b-k6.12.11-openclash-nikki-03092026.img.gz",
      size: 90112000,
      download_count: 205,
      updated_at: "2026-09-03T17:00:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-25.12.5-rpi-5-k6.12.11-openclash-passwall-03092026.img.gz",
      size: 94371840,
      download_count: 182,
      updated_at: "2026-09-03T17:10:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-ImmortalWrt-24.10.8-nanopi-r5s-k6.6.6-openclash-nikki-03092026.img.gz",
      size: 136314880,
      download_count: 122,
      updated_at: "2026-09-03T17:25:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-nanopi-r2s-k6.6.6-no-tunnel-03092026.img.gz",
      size: 89128960,
      download_count: 76,
      updated_at: "2026-09-03T17:20:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-s905x3-k6.12.11-flipy-openclash-nikki-03092026-MODSDCARD.img.gz",
      size: 326107136,
      download_count: 148,
      updated_at: "2026-09-03T15:30:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-ImmortalWrt-24.10.8-orangepi-zero3-k6.6.6-openclash-clashoo-03092026.img.gz",
      size: 115343360,
      download_count: 83,
      updated_at: "2026-09-03T18:00:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    },
    {
      name: "ANUx-OpenWrt-24.10.8-mangopi-m28k-k6.6.6-no-tunnel-03092026.img.gz",
      size: 88080384,
      download_count: 45,
      updated_at: "2026-09-03T18:20:00Z",
      browser_download_url: "https://github.com/latifangren/ANUx-WRT/releases"
    }
  ];

  async function fetchReleases() {
    // 1. Check LocalStorage Cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          return parsed.data;
        }
      }
    } catch (e) {
      // LocalStorage access might fail in private browsing
    }

    // 2. Fetch live data from GitHub Releases API
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`);
      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const releases = await response.json();
      const assets = [];

      for (const rel of releases) {
        if (rel.assets && Array.isArray(rel.assets)) {
          for (const a of rel.assets) {
            if (a.name.endsWith(".img.gz") || a.name.endsWith(".img.xz") || a.name.endsWith(".tar.gz")) {
              assets.push({
                name: a.name,
                size: a.size,
                download_count: a.download_count || 0,
                updated_at: a.updated_at || rel.published_at,
                browser_download_url: a.browser_download_url
              });
            }
          }
        }
      }

      if (assets.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: assets
          }));
        } catch (e) {}
        return assets;
      }
    } catch (err) {
      console.warn("Failed to fetch live releases from GitHub, falling back to local dataset:", err);
    }

    // 3. Fallback to offline dataset
    return FALLBACK_RELEASES;
  }

  return {
    fetchReleases
  };
})();
