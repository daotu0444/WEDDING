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
      mapLat: 10.7614,
      mapLng: 106.7010,
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

  window.THEME_PRESETS = THEME_PRESETS;
  window.DEFAULT_TEMPLATE = DEFAULT_TEMPLATE;
  window.DEFAULT_WEDDING_STORE = DEFAULT_WEDDING_STORE;
  window.getWeddingStore = getWeddingStore;
  window.saveWeddingStore = saveWeddingStore;
  window.getActiveWeddingTemplate = getActiveWeddingTemplate;
  window.deepMergeTemplate = (tpl) => deepMerge(DEFAULT_TEMPLATE, tpl);
})();
