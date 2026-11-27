(() => {
  "use strict";

  /* ========================================================================
     1. Toast Helper
     ======================================================================== */
  const toastContainer = document.getElementById("admin-toast-container");

  function showToast(message, type = "success") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className =
      "toast-item pointer-events-auto flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg border border-gray-200";
    const dotColor = type === "error" ? "bg-rose-500" : "bg-emerald-500";
    toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${dotColor} shrink-0"></span><span></span>`;
    toast.querySelector("span:last-child").textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  /* ========================================================================
     1b. Cloud Auth & Direct Save (Vercel API + Blob)
     ======================================================================== */
  const ADMIN_PASS_KEY = "wedding_admin_pass";
  let adminPassword = sessionStorage.getItem(ADMIN_PASS_KEY) || "";
  let cloudConnected = false;
  let suppressAutoCloudPush = false;

  const loginOverlay = document.getElementById("admin-login-overlay");
  const loginForm = document.getElementById("admin-login-form");
  const loginPassInput = document.getElementById("admin-login-password");
  const loginErrorEl = document.getElementById("admin-login-error");
  const loginBtn = document.getElementById("admin-login-btn");
  const cloudSyncBadge = document.getElementById("cloud-sync-badge");
  const logoutBtn = document.getElementById("btn-admin-logout");

  function setCloudBadge(text, ok) {
    if (!cloudSyncBadge) return;
    cloudSyncBadge.textContent = text;
    cloudSyncBadge.className = ok
      ? "hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/30 px-2.5 py-1 text-[11px] font-medium text-emerald-100"
      : "hidden sm:inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[#ece4d8]/80";
  }

  async function pushStoreToCloud(storeObj, silent = false) {
    if (!cloudConnected || !adminPassword) return { ok: false, offline: true };
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ store: storeObj }),
      });
      if (res.status === 401) {
        if (!silent) showToast("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.", "error");
        return { ok: false, unauthorized: true };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (!silent) showToast(data.error || "Lưu lên đám mây thất bại.", "error");
        return { ok: false };
      }
      setCloudBadge("☁️ Đã lưu đám mây", true);
      return { ok: true };
    } catch (_) {
      if (!silent) showToast("Không kết nối được máy chủ đám mây.", "error");
      return { ok: false };
    }
  }

  async function deleteCloudGuest(type, id) {
    if (!cloudConnected || !adminPassword || !id) return;
    try {
      await fetch("/api/guests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ type, id }),
      });
    } catch (_) {}
  }

  async function loadAllFromCloud() {
    try {
      const [cfgRes, guestRes] = await Promise.all([
        fetch("/api/config", { cache: "no-store" }),
        fetch("/api/guests", {
          cache: "no-store",
          headers: { "x-admin-password": adminPassword },
        }),
      ]);

      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (
          cfgData &&
          cfgData.ok &&
          cfgData.store &&
          Array.isArray(cfgData.store.templates) &&
          cfgData.store.templates.length > 0
        ) {
          suppressAutoCloudPush = true;
          originalSaveWeddingStore(cfgData.store);
          suppressAutoCloudPush = false;
          store = window.getWeddingStore();
          if (!store.templates.some((t) => t.id === editingTplId)) {
            editingTplId = store.activeTemplateId || store.templates[0].id;
          }
          renderTemplatesGrid();
          populateEditorFields();
        }
      }

      if (guestRes.ok) {
        const guestData = await guestRes.json();
        if (guestData && guestData.ok) {
          if (Array.isArray(guestData.rsvps)) saveStoredRsvps(guestData.rsvps);
          if (Array.isArray(guestData.wishes)) saveStoredWishes(guestData.wishes);
          renderGuestDashboard();
        }
      }
    } catch (_) {}
  }

  async function verifyAdminPassword(password) {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 404) {
        return { ok: true, localOnly: true };
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        return { ok: true, localOnly: false };
      }
      return { ok: false, error: data.error || "Mật khẩu quản trị không đúng." };
    } catch (_) {
      return { ok: true, localOnly: true };
    }
  }

  async function unlockAdminWithPassword(password, silent = false) {
    const result = await verifyAdminPassword(password);
    if (!result.ok) {
      if (!silent && loginErrorEl) {
        loginErrorEl.textContent = result.error;
        loginErrorEl.classList.remove("hidden");
      }
      return false;
    }

    adminPassword = password;
    sessionStorage.setItem(ADMIN_PASS_KEY, password);
    cloudConnected = !result.localOnly;
    if (loginOverlay) loginOverlay.classList.add("hidden");
    if (loginErrorEl) loginErrorEl.classList.add("hidden");

    if (cloudConnected) {
      setCloudBadge("☁️ Đã kết nối đám mây", true);
      await loadAllFromCloud();
    } else {
      setCloudBadge("💻 Chế độ cục bộ", false);
    }
    return true;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pass = loginPassInput ? loginPassInput.value : "";
      if (loginErrorEl) loginErrorEl.classList.add("hidden");
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = "Đang kiểm tra...";
      }
      await unlockAdminWithPassword(pass, false);
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Đăng nhập";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(ADMIN_PASS_KEY);
      adminPassword = "";
      cloudConnected = false;
      if (loginPassInput) loginPassInput.value = "";
      if (loginOverlay) loginOverlay.classList.remove("hidden");
      setCloudBadge("🔒 Đã đăng xuất", false);
    });
  }

  const originalSaveWeddingStore = window.saveWeddingStore;
  window.saveWeddingStore = (storeObj) => {
    originalSaveWeddingStore(storeObj);
    if (cloudConnected && adminPassword && !suppressAutoCloudPush) {
      pushStoreToCloud(storeObj, true);
    }
  };

  /* ========================================================================
     2. Multi-Template Store State & Tabs
     ======================================================================== */
  let store = window.getWeddingStore();
  let editingTplId = store.activeTemplateId || store.templates[0].id;

  function getEditingTemplate() {
    return store.templates.find((t) => t.id === editingTplId) || store.templates[0];
  }

  const tabBtnTemplates = document.getElementById("tab-btn-templates");
  const tabBtnEditor = document.getElementById("tab-btn-editor");
  const tabBtnGuests = document.getElementById("tab-btn-guests");

  const panelTemplates = document.getElementById("panel-templates");
  const panelEditor = document.getElementById("panel-editor");
  const panelGuests = document.getElementById("panel-guests");

  function setActiveTab(tab) {
    const map = {
      templates: { btn: tabBtnTemplates, panel: panelTemplates },
      editor: { btn: tabBtnEditor, panel: panelEditor },
      guests: { btn: tabBtnGuests, panel: panelGuests },
    };
    Object.keys(map).forEach((key) => {
      const active = key === tab;
      map[key].panel.classList.toggle("hidden", !active);
      map[key].btn.className = active
        ? "rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer bg-[#ece4d8] text-[#00224c]"
        : "rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-[#ece4d8]/80 hover:bg-white/10";
    });
  }

  tabBtnTemplates.addEventListener("click", () => setActiveTab("templates"));
  tabBtnEditor.addEventListener("click", () => setActiveTab("editor"));
  tabBtnGuests.addEventListener("click", () => setActiveTab("guests"));

  /* ========================================================================
     3. Slug & Unique ID Helpers
     ======================================================================== */
  function slugify(str) {
    const noTone = String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return noTone || "mau-thiep";
  }

  function createUniqueId(name) {
    const base = slugify(name);
    let candidate = base;
    let i = 2;
    while (store.templates.some((t) => t.id === candidate)) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  /* ========================================================================
     4. Tab 1: Templates Manager & New Template Creator
     ======================================================================== */
  const templatesGrid = document.getElementById("templates-grid");
  const newTplPanel = document.getElementById("new-tpl-panel");
  const btnOpenNewTpl = document.getElementById("btn-open-new-tpl");
  const btnCancelNewTpl = document.getElementById("btn-cancel-new-tpl");
  const newTplNameInput = document.getElementById("new-tpl-name");
  const newTplSourceSelect = document.getElementById("new-tpl-source");
  const newTplPresetsWrap = document.getElementById("new-tpl-presets");
  const btnConfirmNewTpl = document.getElementById("btn-confirm-new-tpl");
  const editorTplSelect = document.getElementById("editor-tpl-select");
  const btnViewInvite = document.getElementById("btn-view-invite");
  const adminSubtitle = document.getElementById("admin-couple-subtitle");

  let selectedPresetKey = window.THEME_PRESETS[0].key;

  function renderNewTplPresets() {
    newTplPresetsWrap.innerHTML = "";
    window.THEME_PRESETS.forEach((preset) => {
      const selected = preset.key === selectedPresetKey;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = selected
        ? "flex flex-col gap-1.5 rounded-lg border-2 border-[#00224c] bg-[#f7f5ee] p-2.5 text-left shadow-sm cursor-pointer"
        : "flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-2.5 text-left hover:border-gray-300 cursor-pointer";

      const swatches = document.createElement("div");
      swatches.className = "flex items-center gap-1";
      [preset.theme.primary, preset.theme.paperBg, preset.theme.goldAccent].forEach((c) => {
        const dot = document.createElement("span");
        dot.className = "h-4 w-4 rounded-full border border-black/10";
        dot.style.backgroundColor = c;
        swatches.appendChild(dot);
      });

      const label = document.createElement("span");
      label.className = "text-xs font-semibold text-[#00224c]";
      label.textContent = preset.label;

      btn.append(swatches, label);
      btn.addEventListener("click", () => {
        selectedPresetKey = preset.key;
        renderNewTplPresets();
      });
      newTplPresetsWrap.appendChild(btn);
    });
  }

  function renderTemplateSelectors() {
    // Populate New Template source select & Editor switcher select
    newTplSourceSelect.innerHTML = "";
    editorTplSelect.innerHTML = "";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "__default__";
    defaultOpt.textContent = "Mẫu chuẩn mặc định (Minimalism Lam Đậm)";
    newTplSourceSelect.appendChild(defaultOpt);

    store.templates.forEach((tpl) => {
      const o1 = document.createElement("option");
      o1.value = tpl.id;
      o1.textContent = `Nhân bản: ${tpl.name} (${tpl.couple.groomShort} & ${tpl.couple.brideShort})`;
      newTplSourceSelect.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = tpl.id;
      o2.textContent = `${tpl.name}${tpl.id === store.activeTemplateId ? " (Mặc định)" : ""}`;
      if (tpl.id === editingTplId) o2.selected = true;
      editorTplSelect.appendChild(o2);
    });
  }

  function renderTemplatesGrid() {
    renderTemplateSelectors();
    templatesGrid.innerHTML = "";

    const cur = getEditingTemplate();
    adminSubtitle.textContent = `${cur.name} • ${cur.couple.groomShort} & ${cur.couple.brideShort}`;
    if (btnViewInvite) {
      btnViewInvite.href = `./index.html?tpl=${encodeURIComponent(cur.id)}&open=1`;
    }

    store.templates.forEach((tpl) => {
      const isActive = tpl.id === store.activeTemplateId;
      const isEditing = tpl.id === editingTplId;

      const card = document.createElement("div");
      card.className = isActive
        ? "flex flex-col justify-between rounded-xl border-2 border-[#00224c] bg-white p-4 shadow-md"
        : "flex flex-col justify-between rounded-xl border border-[#00224c1f] bg-white p-4 shadow-sm";

      // Top color banner preview
      const banner = document.createElement("div");
      banner.className = "mb-3 flex h-12 items-center justify-between rounded-lg px-3.5";
      banner.style.background = `linear-gradient(135deg, ${tpl.theme.primaryLight}, ${tpl.theme.primary}, ${tpl.theme.primaryDark})`;
      banner.style.color = tpl.theme.cardText;

      const bannerNames = document.createElement("span");
      bannerNames.className = "text-sm font-semibold truncate";
      bannerNames.style.fontFamily = "'Viaoda Libre', serif";
      bannerNames.textContent = `${tpl.couple.groomShort} & ${tpl.couple.brideShort}`;

      const paletteDots = document.createElement("div");
      paletteDots.className = "flex items-center gap-1 shrink-0";
      [tpl.theme.paperBg, tpl.theme.goldAccent].forEach((c) => {
        const d = document.createElement("span");
        d.className = "h-3.5 w-3.5 rounded-full border border-white/40";
        d.style.backgroundColor = c;
        paletteDots.appendChild(d);
      });
      banner.append(bannerNames, paletteDots);

      // Metadata
      const meta = document.createElement("div");
      meta.className = "space-y-1";

      const titleRow = document.createElement("div");
      titleRow.className = "flex flex-wrap items-center gap-1.5";
      const titleEl = document.createElement("h3");
      titleEl.className = "text-sm font-bold text-[#00224c]";
      titleEl.textContent = tpl.name;
      titleRow.appendChild(titleEl);

      if (isActive) {
        const badge = document.createElement("span");
        badge.className = "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700";
        badge.textContent = "Đang dùng mặc định";
        titleRow.appendChild(badge);
      } else if (isEditing) {
        const badge = document.createElement("span");
        badge.className = "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800";
        badge.textContent = "Đang mở sửa";
        titleRow.appendChild(badge);
      }

      const subEl = document.createElement("p");
      subEl.className = "text-xs text-gray-500";
      subEl.textContent = `${tpl.reception.day} ${tpl.reception.month}/${tpl.reception.year} • ${tpl.venue.name}`;

      const slugEl = document.createElement("p");
      slugEl.className = "text-[11px] font-mono text-gray-400 truncate";
      slugEl.textContent = `?tpl=${tpl.id}`;

      meta.append(titleRow, subEl, slugEl);

      // Action buttons
      const actions = document.createElement("div");
      actions.className = "mt-4 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3";

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.className = "rounded-lg bg-[#00224c] px-2.5 py-1.5 text-xs font-semibold text-[#ece4d8] hover:opacity-90 cursor-pointer";
      btnEdit.textContent = "✏️ Sửa";
      btnEdit.addEventListener("click", () => {
        editingTplId = tpl.id;
        populateEditorFields();
        renderTemplatesGrid();
        setActiveTab("editor");
      });

      const btnPreview = document.createElement("a");
      btnPreview.href = `./index.html?tpl=${encodeURIComponent(tpl.id)}&open=1`;
      btnPreview.target = "_blank";
      btnPreview.rel = "noopener noreferrer";
      btnPreview.className = "rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-[#00224c] hover:bg-gray-50";
      btnPreview.textContent = "👁️ Xem";

      const btnCopyLink = document.createElement("button");
      btnCopyLink.type = "button";
      btnCopyLink.className = "rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer";
      btnCopyLink.textContent = "🔗 Copy link";
      btnCopyLink.addEventListener("click", async () => {
        const link = `${window.location.origin}${window.location.pathname.replace(/admin\.html$/, "")}index.html?tpl=${encodeURIComponent(tpl.id)}`;
        try {
          await navigator.clipboard.writeText(link);
          showToast("Đã copy đường dẫn của mẫu thiệp!");
        } catch (_) {
          showToast(`Link: ?tpl=${tpl.id}`);
        }
      });

      const btnDup = document.createElement("button");
      btnDup.type = "button";
      btnDup.className = "rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer";
      btnDup.textContent = "📄 Nhân bản";
      btnDup.addEventListener("click", () => {
        const copy = JSON.parse(JSON.stringify(tpl));
        copy.name = `${tpl.name} (Bản sao)`;
        copy.id = createUniqueId(copy.name);
        store.templates.push(copy);
        editingTplId = copy.id;
        window.saveWeddingStore(store);
        renderTemplatesGrid();
        populateEditorFields();
        showToast(`Đã nhân bản thành "${copy.name}"!`);
      });

      actions.append(btnEdit, btnPreview, btnCopyLink, btnDup);

      if (!isActive) {
        const btnDefault = document.createElement("button");
        btnDefault.type = "button";
        btnDefault.className = "rounded-lg border border-emerald-500/40 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer";
        btnDefault.textContent = "★ Đặt mặc định";
        btnDefault.addEventListener("click", () => {
          store.activeTemplateId = tpl.id;
          window.saveWeddingStore(store);
          renderTemplatesGrid();
          showToast(`Đã đặt "${tpl.name}" làm mẫu mặc định!`);
        });
        actions.appendChild(btnDefault);
      }

      if (store.templates.length > 1) {
        const btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.className = "ml-auto rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer";
        btnDel.textContent = "Xóa";
        btnDel.addEventListener("click", () => {
          store.templates = store.templates.filter((t) => t.id !== tpl.id);
          if (store.activeTemplateId === tpl.id) {
            store.activeTemplateId = store.templates[0].id;
          }
          if (editingTplId === tpl.id) {
            editingTplId = store.templates[0].id;
          }
          window.saveWeddingStore(store);
          renderTemplatesGrid();
          populateEditorFields();
          showToast(`Đã xóa mẫu "${tpl.name}".`);
        });
        actions.appendChild(btnDel);
      }

      card.append(banner, meta, actions);
      templatesGrid.appendChild(card);
    });
  }

  btnOpenNewTpl.addEventListener("click", () => {
    renderNewTplPresets();
    newTplNameInput.value = "";
    newTplPanel.classList.remove("hidden");
    newTplNameInput.focus();
  });

  btnCancelNewTpl.addEventListener("click", () => {
    newTplPanel.classList.add("hidden");
  });

  btnConfirmNewTpl.addEventListener("click", () => {
    const name = newTplNameInput.value.trim();
    if (!name) {
      showToast("Vui lòng nhập tên cho mẫu mới.", "error");
      newTplNameInput.focus();
      return;
    }

    const srcId = newTplSourceSelect.value;
    const baseTpl =
      srcId === "__default__"
        ? window.DEFAULT_TEMPLATE
        : store.templates.find((t) => t.id === srcId) || window.DEFAULT_TEMPLATE;

    const preset = window.THEME_PRESETS.find((p) => p.key === selectedPresetKey) || window.THEME_PRESETS[0];
    const newTpl = JSON.parse(JSON.stringify(baseTpl));
    newTpl.id = createUniqueId(name);
    newTpl.name = name;
    newTpl.theme = { ...preset.theme };

    store.templates.push(newTpl);
    editingTplId = newTpl.id;
    window.saveWeddingStore(store);

    newTplPanel.classList.add("hidden");
    renderTemplatesGrid();
    populateEditorFields();
    setActiveTab("editor");
    showToast(`Đã tạo mẫu "${name}"! Bạn có thể chỉnh sửa chi tiết ngay.`);
  });

  editorTplSelect.addEventListener("change", () => {
    editingTplId = editorTplSelect.value;
    populateEditorFields();
    renderTemplatesGrid();
  });

  /* ========================================================================
     5. Tab 2: Content & Theme Editor
     ======================================================================== */
  const editorTimelineList = document.getElementById("editor-timeline-list");
  const editorAlbumList = document.getElementById("editor-album-list");
  const editorThemePresetsWrap = document.getElementById("editor-theme-presets");
  const syncWebhookInput = document.getElementById("sync-webhook-url");

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function compressImageFile(file, maxSize = 1000) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let w = img.naturalWidth || maxSize;
          let h = img.naturalHeight || maxSize;
          if (w > maxSize || h > maxSize) {
            if (w >= h) {
              h = Math.round((h * maxSize) / w);
              w = maxSize;
            } else {
              w = Math.round((w * maxSize) / h);
              h = maxSize;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/webp", 0.82);
          resolve({
            dataUrl,
            aspect: `${(img.naturalWidth / img.naturalHeight).toFixed(4)} / 1`,
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const THEME_INPUT_MAP = [
    { key: "primary", input: "ed-thPrimary", hex: "ed-thPrimaryHex" },
    { key: "primaryDark", input: "ed-thPrimaryDark", hex: "ed-thPrimaryDarkHex" },
    { key: "primaryLight", input: "ed-thPrimaryLight", hex: "ed-thPrimaryLightHex" },
    { key: "paperBg", input: "ed-thPaperBg", hex: "ed-thPaperBgHex" },
    { key: "cardText", input: "ed-thCardText", hex: "ed-thCardTextHex" },
    { key: "goldAccent", input: "ed-thGoldAccent", hex: "ed-thGoldAccentHex" },
  ];

  THEME_INPUT_MAP.forEach(({ input, hex }) => {
    const picker = document.getElementById(input);
    const label = document.getElementById(hex);
    if (picker && label) {
      picker.addEventListener("input", () => {
        label.textContent = picker.value;
      });
    }
  });

  function renderEditorThemeQuickPresets() {
    editorThemePresetsWrap.innerHTML = "";
    window.THEME_PRESETS.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer";
      const dot = document.createElement("span");
      dot.className = "h-3 w-3 rounded-full";
      dot.style.backgroundColor = preset.theme.primary;
      const txt = document.createElement("span");
      txt.textContent = preset.label.split(" ")[0] + " " + (preset.label.split(" ")[1] || "");
      btn.append(dot, txt);
      btn.addEventListener("click", () => {
        THEME_INPUT_MAP.forEach(({ key, input, hex }) => {
          setVal(input, preset.theme[key]);
          const lbl = document.getElementById(hex);
          if (lbl) lbl.textContent = preset.theme[key];
        });
        showToast(`Đã áp dụng bảng màu ${preset.label}. Bấm Lưu để hoàn tất!`);
      });
      editorThemePresetsWrap.appendChild(btn);
    });
  }

  function renderTimelineEditor() {
    const cur = getEditingTemplate();
    editorTimelineList.innerHTML = "";
    cur.timeline.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "grid grid-cols-1 gap-2 rounded-lg bg-[#f7f5ee]/60 p-3 sm:grid-cols-[110px_1fr_150px_auto] items-center";

      const timeInput = document.createElement("input");
      timeInput.type = "text";
      timeInput.value = item.time || "";
      timeInput.placeholder = "18:30";
      timeInput.className = "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tabular-nums";
      timeInput.addEventListener("input", (e) => {
        cur.timeline[idx].time = e.target.value;
      });

      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.value = item.label || "";
      labelInput.placeholder = "Tên sự kiện";
      labelInput.className = "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm";
      labelInput.addEventListener("input", (e) => {
        cur.timeline[idx].label = e.target.value;
      });

      const iconSelect = document.createElement("select");
      iconSelect.className = "rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm";
      [
        { value: "", label: "Không icon" },
        { value: "church", label: "Lễ đường (church)" },
        { value: "cake", label: "Bánh cưới (cake)" },
        { value: "cook", label: "Món chính (cook)" },
      ].forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        if ((item.icon || "") === opt.value) o.selected = true;
        iconSelect.appendChild(o);
      });
      iconSelect.addEventListener("change", (e) => {
        cur.timeline[idx].icon = e.target.value;
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer";
      delBtn.textContent = "Xóa";
      delBtn.addEventListener("click", () => {
        cur.timeline.splice(idx, 1);
        renderTimelineEditor();
      });

      row.append(timeInput, labelInput, iconSelect, delBtn);
      editorTimelineList.appendChild(row);
    });
  }

  document.getElementById("btn-add-timeline").addEventListener("click", () => {
    const cur = getEditingTemplate();
    cur.timeline.push({ time: "20:00", label: "Sự kiện mới", icon: "" });
    renderTimelineEditor();
  });

  function renderAlbumEditor() {
    const cur = getEditingTemplate();
    editorAlbumList.innerHTML = "";
    cur.photos.album.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.className = "flex flex-col gap-2.5 rounded-lg border border-gray-200 bg-[#f7f5ee]/50 p-3";

      const top = document.createElement("div");
      top.className = "flex items-center gap-3";

      const thumb = document.createElement("img");
      thumb.src = photo.src;
      thumb.alt = `Album ${idx + 1}`;
      thumb.className = "h-20 w-16 rounded object-cover bg-white shadow-sm shrink-0";

      const info = document.createElement("div");
      info.className = "flex-1 min-w-0 space-y-1.5";

      const titleRow = document.createElement("div");
      titleRow.className = "flex items-center justify-between";
      const badge = document.createElement("span");
      badge.className = "text-xs font-bold text-[#00224c]";
      badge.textContent = `Ảnh #${idx + 1}`;
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "text-xs font-medium text-rose-600 hover:underline cursor-pointer";
      delBtn.textContent = "Xóa";
      delBtn.addEventListener("click", () => {
        cur.photos.album.splice(idx, 1);
        renderAlbumEditor();
      });
      titleRow.append(badge, delBtn);

      const urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.value = photo.src;
      urlInput.placeholder = "URL hoặc DataURL ảnh";
      urlInput.className = "w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-mono";
      urlInput.addEventListener("input", (e) => {
        cur.photos.album[idx].src = e.target.value;
        thumb.src = e.target.value;
      });

      const bottomRow = document.createElement("div");
      bottomRow.className = "flex items-center gap-2";

      const aspectInput = document.createElement("input");
      aspectInput.type = "text";
      aspectInput.value = photo.aspect || "0.66625 / 1";
      aspectInput.title = "Tỉ lệ khung hình (VD: 0.66625 / 1 hoặc 1.2 / 1)";
      aspectInput.className = "w-24 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-mono";
      aspectInput.addEventListener("input", (e) => {
        cur.photos.album[idx].aspect = e.target.value;
      });

      const uploadLabel = document.createElement("label");
      uploadLabel.className =
        "rounded bg-[#00224c] px-2.5 py-1 text-[11px] font-medium text-white cursor-pointer hover:opacity-90 whitespace-nowrap";
      uploadLabel.textContent = "Chọn file";
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "hidden";
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const compressed = await compressImageFile(file);
          cur.photos.album[idx].src = compressed.dataUrl;
          cur.photos.album[idx].aspect = compressed.aspect;
          thumb.src = compressed.dataUrl;
          urlInput.value = compressed.dataUrl;
          aspectInput.value = compressed.aspect;
          showToast(`Đã tải ảnh Album #${idx + 1}. Nhớ bấm Lưu thay đổi!`);
        } catch (_) {
          showToast("Không đọc được file ảnh này.", "error");
        }
      });
      uploadLabel.appendChild(fileInput);

      bottomRow.append(aspectInput, uploadLabel);
      info.append(titleRow, urlInput, bottomRow);
      top.append(thumb, info);
      card.appendChild(top);
      editorAlbumList.appendChild(card);
    });
  }

  document.getElementById("btn-add-album").addEventListener("click", () => {
    const cur = getEditingTemplate();
    cur.photos.album.push({
      src: "./assets/images/photos/album-1.webp",
      aspect: "0.66625 / 1",
    });
    renderAlbumEditor();
  });

  function populateEditorFields() {
    const c = getEditingTemplate();
    setVal("ed-tplName", c.name);

    THEME_INPUT_MAP.forEach(({ key, input, hex }) => {
      const colorVal = (c.theme && c.theme[key]) || "#00224c";
      setVal(input, colorVal);
      const lbl = document.getElementById(hex);
      if (lbl) lbl.textContent = colorVal;
    });

    setVal("ed-groomShort", c.couple.groomShort);
    setVal("ed-brideShort", c.couple.brideShort);
    setVal("ed-groomFull", c.couple.groomFull);
    setVal("ed-groomOrder", c.couple.groomOrder);
    setVal("ed-brideFull", c.couple.brideFull);
    setVal("ed-brideOrder", c.couple.brideOrder);
    setVal("ed-introDateText", c.couple.introDateText);
    setVal("ed-introGreeting", c.couple.introGreeting);
    setVal("ed-footerQuote", c.couple.footerQuote);
    setVal("ed-footerBrand", c.couple.footerBrand);

    setVal("ed-groomTitle", c.parents.groomTitle);
    setVal("ed-groomFather", c.parents.groomFather);
    setVal("ed-groomMother", c.parents.groomMother);
    setVal("ed-groomAddress", c.parents.groomAddress);
    setVal("ed-brideTitle", c.parents.brideTitle);
    setVal("ed-brideFather", c.parents.brideFather);
    setVal("ed-brideMother", c.parents.brideMother);
    setVal("ed-brideAddress", c.parents.brideAddress);

    setVal("ed-cerVenueTitle", c.ceremony.venueTitle);
    setVal("ed-cerTime", c.ceremony.time);
    setVal("ed-cerDow", c.ceremony.dayOfWeek);
    setVal("ed-cerDay", c.ceremony.day);
    setVal("ed-cerMonth", c.ceremony.month);
    setVal("ed-cerYear", c.ceremony.year);
    setVal("ed-cerLunar", c.ceremony.lunar);

    setVal("ed-recTime", c.reception.time);
    setVal("ed-recDow", c.reception.dayOfWeek);
    setVal("ed-recDay", c.reception.day);
    setVal("ed-recMonth", c.reception.month);
    setVal("ed-recYear", c.reception.year);
    setVal("ed-recLunar", c.reception.lunar);
    setVal("ed-recWelcome", c.reception.welcomeTime);
    setVal("ed-recPartyStart", c.reception.partyStartTime);
    setVal("ed-countdownIso", c.reception.countdownIso);
    setVal("ed-calYear", c.reception.calendarYear);
    setVal("ed-calMonth", c.reception.calendarMonth);
    setVal("ed-calDay", c.reception.calendarHighlightDay);

    setVal("ed-venueName", c.venue.name);
    setVal("ed-venueAddress", c.venue.address);
    setVal("ed-mapLat", c.venue.mapLat);
    setVal("ed-mapLng", c.venue.mapLng);
    setVal("ed-mapEmbedUrl", c.venue.mapEmbedUrl || "");
    const useCoordsEl = document.getElementById("ed-mapUseCoords");
    if (useCoordsEl) useCoordsEl.checked = Boolean(c.venue.useCoords);
    updateAdminMapPreview();

    setVal("ed-dcSubtitle", c.dressCode.subtitle);
    [0, 1, 2].forEach((i) => {
      const hex = c.dressCode.colors[i] || "#00224c";
      setVal(`ed-dcColor${i}`, hex);
      const hexSpan = document.getElementById(`ed-dcHex${i}`);
      if (hexSpan) hexSpan.textContent = hex;
    });

    setVal("ed-giftGroomTitle", c.gift.groom.title);
    setVal("ed-giftGroomBank", c.gift.groom.bank);
    setVal("ed-giftGroomAcc", c.gift.groom.account);
    setVal("ed-giftGroomHolder", c.gift.groom.holder);
    setVal("ed-qrGroomSrc", c.gift.groom.qrSrc);
    document.getElementById("preview-qr-groom").src = c.gift.groom.qrSrc;

    setVal("ed-giftBrideTitle", c.gift.bride.title);
    setVal("ed-giftBrideBank", c.gift.bride.bank);
    setVal("ed-giftBrideAcc", c.gift.bride.account);
    setVal("ed-giftBrideHolder", c.gift.bride.holder);
    setVal("ed-qrBrideSrc", c.gift.bride.qrSrc);
    document.getElementById("preview-qr-bride").src = c.gift.bride.qrSrc;

    setVal("ed-hero1", c.photos.hero1);
    document.getElementById("preview-hero-1").src = c.photos.hero1;
    setVal("ed-hero2", c.photos.hero2);
    document.getElementById("preview-hero-2").src = c.photos.hero2;

    const music = c.music || { enabled: true, src: "./assets/audio/mot-doi.mp3", title: "Một Đời" };
    const musicEnabledEl = document.getElementById("ed-musicEnabled");
    if (musicEnabledEl) musicEnabledEl.checked = music.enabled !== false;
    setVal("ed-musicTitle", music.title || "");
    setVal("ed-musicSrc", music.src || "./assets/audio/mot-doi.mp3");
    updateAdminMusicPreview();

    if (syncWebhookInput) syncWebhookInput.value = c.webhookUrl || "";

    renderEditorThemeQuickPresets();
    renderTimelineEditor();
    renderAlbumEditor();
  }

  [0, 1, 2].forEach((i) => {
    const picker = document.getElementById(`ed-dcColor${i}`);
    const span = document.getElementById(`ed-dcHex${i}`);
    if (picker && span) {
      picker.addEventListener("input", () => {
        span.textContent = picker.value;
      });
    }
  });

  document.querySelectorAll("[data-upload-target]").forEach((fileInput) => {
    const targetId = fileInput.getAttribute("data-upload-target");
    const previewId = fileInput.getAttribute("data-preview-target");
    const textInput = document.getElementById(targetId);
    const previewImg = document.getElementById(previewId);

    if (textInput && previewImg) {
      textInput.addEventListener("input", () => {
        previewImg.src = textInput.value;
      });
    }

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressed = await compressImageFile(file);
        if (textInput) textInput.value = compressed.dataUrl;
        if (previewImg) previewImg.src = compressed.dataUrl;
        showToast("Đã tải ảnh lên. Bấm Lưu thay đổi để áp dụng!");
      } catch (_) {
        showToast("Không thể đọc file ảnh.", "error");
      }
    });
  });

  function collectFormIntoEditingTemplate() {
    const c = getEditingTemplate();
    c.name = getVal("ed-tplName").trim() || c.name;

    c.theme = {
      primary: getVal("ed-thPrimary") || "#00224c",
      primaryDark: getVal("ed-thPrimaryDark") || "#001531",
      primaryLight: getVal("ed-thPrimaryLight") || "#073268",
      paperBg: getVal("ed-thPaperBg") || "#f7f5ee",
      cardText: getVal("ed-thCardText") || "#ece4d8",
      goldAccent: getVal("ed-thGoldAccent") || "#c9a24a",
    };

    c.couple = {
      groomShort: getVal("ed-groomShort").trim(),
      brideShort: getVal("ed-brideShort").trim(),
      groomFull: getVal("ed-groomFull").trim(),
      groomOrder: getVal("ed-groomOrder").trim(),
      brideFull: getVal("ed-brideFull").trim(),
      brideOrder: getVal("ed-brideOrder").trim(),
      introDateText: getVal("ed-introDateText").trim(),
      introGreeting: getVal("ed-introGreeting").trim(),
      footerQuote: getVal("ed-footerQuote").trim(),
      footerBrand: getVal("ed-footerBrand").trim(),
    };

    c.parents = {
      groomTitle: getVal("ed-groomTitle").trim(),
      groomFather: getVal("ed-groomFather").trim(),
      groomMother: getVal("ed-groomMother").trim(),
      groomAddress: getVal("ed-groomAddress").trim(),
      brideTitle: getVal("ed-brideTitle").trim(),
      brideFather: getVal("ed-brideFather").trim(),
      brideMother: getVal("ed-brideMother").trim(),
      brideAddress: getVal("ed-brideAddress").trim(),
    };

    c.ceremony = {
      venueTitle: getVal("ed-cerVenueTitle"),
      time: getVal("ed-cerTime").trim(),
      dayOfWeek: getVal("ed-cerDow").trim(),
      day: getVal("ed-cerDay").trim(),
      month: getVal("ed-cerMonth").trim(),
      year: getVal("ed-cerYear").trim(),
      lunar: getVal("ed-cerLunar").trim(),
    };

    c.reception = {
      time: getVal("ed-recTime").trim(),
      dayOfWeek: getVal("ed-recDow").trim(),
      day: getVal("ed-recDay").trim(),
      month: getVal("ed-recMonth").trim(),
      year: getVal("ed-recYear").trim(),
      lunar: getVal("ed-recLunar").trim(),
      welcomeTime: getVal("ed-recWelcome").trim(),
      partyStartTime: getVal("ed-recPartyStart").trim(),
      countdownIso: getVal("ed-countdownIso").trim(),
      calendarYear: Number(getVal("ed-calYear")) || 2026,
      calendarMonth: Number(getVal("ed-calMonth")) || 12,
      calendarHighlightDay: Number(getVal("ed-calDay")) || 19,
    };

    const rawLat = getVal("ed-mapLat").trim();
    const rawLng = getVal("ed-mapLng").trim();
    const parsedLat = rawLat === "" ? 10.7553 : Number(rawLat);
    const parsedLng = rawLng === "" ? 106.6904 : Number(rawLng);
    c.venue = {
      name: getVal("ed-venueName").trim(),
      address: getVal("ed-venueAddress").trim(),
      mapLat: Number.isFinite(parsedLat) ? parsedLat : 10.7553,
      mapLng: Number.isFinite(parsedLng) ? parsedLng : 106.6904,
      mapEmbedUrl: getVal("ed-mapEmbedUrl").trim(),
      useCoords: Boolean(document.getElementById("ed-mapUseCoords")?.checked),
    };

    c.dressCode = {
      subtitle: getVal("ed-dcSubtitle").trim(),
      colors: [getVal("ed-dcColor0"), getVal("ed-dcColor1"), getVal("ed-dcColor2")],
    };

    c.gift = {
      groom: {
        title: getVal("ed-giftGroomTitle").trim(),
        bank: getVal("ed-giftGroomBank").trim(),
        account: getVal("ed-giftGroomAcc").trim(),
        holder: getVal("ed-giftGroomHolder").trim(),
        qrSrc: getVal("ed-qrGroomSrc").trim(),
      },
      bride: {
        title: getVal("ed-giftBrideTitle").trim(),
        bank: getVal("ed-giftBrideBank").trim(),
        account: getVal("ed-giftBrideAcc").trim(),
        holder: getVal("ed-giftBrideHolder").trim(),
        qrSrc: getVal("ed-qrBrideSrc").trim(),
      },
    };

    c.photos.hero1 = getVal("ed-hero1").trim();
    c.photos.hero2 = getVal("ed-hero2").trim();
    c.music = {
      enabled: Boolean(document.getElementById("ed-musicEnabled")?.checked),
      title: getVal("ed-musicTitle").trim(),
      src: getVal("ed-musicSrc").trim() || "./assets/audio/mot-doi.mp3",
    };
    c.webhookUrl = syncWebhookInput ? syncWebhookInput.value.trim() : "";

    return c;
  }

  async function saveStoreToLocal() {
    const saveBtn = document.getElementById("btn-save-top");
    try {
      const updated = collectFormIntoEditingTemplate();
      suppressAutoCloudPush = true;
      originalSaveWeddingStore(store);
      suppressAutoCloudPush = false;
      renderTemplatesGrid();

      if (cloudConnected && adminPassword) {
        if (saveBtn) saveBtn.disabled = true;
        const res = await pushStoreToCloud(store, false);
        if (saveBtn) saveBtn.disabled = false;
        if (res.ok) {
          showToast(`Đã lưu trực tiếp lên web! Mẫu "${updated.name}" đã cập nhật cho mọi người.`);
        }
        return res.ok;
      }

      showToast(`Đã lưu cục bộ mẫu "${updated.name}"! Bấm "Xem thiệp" để kiểm tra.`);
      return true;
    } catch (_) {
      suppressAutoCloudPush = false;
      if (saveBtn) saveBtn.disabled = false;
      showToast("Dung lượng ảnh/nhạc quá lớn vượt giới hạn lưu trữ.", "error");
      return false;
    }
  }

  document.getElementById("btn-save-top").addEventListener("click", saveStoreToLocal);

  let mapPreviewTimer = null;
  function updateAdminMapPreview() {
    const previewIframe = document.getElementById("admin-map-preview");
    const testLink = document.getElementById("admin-map-test-link");
    const rawLat = getVal("ed-mapLat").trim();
    const rawLng = getVal("ed-mapLng").trim();
    const previewVenue = {
      name: getVal("ed-venueName").trim(),
      address: getVal("ed-venueAddress").trim(),
      mapLat: rawLat === "" ? 10.7553 : Number(rawLat),
      mapLng: rawLng === "" ? 106.6904 : Number(rawLng),
      mapEmbedUrl: getVal("ed-mapEmbedUrl").trim(),
      useCoords: Boolean(document.getElementById("ed-mapUseCoords")?.checked),
    };
    if (previewIframe && typeof window.buildWeddingMapEmbedUrl === "function") {
      const nextSrc = window.buildWeddingMapEmbedUrl(previewVenue);
      if (previewIframe.getAttribute("src") !== nextSrc) {
        previewIframe.src = nextSrc;
      }
    }
    if (testLink && typeof window.buildWeddingDirectionsUrl === "function") {
      testLink.href = window.buildWeddingDirectionsUrl(previewVenue);
    }
  }

  ["ed-venueName", "ed-venueAddress", "ed-mapLat", "ed-mapLng", "ed-mapEmbedUrl"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        clearTimeout(mapPreviewTimer);
        mapPreviewTimer = setTimeout(updateAdminMapPreview, 400);
      });
    }
  });
  const mapUseCoordsInput = document.getElementById("ed-mapUseCoords");
  if (mapUseCoordsInput) {
    mapUseCoordsInput.addEventListener("change", updateAdminMapPreview);
  }

  let musicPreviewTimer = null;
  function updateAdminMusicPreview() {
    const audioEl = document.getElementById("preview-music-audio");
    if (!audioEl) return;
    const src = getVal("ed-musicSrc").trim() || "./assets/audio/mot-doi.mp3";
    if (audioEl.getAttribute("src") !== src) {
      audioEl.pause();
      audioEl.src = src;
      audioEl.load();
    }
  }

  const musicSrcInput = document.getElementById("ed-musicSrc");
  if (musicSrcInput) {
    musicSrcInput.addEventListener("input", () => {
      clearTimeout(musicPreviewTimer);
      musicPreviewTimer = setTimeout(updateAdminMusicPreview, 300);
    });
  }

  const musicFileInput = document.getElementById("ed-musicFile");
  if (musicFileInput) {
    musicFileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const MAX_BYTES = 2.5 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        showToast(
          "File nhạc lớn hơn 2.5 MB! Hãy chép vào thư mục assets/audio/ hoặc dán link .mp3 trực tiếp.",
          "error"
        );
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        setVal("ed-musicSrc", reader.result);
        if (!getVal("ed-musicTitle").trim()) {
          setVal("ed-musicTitle", file.name.replace(/\.[^.]+$/, ""));
        }
        updateAdminMusicPreview();
        showToast("Đã tải file nhạc lên. Bấm Lưu thay đổi để áp dụng!");
      };
      reader.onerror = () => {
        showToast("Không thể đọc file nhạc này.", "error");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
  }

  const resetMusicBtn = document.getElementById("btn-reset-music");
  if (resetMusicBtn) {
    resetMusicBtn.addEventListener("click", () => {
      const enabledEl = document.getElementById("ed-musicEnabled");
      if (enabledEl) enabledEl.checked = true;
      setVal("ed-musicTitle", "Một Đời");
      setVal("ed-musicSrc", "./assets/audio/mot-doi.mp3");
      updateAdminMusicPreview();
      showToast("Đã khôi phục nhạc nền mặc định.");
    });
  }

  /* ========================================================================
     6. Tab 3: Guest Responses (RSVP & Wishes) Dashboard + Google Sheets Sync
     ======================================================================== */
  const kpiRsvpTotal = document.getElementById("kpi-rsvp-total");
  const kpiRsvpAttending = document.getElementById("kpi-rsvp-attending");
  const kpiRsvpGuestsCount = document.getElementById("kpi-rsvp-guests-count");
  const kpiRsvpDeclining = document.getElementById("kpi-rsvp-declining");
  const kpiWishesNew = document.getElementById("kpi-wishes-new");

  const rsvpSearchEl = document.getElementById("rsvp-search");
  const rsvpFilterEl = document.getElementById("rsvp-filter");
  const rsvpTableBody = document.getElementById("rsvp-table-body");

  const wishesSearchEl = document.getElementById("wishes-search");
  const wishesAdminList = document.getElementById("wishes-admin-list");

  function getStoredRsvps() {
    try {
      const list = JSON.parse(localStorage.getItem("wedding_rsvps") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function saveStoredRsvps(list) {
    localStorage.setItem("wedding_rsvps", JSON.stringify(list));
  }

  function getStoredWishes() {
    try {
      const list = JSON.parse(localStorage.getItem("wedding_wishes") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function saveStoredWishes(list) {
    localStorage.setItem("wedding_wishes", JSON.stringify(list));
  }

  function formatIsoTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  function renderGuestDashboard() {
    const rsvps = getStoredRsvps();
    const wishes = getStoredWishes();

    const attendingList = rsvps.filter((r) => r.status === "attending");
    const decliningList = rsvps.filter((r) => r.status !== "attending");
    const totalPeople = attendingList.reduce((sum, r) => sum + (Number(r.guests) || 1), 0);

    kpiRsvpTotal.textContent = String(rsvps.length);
    kpiRsvpAttending.textContent = String(attendingList.length);
    kpiRsvpGuestsCount.textContent = String(totalPeople);
    kpiRsvpDeclining.textContent = String(decliningList.length);
    kpiWishesNew.textContent = String(wishes.length);

    const rsvpQuery = (rsvpSearchEl.value || "").trim().toLowerCase();
    const rsvpStatus = rsvpFilterEl.value;
    const filteredRsvps = rsvps
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        if (rsvpStatus !== "all" && item.status !== rsvpStatus) return false;
        if (!rsvpQuery) return true;
        return (
          (item.name || "").toLowerCase().includes(rsvpQuery) ||
          (item.note || "").toLowerCase().includes(rsvpQuery)
        );
      });

    rsvpTableBody.innerHTML = "";
    if (filteredRsvps.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.className = "px-4 py-8 text-center text-sm text-gray-400";
      td.textContent =
        rsvps.length === 0
          ? "Chưa có khách nào gửi xác nhận tham dự."
          : "Không tìm thấy kết quả phù hợp.";
      tr.appendChild(td);
      rsvpTableBody.appendChild(tr);
    } else {
      filteredRsvps.forEach(({ item, idx }) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#f7f5ee]/60";

        const tdName = document.createElement("td");
        tdName.className = "px-4 py-3 font-semibold text-[#00224c]";
        tdName.textContent = item.name || "";

        const tdStatus = document.createElement("td");
        tdStatus.className = "px-4 py-3";
        const badge = document.createElement("span");
        if (item.status === "attending") {
          badge.className =
            "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700";
          badge.textContent = "Sẽ tham dự";
        } else {
          badge.className =
            "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600";
          badge.textContent = "Không thể đến";
        }
        tdStatus.appendChild(badge);

        const tdGuests = document.createElement("td");
        tdGuests.className = "px-4 py-3 text-center tabular-nums";
        tdGuests.textContent = item.status === "attending" ? String(item.guests || 1) : "0";

        const tdNote = document.createElement("td");
        tdNote.className = "px-4 py-3 text-gray-600 max-w-[260px] break-words";
        tdNote.textContent = item.note || "—";

        const tdTime = document.createElement("td");
        tdTime.className = "px-4 py-3 text-xs text-gray-400 whitespace-nowrap tabular-nums";
        tdTime.textContent = formatIsoTime(item.createdAt);

        const tdAction = document.createElement("td");
        tdAction.className = "px-4 py-3 text-right";
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "text-xs font-medium text-rose-600 hover:underline cursor-pointer";
        delBtn.textContent = "Xóa";
        delBtn.addEventListener("click", () => {
          const all = getStoredRsvps();
          const [removed] = all.splice(idx, 1);
          saveStoredRsvps(all);
          if (removed && removed.id) deleteCloudGuest("rsvp", removed.id);
          renderGuestDashboard();
          showToast("Đã xóa phản hồi RSVP.");
        });
        tdAction.appendChild(delBtn);

        tr.append(tdName, tdStatus, tdGuests, tdNote, tdTime, tdAction);
        rsvpTableBody.appendChild(tr);
      });
    }

    const wishQuery = (wishesSearchEl.value || "").trim().toLowerCase();
    const combinedWishes = wishes
      .map((w, idx) => ({ ...w, idx }))
      .filter((w) => {
        if (!wishQuery) return true;
        return (
          (w.name || "").toLowerCase().includes(wishQuery) ||
          (w.message || "").toLowerCase().includes(wishQuery)
        );
      });

    wishesAdminList.innerHTML = "";
    if (combinedWishes.length === 0) {
      const empty = document.createElement("p");
      empty.className = "py-6 text-center text-sm text-gray-400";
      empty.textContent =
        wishes.length === 0
          ? "Chưa có lời chúc mới nào được gửi từ khách."
          : "Không tìm thấy lời chúc phù hợp.";
      wishesAdminList.appendChild(empty);
    } else {
      combinedWishes.forEach((w) => {
        const card = document.createElement("div");
        card.className =
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#00224c1f] bg-[#f7f5ee]/50 p-3.5";

        const left = document.createElement("div");
        left.className = "space-y-1";

        const top = document.createElement("div");
        top.className = "flex flex-wrap items-center gap-2";

        const nameEl = document.createElement("span");
        nameEl.className = "font-semibold text-sm text-[#00224c]";
        nameEl.textContent = w.name || "";

        const timeEl = document.createElement("span");
        timeEl.className = "text-[11px] text-gray-400 tabular-nums";
        timeEl.textContent = w.time || "";

        top.append(nameEl, timeEl);

        const msgEl = document.createElement("p");
        msgEl.className = "text-sm text-gray-700";
        msgEl.textContent = w.message || "";

        left.append(top, msgEl);
        card.appendChild(left);

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "self-start sm:self-center text-xs font-medium text-rose-600 hover:underline cursor-pointer shrink-0";
        delBtn.textContent = "Xóa";
        delBtn.addEventListener("click", () => {
          const all = getStoredWishes();
          const [removed] = all.splice(w.idx, 1);
          saveStoredWishes(all);
          if (removed && removed.id) deleteCloudGuest("wish", removed.id);
          renderGuestDashboard();
          showToast("Đã xóa lời chúc.");
        });
        card.appendChild(delBtn);

        wishesAdminList.appendChild(card);
      });
    }
  }

  rsvpSearchEl.addEventListener("input", renderGuestDashboard);
  rsvpFilterEl.addEventListener("change", renderGuestDashboard);
  wishesSearchEl.addEventListener("input", renderGuestDashboard);

  /* ========================================================================
     7. CSV Export & Google Sheets Sync
     ======================================================================== */
  function downloadCsv(filename, headers, rows) {
    const escapeCell = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escapeCell).join(","),
      ...rows.map((r) => r.map(escapeCell).join(",")),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  document.getElementById("btn-export-rsvp").addEventListener("click", () => {
    const rsvps = getStoredRsvps();
    if (rsvps.length === 0) {
      showToast("Chưa có dữ liệu RSVP để xuất.", "error");
      return;
    }
    downloadCsv(
      "danh-sach-rsvp.csv",
      ["Tên khách", "Trạng thái", "Số khách", "Lời nhắn", "Thời gian"],
      rsvps.map((r) => [
        r.name,
        r.status === "attending" ? "Sẽ tham dự" : "Không thể đến",
        r.status === "attending" ? r.guests || 1 : 0,
        r.note || "",
        formatIsoTime(r.createdAt),
      ])
    );
    showToast("Đã xuất file danh-sach-rsvp.csv!");
  });

  document.getElementById("btn-export-wishes").addEventListener("click", () => {
    const wishes = getStoredWishes();
    if (wishes.length === 0) {
      showToast("Chưa có lời chúc mới để xuất.", "error");
      return;
    }
    downloadCsv(
      "so-luu-but.csv",
      ["Tên khách", "Lời chúc", "Thời gian"],
      wishes.map((w) => [w.name, w.message, w.time || ""])
    );
    showToast("Đã xuất file so-luu-but.csv!");
  });

  const btnSaveWebhook = document.getElementById("btn-save-webhook");
  const btnSyncSheets = document.getElementById("btn-sync-sheets");
  const btnCopyGas = document.getElementById("btn-copy-gas");
  const gasCodeBlock = document.getElementById("gas-code-block");

  if (btnCopyGas && gasCodeBlock) {
    btnCopyGas.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(gasCodeBlock.textContent || "");
        showToast("Đã sao chép mã Google Apps Script!");
      } catch (_) {
        showToast("Không thể tự động copy, vui lòng bôi đen để copy.", "error");
      }
    });
  }

  if (btnSaveWebhook) {
    btnSaveWebhook.addEventListener("click", saveStoreToLocal);
  }

  if (btnSyncSheets) {
    btnSyncSheets.addEventListener("click", async () => {
      const url = (syncWebhookInput.value || "").trim();
      if (!url) {
        showToast("Vui lòng nhập URL Google Apps Script trước.", "error");
        return;
      }
      try {
        btnSyncSheets.disabled = true;
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        if (Array.isArray(data.rsvps)) {
          const localRsvps = getStoredRsvps();
          const map = new Map();
          [...data.rsvps, ...localRsvps].forEach((r) => {
            const key = r.id || `${r.name}_${r.createdAt}`;
            if (!map.has(key)) map.set(key, r);
          });
          saveStoredRsvps(Array.from(map.values()));
        }

        if (Array.isArray(data.wishes)) {
          const localWishes = getStoredWishes();
          const map = new Map();
          [...data.wishes, ...localWishes].forEach((w) => {
            const key = w.id || `${w.name}_${w.time}_${w.message}`;
            if (!map.has(key)) map.set(key, w);
          });
          saveStoredWishes(Array.from(map.values()));
        }

        renderGuestDashboard();
        showToast("Đã đồng bộ dữ liệu mới nhất từ Google Sheets!");
      } catch (_) {
        showToast("Không thể tải dữ liệu từ URL này. Kiểm tra quyền Anyone trên Apps Script.", "error");
      } finally {
        btnSyncSheets.disabled = false;
      }
    });
  }

  /* ========================================================================
     8. Reset to Default
     ======================================================================== */
  document.getElementById("btn-reset-default").addEventListener("click", async () => {
    localStorage.removeItem("wedding_store_v1");
    if (cloudConnected && adminPassword) {
      try {
        await fetch("/api/config", {
          method: "DELETE",
          headers: { "x-admin-password": adminPassword },
        });
      } catch (_) {}
    }
    store = window.getWeddingStore();
    editingTplId = store.activeTemplateId || store.templates[0].id;
    renderTemplatesGrid();
    populateEditorFields();
    showToast("Đã khôi phục kho mẫu thiệp về mặc định.");
  });

  /* ========================================================================
     9. Init
     ======================================================================== */
  renderTemplatesGrid();
  populateEditorFields();
  renderGuestDashboard();
  if (adminPassword) {
    unlockAdminWithPassword(adminPassword, true);
  }
})();
