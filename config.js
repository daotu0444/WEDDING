(() => {
  "use strict";

  const THEME_PRESETS = [
    {
      key: "navy",
      label: "Lam Đậm (Navy)",
      theme: {
        primary: "#00224c",
        primaryDark: "#001531",
        primaryLight: "#073268",
        paperBg: "#f7f5ee",
        cardText: "#ece4d8",
        goldAccent: "#c9a24a",
      },
    },
    {
      key: "burgundy",
      label: "Đỏ Đô (Burgundy)",
      theme: {
        primary: "#5c1122",
        primaryDark: "#380712",
        primaryLight: "#7c1a30",
        paperBg: "#fbf7f4",
        cardText: "#f5eae2",
        goldAccent: "#d4af37",
      },
    },
    {
      key: "emerald",
      label: "Xanh Rêu Rừng",
      theme: {
        primary: "#1c3b2e",
        primaryDark: "#0f241b",
        primaryLight: "#285442",
        paperBg: "#f6f7f2",
        cardText: "#ecebe0",
        goldAccent: "#c8a951",
      },
    },
    {
      key: "plum",
      label: "Tím Than Cổ Điển",
      theme: {
        primary: "#362148",
        primaryDark: "#20112e",
        primaryLight: "#4c3064",
        paperBg: "#f9f6fb",
        cardText: "#efe8f4",
        goldAccent: "#cfa658",
      },
    },
    {
      key: "mocha",
      label: "Nâu Ấm Vintage",
      theme: {
        primary: "#4a3222",
        primaryDark: "#2c1c12",
        primaryLight: "#694933",
        paperBg: "#faf6ef",
        cardText: "#f3eadc",
        goldAccent: "#c69c53",
      },
    },
  ];

  const DEFAULT_TEMPLATE = {
    id: "minimalism-lam-dam",
    name: "Minimalism Lam Đậm",
    theme: {
      primary: "#00224c",
      primaryDark: "#001531",
      primaryLight: "#073268",
      paperBg: "#f7f5ee",
      cardText: "#ece4d8",
      goldAccent: "#c9a24a",
    },
    couple: {
      groomShort: "Tuấn Kiệt",
      brideShort: "Minh Anh",
      groomFull: "Trần Tuấn Kiệt",
      groomOrder: "Trưởng Nam",
      brideFull: "Lê Minh Anh",
      brideOrder: "Út Nữ",
      introDateText: "19 tháng 12, 2026",
      introGreeting: "Thân Mời",
      footerQuote: "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!",
      footerBrand: "♡ Tuấn Kiệt & Minh Anh",
    },
    parents: {
      groomTitle: "Ông Bà",
      groomFather: "Lý Văn Hoà",
      groomMother: "Trịnh Thị Bích Vân",
      groomAddress: "Phường Tân Định, Quận 1, TP. Hồ Chí Minh",
      brideTitle: "Ông Bà",
      brideFather: "Đinh Hữu Nam",
      brideMother: "Phan Thị Kim Yến",
      brideAddress: "Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
    },
    ceremony: {
      venueTitle: "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA",
      time: "09:00",
      dayOfWeek: "THỨ BẢY",
      day: "10",
      month: "THÁNG 10",
      year: "2026",
      lunar: "(Tức ngày 1 tháng 9 năm Bính Ngọ)",
    },
    reception: {
      time: "18:30",
      dayOfWeek: "THỨ BẢY",
      day: "19",
      month: "THÁNG 12",
      year: "2026",
      lunar: "(Tức ngày 11 tháng 11 năm Bính Ngọ)",
      welcomeTime: "17:30",
      partyStartTime: "18:30",
      countdownIso: "2026-12-19T18:30:00+07:00",
      calendarYear: 2026,
      calendarMonth: 12,
      calendarHighlightDay: 19,
    },
    venue: {
      name: "Nhà Hàng Tiệc Cưới Riverside Palace",
      address: "Nhà Hàng Tiệc Cưới Riverside Palace, 360D Bến Vân Đồn, Phường 1, Quận 4, TP. Hồ Chí Minh",
      mapLat: 10.7553,
      mapLng: 106.6904,
      mapEmbedUrl: "",
      useCoords: false,
    },
    dressCode: {
      subtitle: "Trang phục dự tiệc",
      colors: ["#787a6c", "#7869a0", "#c4b5dd"],
    },
    timeline: [
      { time: "17:30", label: "Đón khách", icon: "" },
      { time: "18:30", label: "Khai tiệc", icon: "church" },
      { time: "18:45", label: "Rót rượu, cắt bánh", icon: "cake" },
      { time: "19:00", label: "Phục vụ món chính", icon: "cook" },
      { time: "21:00", label: "Kết thúc tiệc", icon: "" },
    ],
    gift: {
      groom: {
        title: "Chú Rể - LY QUOC BAO",
        bank: "Vietcombank",
        account: "1017788990",
        holder: "LY QUOC BAO",
        qrSrc: "./assets/images/qr/qr-groom.png",
      },
      bride: {
        title: "Cô Dâu - DINH DIEU LINH",
        bank: "Techcombank",
        account: "1904455660",
        holder: "DINH DIEU LINH",
        qrSrc: "./assets/images/qr/qr-bride.png",
      },
    },
    photos: {
      hero1: "./assets/images/photos/hero-1.webp",
      hero2: "./assets/images/photos/hero-2.webp",
      album: [
        { src: "./assets/images/photos/album-1.webp", aspect: "0.66625 / 1" },
        { src: "./assets/images/photos/album-2.webp", aspect: "0.66625 / 1" },
        { src: "./assets/images/photos/album-3.webp", aspect: "0.66625 / 1" },
        { src: "./assets/images/photos/album-4.webp", aspect: "0.749086 / 1" },
        { src: "./assets/images/photos/album-5.webp", aspect: "1.2 / 1" },
        { src: "./assets/images/photos/album-6.webp", aspect: "0.747991 / 1" },
        { src: "./assets/images/photos/album-7.webp", aspect: "0.66625 / 1" },
        { src: "./assets/images/photos/album-8.webp", aspect: "0.66625 / 1" },
        { src: "./assets/images/photos/album-9.webp", aspect: "0.66625 / 1" },
      ],
    },
    music: {
      enabled: true,
      sourceType: "file",
      src: "./assets/audio/mot-doi.mp3",
      embedUrl: "",
      title: "Một Đời",
    },
    webhookUrl: "",
  };

  const DEFAULT_WEDDING_STORE = {
    activeTemplateId: "minimalism-lam-dam",
    templates: [DEFAULT_TEMPLATE],
  };

  function isPlainObject(val) {
    return val !== null && typeof val === "object" && !Array.isArray(val);
  }

  function deepMerge(base, override) {
    if (!isPlainObject(base)) return override !== undefined ? override : base;
    const result = { ...base };
    if (!isPlainObject(override)) return result;
    for (const key of Object.keys(override)) {
      if (Array.isArray(override[key])) {
        result[key] = override[key].map((item) => (isPlainObject(item) ? { ...item } : item));
      } else if (isPlainObject(override[key]) && isPlainObject(base[key])) {
        result[key] = deepMerge(base[key], override[key]);
      } else if (override[key] !== undefined) {
        result[key] = override[key];
      }
    }
    return result;
  }

  function cloneData(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getWeddingStore() {
    try {
      const raw = localStorage.getItem("wedding_store_v1");
      if (!raw) return cloneData(DEFAULT_WEDDING_STORE);
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.templates) || parsed.templates.length === 0) {
        return cloneData(DEFAULT_WEDDING_STORE);
      }
      return {
        activeTemplateId: parsed.activeTemplateId || parsed.templates[0].id,
        templates: parsed.templates.map((tpl) => deepMerge(DEFAULT_TEMPLATE, tpl)),
      };
    } catch (_) {
      return cloneData(DEFAULT_WEDDING_STORE);
    }
  }

  function saveWeddingStore(store) {
    localStorage.setItem("wedding_store_v1", JSON.stringify(store));
  }

  function getActiveWeddingTemplate(tplId) {
    const store = getWeddingStore();
    if (tplId) {
      const found = store.templates.find((t) => t.id === tplId);
      if (found) return found;
    }
    const active = store.templates.find((t) => t.id === store.activeTemplateId);
    return active || store.templates[0];
  }

  function extractMapEmbedUrl(rawInput) {
    let raw = String(rawInput || "").trim();
    if (!raw) return "";
    if (/<iframe\b/i.test(raw)) {
      const match = raw.match(/src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
      if (!match) return "";
      raw = (match[1] || match[2] || match[3] || "").trim().replace(/&amp;/gi, "&");
    }
    if (!/^https?:\/\//i.test(raw)) return "";
    if (!/\/maps\/embed/i.test(raw) && !/[?&]output=embed\b/i.test(raw)) {
      const coordsMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
      if (coordsMatch) {
        return `https://maps.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}&hl=vi&z=16&ie=UTF8&iwloc=&output=embed`;
      }
    }
    return raw;
  }

  function parseVenueMapState(venue) {
    const v = venue || {};
    const lat = Number(v.mapLat);
    const lng = Number(v.mapLng);
    const hasValidCoords =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      (lat !== 0 || lng !== 0);
    const addrQuery = String(v.address || v.name || "").trim();
    return { v, lat, lng, hasValidCoords, addrQuery };
  }

  function buildWeddingMapEmbedUrl(venue) {
    const { v, lat, lng, hasValidCoords, addrQuery } = parseVenueMapState(venue);
    const custom = extractMapEmbedUrl(v.mapEmbedUrl);
    if (custom) return custom;
    if ((v.useCoords || !addrQuery) && hasValidCoords) {
      return `https://maps.google.com/maps?q=${lat},${lng}&hl=vi&z=16&ie=UTF8&iwloc=&output=embed`;
    }
    if (addrQuery) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(addrQuery)}&hl=vi&z=16&ie=UTF8&iwloc=&output=embed`;
    }
    return "https://maps.google.com/maps?q=10.7553,106.6904&hl=vi&z=16&ie=UTF8&iwloc=&output=embed";
  }

  function buildWeddingDirectionsUrl(venue) {
    const { v, lat, lng, hasValidCoords, addrQuery } = parseVenueMapState(venue);
    if ((v.useCoords || !addrQuery) && hasValidCoords) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    if (addrQuery) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addrQuery)}`;
    }
    return "https://www.google.com/maps/dir/?api=1&destination=10.7553,106.6904";
  }

  function parseTimeParamSeconds(val) {
    if (!val) return 0;
    const str = String(val).trim();
    if (/^\d+$/.test(str)) return Number(str);
    const hms = str.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
    if (hms && (hms[1] || hms[2] || hms[3])) {
      return (Number(hms[1]) || 0) * 3600 + (Number(hms[2]) || 0) * 60 + (Number(hms[3]) || 0);
    }
    return 0;
  }

  function parseWeddingMusicEmbed(rawInput) {
    let raw = String(rawInput || "").trim();
    if (!raw) return null;

    const wasIframeTag = /<iframe\b/i.test(raw);
    if (wasIframeTag) {
      const match = raw.match(/src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
      if (!match) return null;
      raw = (match[1] || match[2] || match[3] || "").trim().replace(/&amp;/gi, "&");
    }

    if (raw.startsWith("//")) {
      raw = "https:" + raw;
    }
    if (!/^https?:\/\//i.test(raw)) return null;

    let urlObj;
    try {
      urlObj = new URL(raw);
    } catch (_) {
      return null;
    }

    const host = urlObj.hostname.replace(/^www\./i, "").toLowerCase();

    if (/\.(mp3|m4a|aac|ogg|wav|flac)$/i.test(urlObj.pathname)) {
      return {
        provider: "audio",
        label: "Link file âm thanh",
        audioSrc: raw,
        embedUrl: raw,
        previewUrl: raw,
        interactiveWidget: false,
      };
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"
    ) {
      let videoId = "";
      if (host === "youtu.be") {
        videoId = urlObj.pathname.split("/").filter(Boolean)[0] || "";
      } else if (urlObj.pathname.startsWith("/watch")) {
        videoId = urlObj.searchParams.get("v") || "";
      } else {
        const pathMatch = urlObj.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
        if (pathMatch) videoId = pathMatch[1];
      }
      if (/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        const startSeconds =
          parseTimeParamSeconds(urlObj.searchParams.get("start")) ||
          parseTimeParamSeconds(urlObj.searchParams.get("t"));
        const startParam = startSeconds > 0 ? `&start=${startSeconds}` : "";
        return {
          provider: "youtube",
          label: `YouTube (${videoId}${startSeconds > 0 ? `, từ ${startSeconds}s` : ""})`,
          videoId,
          startSeconds,
          embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0&loop=1&playlist=${videoId}${startParam}`,
          previewUrl: `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0${startParam}`,
          interactiveWidget: false,
        };
      }
    }

    if (
      host === "soundcloud.com" ||
      host === "m.soundcloud.com" ||
      host === "on.soundcloud.com" ||
      host === "w.soundcloud.com"
    ) {
      let previewUrl = raw;
      if (host === "w.soundcloud.com" && urlObj.pathname.startsWith("/player")) {
        urlObj.searchParams.set("auto_play", "false");
        previewUrl = urlObj.toString();
      } else {
        previewUrl =
          `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}` +
          `&color=%2300224c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
      }
      return {
        provider: "soundcloud",
        label: "SoundCloud",
        embedUrl: previewUrl,
        previewUrl,
        interactiveWidget: false,
      };
    }

    if (host === "open.spotify.com") {
      const spMatch = urlObj.pathname.match(
        /^(?:\/intl-[a-z-]+)?(?:\/embed)?\/(track|playlist|album|episode)\/([A-Za-z0-9]+)/i
      );
      if (spMatch) {
        const kind = spMatch[1].toLowerCase();
        const itemId = spMatch[2];
        const spEmbed = `https://open.spotify.com/embed/${kind}/${itemId}?utm_source=generator`;
        return {
          provider: "spotify",
          label: `Spotify (${kind})`,
          embedUrl: spEmbed,
          previewUrl: spEmbed,
          interactiveWidget: true,
        };
      }
    }

    if (host === "zingmp3.vn") {
      const zingSong = urlObj.pathname.match(/^\/bai-hat\/[^/]+\/([A-Za-z0-9]+)\.html$/i);
      if (zingSong) {
        const zEmbed = `https://zingmp3.vn/embed/song/${zingSong[1]}?start=false`;
        return {
          provider: "zingmp3",
          label: `Zing MP3 (${zingSong[1]})`,
          embedUrl: zEmbed,
          previewUrl: zEmbed,
          interactiveWidget: true,
        };
      }
    }

    if (wasIframeTag || /\/embed\b|player|zingmp3\.vn|nhaccuatui\.com/i.test(raw)) {
      return {
        provider: "iframe",
        label: `Mã nhúng (${host})`,
        embedUrl: raw,
        previewUrl: raw,
        interactiveWidget: true,
      };
    }

    return null;
  }

  function resolveWeddingMusic(musicCfg) {
    const cfg = musicCfg || {};
    const enabled = cfg.enabled !== false;
    const title = String(cfg.title || "Nhạc nền").trim();
    const rawEmbed = String(cfg.embedUrl || "").trim();
    const rawSrc = String(cfg.src || "./assets/audio/mot-doi.mp3").trim();
    const preferEmbed = cfg.sourceType === "embed" || (cfg.sourceType !== "file" && Boolean(rawEmbed));

    if (!enabled) {
      return { enabled: false, mode: "none", title };
    }

    if (preferEmbed && rawEmbed) {
      const parsed = parseWeddingMusicEmbed(rawEmbed);
      if (parsed && parsed.provider === "audio") {
        return { enabled: true, mode: "audio", src: parsed.audioSrc, title };
      }
      if (parsed) {
        return { enabled: true, mode: "embed", embed: parsed, title };
      }
    }

    const parsedFromSrc = parseWeddingMusicEmbed(rawSrc);
    if (parsedFromSrc && parsedFromSrc.provider !== "audio") {
      return { enabled: true, mode: "embed", embed: parsedFromSrc, title };
    }

    if (rawSrc) {
      return { enabled: true, mode: "audio", src: rawSrc, title };
    }

    return { enabled: false, mode: "none", title };
  }

  window.THEME_PRESETS = THEME_PRESETS;
  window.DEFAULT_TEMPLATE = DEFAULT_TEMPLATE;
  window.DEFAULT_WEDDING_STORE = DEFAULT_WEDDING_STORE;
  window.getWeddingStore = getWeddingStore;
  window.saveWeddingStore = saveWeddingStore;
  window.getActiveWeddingTemplate = getActiveWeddingTemplate;
  window.deepMergeTemplate = (tpl) => deepMerge(DEFAULT_TEMPLATE, tpl);
  window.extractMapEmbedUrl = extractMapEmbedUrl;
  window.buildWeddingMapEmbedUrl = buildWeddingMapEmbedUrl;
  window.buildWeddingDirectionsUrl = buildWeddingDirectionsUrl;
  window.parseWeddingMusicEmbed = parseWeddingMusicEmbed;
  window.resolveWeddingMusic = resolveWeddingMusic;
})();
