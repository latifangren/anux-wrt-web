/**
 * ANUx-WRT Smart Filename Parser
 * Extracts structured metadata from firmware asset filenames.
 */

const FirmwareParser = (() => {
  // Device mapping dictionary
  const DEVICE_RULES = [
    { pattern: /b860hv5|b860h[-_]v5/i, name: "ZTE B860H v5", category: "amlogic" },
    { pattern: /b860h/i, name: "ZTE B860H (v1/v2)", category: "amlogic" },
    { pattern: /hg680[-_]?fj/i, name: "Fiberhome HG680-FJ", category: "amlogic" },
    { pattern: /hg680p|hg680[-_]?p/i, name: "Fiberhome HG680P", category: "amlogic" },
    { pattern: /s905x4/i, name: "Amlogic S905X4 Generic", category: "amlogic" },
    { pattern: /s905x3/i, name: "Amlogic S905X3 Generic", category: "amlogic" },
    { pattern: /s905x2/i, name: "Amlogic S905X2 Generic", category: "amlogic" },
    { pattern: /s905x/i, name: "Amlogic S905X Generic", category: "amlogic" },
    { pattern: /s905w/i, name: "Amlogic S905W (TX3/X96 Mini)", category: "amlogic" },
    { pattern: /s905/i, name: "Amlogic S905 Generic", category: "amlogic" },
    { pattern: /s912/i, name: "Amlogic S912", category: "amlogic" },
    { pattern: /s922x/i, name: "Amlogic S922X (GT-King)", category: "amlogic" },
    { pattern: /x96max/i, name: "X96 Max Plus", category: "amlogic" },
    { pattern: /tx3[-_]?mini/i, name: "Tanix TX3 Mini", category: "amlogic" },
    { pattern: /tx6/i, name: "Tanix TX6 (Allwinner H6)", category: "allwinner" },

    { pattern: /orangepi[-_]?3b/i, name: "Orange Pi 3B (RK3566)", category: "orangepi" },
    { pattern: /orangepi[-_]?3[-_]?lts/i, name: "Orange Pi 3 LTS (H6)", category: "orangepi" },
    { pattern: /orangepi[-_]?3/i, name: "Orange Pi 3 (H6)", category: "orangepi" },
    { pattern: /orangepi[-_]?zero3/i, name: "Orange Pi Zero 3 (H618)", category: "orangepi" },
    { pattern: /orangepi[-_]?zero2/i, name: "Orange Pi Zero 2 (H616)", category: "orangepi" },
    { pattern: /orangepi[-_]?zero[-_]?plus/i, name: "Orange Pi Zero Plus (H5)", category: "orangepi" },
    { pattern: /orangepi[-_]?pc[-_]?2/i, name: "Orange Pi PC 2", category: "orangepi" },
    { pattern: /orangepi[-_]?r1[-_]?plus[-_]?lts/i, name: "Orange Pi R1 Plus LTS", category: "orangepi" },
    { pattern: /orangepi[-_]?r1[-_]?plus/i, name: "Orange Pi R1 Plus", category: "orangepi" },
    { pattern: /orangepi[-_]?5[-_]?plus/i, name: "Orange Pi 5 Plus (RK3588)", category: "rockchip" },
    { pattern: /orangepi[-_]?5b/i, name: "Orange Pi 5B (RK3588s)", category: "rockchip" },
    { pattern: /orangepi[-_]?5/i, name: "Orange Pi 5 (RK3588s)", category: "rockchip" },

    { pattern: /nanopi[-_]?r5s/i, name: "NanoPi R5S (RK3568)", category: "nanopi" },
    { pattern: /nanopi[-_]?r4s/i, name: "NanoPi R4S (RK3399)", category: "nanopi" },
    { pattern: /nanopi[-_]?r3s/i, name: "NanoPi R3S", category: "nanopi" },
    { pattern: /nanopi[-_]?r2s/i, name: "NanoPi R2S (RK3328)", category: "nanopi" },
    { pattern: /nanopi[-_]?r2c[-_]?plus/i, name: "NanoPi R2C Plus", category: "nanopi" },
    { pattern: /nanopi[-_]?r2c/i, name: "NanoPi R2C", category: "nanopi" },
    { pattern: /nanopi[-_]?m5/i, name: "NanoPi M5 (Amlogic S905D3)", category: "nanopi" },

    { pattern: /rpi[-_]?5|raspberry[-_]?pi[-_]?5/i, name: "Raspberry Pi 5 (BCM2712)", category: "rpi" },
    { pattern: /rpi[-_]?4b|rpi[-_]?4|raspberry[-_]?pi[-_]?4/i, name: "Raspberry Pi 4B (BCM2711)", category: "rpi" },
    { pattern: /rpi[-_]?3b|rpi[-_]?3|raspberry[-_]?pi[-_]?3/i, name: "Raspberry Pi 3B/3B+ (BCM2837)", category: "rpi" },
    { pattern: /rpi[-_]?2b|rpi[-_]?2|raspberry[-_]?pi[-_]?2/i, name: "Raspberry Pi 2B", category: "rpi" },
    { pattern: /rpi[-_]?b|raspberry[-_]?pi[-_]?b/i, name: "Raspberry Pi 1 / B / Zero", category: "rpi" },

    { pattern: /mangopi[-_]?m28c|m28c/i, name: "MangoPi M28C", category: "mangopi" },
    { pattern: /mangopi[-_]?m28k|m28k/i, name: "MangoPi M28K", category: "mangopi" },

    { pattern: /x86[-_]64|x86_64|amd64/i, name: "x86_64 (PC / Mini-PC)", category: "x86" },
    { pattern: /x86[-_]generic|i386/i, name: "x86 Generic (32-bit)", category: "x86" }
  ];

  function parseFilename(filename) {
    if (!filename) return null;

    const lower = filename.toLowerCase();

    // 1. Detect OS
    let os = "OpenWrt";
    let osVersion = "";
    if (lower.includes("immortalwrt")) {
      os = "ImmortalWrt";
    }
    const osVerMatch = filename.match(/(?:OpenWrt|ImmortalWrt|xidzs|anux)[-_]([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
    if (osVerMatch) {
      osVersion = osVerMatch[1];
    }

    // 2. Detect Device & Category
    let deviceName = "Generic Device";
    let category = "other";
    for (const rule of DEVICE_RULES) {
      if (rule.pattern.test(filename)) {
        deviceName = rule.name;
        category = rule.category;
        break;
      }
    }

    // 3. Detect Kernel version & flavor
    let kernel = "";
    let kernelFlavor = "Mainline";
    const kMatch = filename.match(/k([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
    if (kMatch) {
      kernel = `k${kMatch[1]}`;
    }

    if (/flipy/i.test(filename)) {
      kernelFlavor = "Flipy";
    } else if (/ophub/i.test(filename)) {
      kernelFlavor = "Ophub";
    } else if (/rk35v|dbai|ulo/i.test(filename)) {
      kernelFlavor = "Vendor (ULO)";
    } else if (kernel.startsWith("k5.4") || kernel.startsWith("k5.10") || kernel.startsWith("k5.15")) {
      kernelFlavor = "LTS Stable";
    } else if (kernel.startsWith("k6.")) {
      kernelFlavor = "Modern Kernel";
    }

    // 4. Detect Boot Mode
    let bootMode = "eMMC / Standard";
    if (/modsdcard/i.test(filename)) {
      bootMode = "MODSDCARD (MicroSD Boot)";
    }

    // 5. Detect Wi-Fi variant
    let wifi = null;
    if (/wifioff/i.test(filename)) {
      wifi = "WIFI OFF";
    } else if (/wifion/i.test(filename)) {
      wifi = "WIFI ON";
    }

    // 6. Detect Rootfs & Partition Type
    let rootfs = "Ext4";
    if (/squashfs/i.test(filename)) {
      rootfs = "Squashfs";
    }

    // 7. Detect Tunnel
    const tunnels = [];
    if (/openclash/i.test(filename)) tunnels.push("OpenClash");
    if (/nikki/i.test(filename)) tunnels.push("Nikki");
    if (/passwall/i.test(filename)) tunnels.push("PassWall");
    if (/fusiontunx/i.test(filename)) tunnels.push("FusionTunX");
    if (/clashoo/i.test(filename)) tunnels.push("Clashoo");
    if (/qtun/i.test(filename)) tunnels.push("Qtun");
    if (/no[-_]tunnel/i.test(filename)) tunnels.push("No Tunnel");

    const tunnelText = tunnels.length > 0 ? tunnels.join(" + ") : "Standard";

    // 8. Extract Date
    let dateStr = "";
    const dateMatch = filename.match(/([0-3][0-9][0-1][0-9]202[0-9])/);
    if (dateMatch) {
      const raw = dateMatch[1];
      dateStr = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    }

    return {
      rawFilename: filename,
      deviceName,
      category,
      os,
      osVersion,
      kernel: kernel || "Default Kernel",
      kernelFlavor,
      bootMode,
      wifi,
      rootfs,
      tunnelText,
      dateStr
    };
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return (mb / 1024).toFixed(2) + " GB";
    }
    return mb.toFixed(1) + " MB";
  }

  return {
    parseFilename,
    formatBytes
  };
})();
