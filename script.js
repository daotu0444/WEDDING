(() => {
  "use strict";

  /* ========================================================================
     0. Load Active Template Configuration & Apply Theme / Content
     ======================================================================== */
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTplId = urlParams.get("tpl");
  const activeTpl = window.getActiveWeddingTemplate(requestedTplId);

  function hexToRgba(hex, alpha) {
    const clean = String(hex || "#00224c").replace("#", "");
    const full =
      clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean.padEnd(6, "0").slice(0, 6);
    const num = parseInt(full, 16);
    if (Number.isNaN(num)) return `rgba(0, 34, 76, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = val;
  }

  function applyThemeAndContent(tpl) {
    const t = tpl.theme || {};
    const primary = t.primary || "#00224c";
    const primaryDark = t.primaryDark || "#001531";
    const primaryLight = t.primaryLight || "#073268";
    const paperBg = t.paperBg || "#f7f5ee";
    const cardText = t.cardText || "#ece4d8";
    const goldAccent = t.goldAccent || "#c9a24a";

    // Document title
    document.title = `Thiệp Cưới ${tpl.couple.groomShort} & ${tpl.couple.brideShort} - ${tpl.name}`;

    // Theme surfaces
    const introOverlayEl = document.getElementById("intro-overlay");
    if (introOverlayEl) {
      introOverlayEl.style.background = `linear-gradient(to bottom right, ${primaryLight}, ${primary}, ${primaryDark})`;
    }
    const introSealEl = document.getElementById("intro-seal");
    if (introSealEl) {
      introSealEl.style.background = `radial-gradient(circle at 30% 30%, ${primary}, ${primaryDark})`;
      introSealEl.style.setProperty("--shadow-color", hexToRgba(primary, 0.5));
      const heartSvg = introSealEl.querySelector("svg");
      if (heartSvg) heartSvg.style.fill = cardText;
    }
    const introCardSurface = document.getElementById("intro-card-surface");
    if (introCardSurface) {
      introCardSurface.style.background = hexToRgba(paperBg, 0.96);
      introCardSurface.style.borderColor = hexToRgba(primary, 0.15);
    }

    document.querySelectorAll("[data-theme-paper]").forEach((el) => {
      el.style.backgroundColor = paperBg;
      el.style.color = primary;
    });
    document.querySelectorAll("[data-theme-bg='primary']").forEach((el) => {
      el.style.backgroundColor = primary;
    });
    document.querySelectorAll("[data-theme-card-text]").forEach((el) => {
      el.style.color = cardText;
    });
    document.querySelectorAll("[data-theme-text='primary']").forEach((el) => {
      el.style.color = primary;
    });
    document.querySelectorAll("[data-theme-border='primary']").forEach((el) => {
      el.style.borderColor = primary;
      el.style.color = primary;
    });

    const heroAmp = document.getElementById("hero-amp");
    if (heroAmp) heroAmp.style.color = hexToRgba(primary, 0.15);

    const calCard = document.getElementById("calendar-card");
    if (calCard) {
      calCard.style.backgroundColor = cardText;
      calCard.style.color = primary;
    }
    const calTitle = document.getElementById("calendar-title");
    if (calTitle) calTitle.style.borderBottom = `1px solid ${hexToRgba(primary, 0.27)}`;
    const calWeekdays = document.getElementById("calendar-weekdays");
    if (calWeekdays) calWeekdays.style.borderBottom = `2px solid ${primary}`;

    const musicDisc = document.getElementById("music-cd-disc");
    if (musicDisc) {
      musicDisc.style.background = `linear-gradient(to right bottom, ${hexToRgba(primary, 0.8)}, ${primary}, ${hexToRgba(primary, 0.87)})`;
    }
    const rsvpSubmit = document.getElementById("rsvp-submit-btn");
    if (rsvpSubmit) {
      rsvpSubmit.style.backgroundColor = primary;
      rsvpSubmit.style.color = cardText;
    }
    const giftModalCard = document.getElementById("gift-modal-card");
    if (giftModalCard) giftModalCard.style.backgroundColor = paperBg;

    // Gold sparkles tint
    document.querySelectorAll(".ienv-sparkle-2, .ienv-sparkle-3, .ienv-sparkle-4").forEach((s) => {
      s.style.color = goldAccent;
    });

    // Couple & Intro & Footer
    setText("intro-groom", tpl.couple.groomShort);
    setText("intro-bride", tpl.couple.brideShort);
    setText("intro-date", tpl.couple.introDateText);
    setText("intro-greeting", tpl.couple.introGreeting);
    setText("hero-groom", tpl.couple.groomShort);
    setText("hero-bride", tpl.couple.brideShort);
    setText("footer-quote", tpl.couple.footerQuote);
    setText("footer-brand", tpl.couple.footerBrand);

    // Hero Polaroid photos
    const heroImg1 = document.getElementById("hero-img-1");
    if (heroImg1 && tpl.photos.hero1) heroImg1.src = tpl.photos.hero1;
    const heroImg2 = document.getElementById("hero-img-2");
    if (heroImg2 && tpl.photos.hero2) heroImg2.src = tpl.photos.hero2;

    // Parents
    setText("par-groom-title", tpl.parents.groomTitle);
    setText("par-groom-father", tpl.parents.groomFather);
    setText("par-groom-mother", tpl.parents.groomMother);
    setText("par-groom-addr", tpl.parents.groomAddress);
    setText("par-bride-title", tpl.parents.brideTitle);
    setText("par-bride-father", tpl.parents.brideFather);
    setText("par-bride-mother", tpl.parents.brideMother);
    setText("par-bride-addr", tpl.parents.brideAddress);

    // Ceremony
    setText("cer-groom-full", tpl.couple.groomFull);
    setText("cer-groom-order", tpl.couple.groomOrder);
    setText("cer-bride-full", tpl.couple.brideFull);
    setText("cer-bride-order", tpl.couple.brideOrder);
    setText("cer-venue-title", tpl.ceremony.venueTitle);
    setText("cer-time", `VÀO LÚC ${tpl.ceremony.time}`);
    setText("cer-dow", tpl.ceremony.dayOfWeek);
    setText("cer-day", tpl.ceremony.day);
    setText("cer-month", tpl.ceremony.month);
    setText("cer-year", tpl.ceremony.year);
    setText("cer-lunar", tpl.ceremony.lunar);

    // Reception
    setText("rec-time", tpl.reception.time);
    setText("rec-dow", tpl.reception.dayOfWeek);
    setText("rec-day", tpl.reception.day);
    setText("rec-month", tpl.reception.month);
    setText("rec-year", tpl.reception.year);
    setText("rec-lunar", tpl.reception.lunar);
    setText("rec-welcome", tpl.reception.welcomeTime);
    setText("rec-party-start", tpl.reception.partyStartTime);

    // Dynamic Calendar Grid
    const calY = Number(tpl.reception.calendarYear) || 2026;
    const calM = Math.max(1, Math.min(12, Number(tpl.reception.calendarMonth) || 12));
    const highlightDay = Number(tpl.reception.calendarHighlightDay) || 19;
    setText("calendar-title", `Tháng ${calM} / ${calY}`);

    const calGrid = document.getElementById("calendar-days-grid");
    if (calGrid) {
      calGrid.innerHTML = "";
      const firstJsDay = new Date(calY, calM - 1, 1).getDay(); // 0=Sun..6=Sat
      const leadingEmpty = (firstJsDay + 6) % 7; // Monday=0..Sunday=6
      const daysInMonth = new Date(calY, calM, 0).getDate();

      for (let i = 0; i < leadingEmpty; i++) {
        const blank = document.createElement("span");
        blank.className = "h-[30px] md:h-[34px]";
        calGrid.appendChild(blank);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement("span");
        if (d === highlightDay) {
          cell.className = "relative flex h-[30px] md:h-[34px] items-center justify-center";
          cell.innerHTML =
            `<span class="relative flex items-center justify-center w-[26px] h-[24px] md:w-[30px] md:h-[28px]">` +
            `<svg viewBox="0 0 24 22" class="absolute inset-0 w-full h-full drop-shadow-sm" fill="${primary}" aria-hidden="true">` +
            `<path d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z"></path>` +
            `</svg>` +
            `<span class="relative z-10 text-[11px] md:text-[12px] font-bold" style="color:${cardText}">${d}</span>` +
            `</span>`;
        } else {
          cell.className = "flex h-[30px] md:h-[34px] items-center justify-center";
          cell.textContent = String(d);
        }
        calGrid.appendChild(cell);
      }
    }

    // Google Calendar Link
    const gcalLink = document.getElementById("gcal-link");
    if (gcalLink) {
      const startMs = new Date(tpl.reception.countdownIso || "2026-12-19T18:30:00+07:00").getTime();
      const pad2 = (n) => String(n).padStart(2, "0");
      const toUtcStamp = (ms) => {
        const dt = new Date(ms);
        return (
          `${dt.getUTCFullYear()}${pad2(dt.getUTCMonth() + 1)}${pad2(dt.getUTCDate())}` +
          `T${pad2(dt.getUTCHours())}${pad2(dt.getUTCMinutes())}${pad2(dt.getUTCSeconds())}Z`
        );
      };
      const datesParam = Number.isNaN(startMs)
        ? "20261219T113000Z/20261219T133000Z"
        : `${toUtcStamp(startMs)}/${toUtcStamp(startMs + 2 * 60 * 60 * 1000)}`;
      const titleText = `Đám cưới ${tpl.couple.groomFull} & ${tpl.couple.brideFull}`;
      const detailsText = `Tiệc cưới của ${tpl.couple.groomFull} & ${tpl.couple.brideFull} tại ${tpl.venue.address}`;
      gcalLink.href =
        `https://www.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(titleText)}` +
        `&dates=${datesParam}` +
        `&ctz=Asia/Ho_Chi_Minh` +
        `&details=${encodeURIComponent(detailsText)}` +
        `&location=${encodeURIComponent(tpl.venue.address)}`;
    }

    // Venue & Map
    const venueAddrEl = document.getElementById("venue-address-text");
    if (venueAddrEl) {
      venueAddrEl.textContent = tpl.venue.address;
      venueAddrEl.style.color = hexToRgba(primary, 0.72);
    }
    const mapIframe = document.getElementById("venue-map-iframe");
    if (mapIframe) {
      const lat = Number(tpl.venue.mapLat) || 10.7614;
      const lng = Number(tpl.venue.mapLng) || 106.7010;
      const dLat = 0.0032;
      const dLng = 0.0042;
      const bbox = `${(lng - dLng).toFixed(4)}%2C${(lat - dLat).toFixed(4)}%2C${(lng + dLng).toFixed(4)}%2C${(lat + dLat).toFixed(4)}`;
      mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(4)}%2C${lng.toFixed(4)}`;
    }
    const dirLink = document.getElementById("venue-directions-link");
    if (dirLink) {
      dirLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tpl.venue.address)}`;
      dirLink.style.color = hexToRgba(primary, 0.72);
    }

    // Dress Code
    setText("dresscode-subtitle", tpl.dressCode.subtitle);
    const dcWrap = document.getElementById("dresscode-swatches");
    if (dcWrap) {
      dcWrap.innerHTML = "";
      (tpl.dressCode.colors || []).forEach((c) => {
        const dot = document.createElement("span");
        dot.className = "w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md";
        dot.style.backgroundColor = c;
        dot.title = c;
        dcWrap.appendChild(dot);
      });
    }

    // Timeline
    const tlList = document.getElementById("timeline-list");
    if (tlList) {
      tlList.innerHTML = "";
      const items = tpl.timeline || [];
      const line = document.createElement("span");
      line.setAttribute("aria-hidden", "true");
      line.className = "pointer-events-none col-start-2 row-start-1 justify-self-center h-full w-px";
      line.style.gridRowEnd = String(items.length + 1);
      line.style.backgroundColor = hexToRgba(cardText, 0.4);
      tlList.appendChild(line);

      const iconMap = {
        church: { src: "./assets/images/theme/church.webp", cls: "w-[38px] md:w-[46px] h-auto mr-3 sm:mr-5 object-contain" },
        cake: { src: "./assets/images/theme/cake.webp", cls: "w-[28px] md:w-[33px] h-auto mr-4 sm:mr-6 object-contain" },
        cook: { src: "./assets/images/theme/cook.webp", cls: "w-[36px] md:w-[44px] h-auto mr-3 sm:mr-5 object-contain" },
      };

      items.forEach((item, idx) => {
        const li = document.createElement("li");
        li.className = "contents";
        const rowNum = idx + 1;

        const left = document.createElement("div");
        left.className =
          "col-start-1 relative flex items-center justify-end text-right text-[16px] md:text-[17px] tabular-nums";
        left.style.gridRowStart = String(rowNum);
        left.style.color = cardText;
        if (item.icon && iconMap[item.icon]) {
          const iconImg = document.createElement("img");
          iconImg.src = iconMap[item.icon].src;
          iconImg.alt = "";
          iconImg.setAttribute("aria-hidden", "true");
          iconImg.className = iconMap[item.icon].cls;
          left.appendChild(iconImg);
        }
        const timeSpan = document.createElement("span");
        timeSpan.textContent = item.time || "";
        left.appendChild(timeSpan);

        const dot = document.createElement("span");
        dot.className = "col-start-2 relative z-10 justify-self-center h-2.5 w-2.5 rounded-full";
        dot.style.gridRowStart = String(rowNum);
        dot.style.backgroundColor = cardText;

        const right = document.createElement("div");
        right.className = "col-start-3 text-left text-[13px] md:text-[15px]";
        right.style.gridRowStart = String(rowNum);
        right.style.color = hexToRgba(cardText, 0.72);
        right.textContent = item.label || "";

        li.append(left, dot, right);
        tlList.appendChild(li);
      });
    }

    // Gift Modal
    setText("gift-groom-title", tpl.gift.groom.title);
    setText("gift-groom-bank", tpl.gift.groom.bank);
    setText("gift-groom-acc", tpl.gift.groom.account);
    setText("gift-groom-holder", tpl.gift.groom.holder);
    const qrGroomImg = document.getElementById("gift-groom-qr");
    if (qrGroomImg) qrGroomImg.src = tpl.gift.groom.qrSrc;
    const qrGroomDl = document.getElementById("gift-groom-dl");
    if (qrGroomDl) {
      qrGroomDl.href = tpl.gift.groom.qrSrc;
      qrGroomDl.style.backgroundColor = hexToRgba(primary, 0.082);
      qrGroomDl.style.color = primary;
    }

    setText("gift-bride-title", tpl.gift.bride.title);
    setText("gift-bride-bank", tpl.gift.bride.bank);
    setText("gift-bride-acc", tpl.gift.bride.account);
    setText("gift-bride-holder", tpl.gift.bride.holder);
    const qrBrideImg = document.getElementById("gift-bride-qr");
    if (qrBrideImg) qrBrideImg.src = tpl.gift.bride.qrSrc;
    const qrBrideDl = document.getElementById("gift-bride-dl");
    if (qrBrideDl) {
      qrBrideDl.href = tpl.gift.bride.qrSrc;
      qrBrideDl.style.backgroundColor = hexToRgba(primary, 0.082);
      qrBrideDl.style.color = primary;
    }
  }

  applyThemeAndContent(activeTpl);

  /* ========================================================================
     1. Toast Notification Helper
     ======================================================================== */
  const toastContainer = document.getElementById("toast-container");

  function showToast(message, type = "success") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className =
      "toast-item pointer-events-auto flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg border border-gray-100";
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
     2. Intro Cover Overlay & Ambient Falling Blossoms
     ======================================================================== */
  const introOverlay = document.getElementById("intro-overlay");
  const blossomsWrap = document.getElementById("ambient-blossoms");
  const openInviteBtn = document.getElementById("open-invite-btn");
  const introSeal = document.getElementById("intro-seal");
  const introCardWrap = document.getElementById("intro-card-wrap");
  const bgMusic = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");
  const musicWrap = document.getElementById("music-player-wrap");

  let isMusicPlaying = false;

  function syncMusicUI() {
    if (!musicWrap || !musicBtn) return;
    if (isMusicPlaying) {
      musicWrap.classList.remove("music-paused");
      musicBtn.setAttribute("aria-label", "Tạm dừng nhạc");
    } else {
      musicWrap.classList.add("music-paused");
      musicBtn.setAttribute("aria-label", "Phát nhạc");
    }
  }

  function tryPlayMusic() {
    if (!bgMusic) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          syncMusicUI();
        })
        .catch(() => {
          isMusicPlaying = false;
          syncMusicUI();
        });
    }
  }

  syncMusicUI();

  if (musicBtn && bgMusic) {
    musicBtn.addEventListener("click", () => {
      if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        syncMusicUI();
      } else {
        tryPlayMusic();
      }
    });
  }

  function createBlossoms() {
    if (!blossomsWrap) return;
    const t = activeTpl.theme || {};
    const colors = [
      t.primary || "#0b3a72",
      t.primaryLight || "#3f6ea8",
      t.goldAccent || "#c9a24a",
      t.cardText || "#ece4d8",
    ];
    const blossomSvg =
      '<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">' +
      "<g>" +
      '<ellipse cx="12" cy="5" rx="2.2" ry="4.5"></ellipse>' +
      '<ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(60 12 12)"></ellipse>' +
      '<ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(120 12 12)"></ellipse>' +
      '<ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(180 12 12)"></ellipse>' +
      '<ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(240 12 12)"></ellipse>' +
      '<ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(300 12 12)"></ellipse>' +
      "</g>" +
      '<circle cx="12" cy="12" r="1.8" fill-opacity="0.45"></circle>' +
      "</svg>";

    for (let i = 0; i < 22; i++) {
      const el = document.createElement("div");
      el.className = "absolute top-0 pointer-events-none";
      const left = (Math.random() * 98).toFixed(2);
      const size = (11 + Math.random() * 13).toFixed(1);
      const duration = (18 + Math.random() * 7).toFixed(2);
      const delay = (Math.random() * 20).toFixed(2);
      const sway = ((Math.random() - 0.5) * 80).toFixed(1);
      const color = colors[i % colors.length];

      el.style.left = `${left}%`;
      el.style.fontSize = `${size}px`;
      el.style.color = color;
      el.style.setProperty("--sway", `${sway}px`);
      el.style.animation = `ambient-fall ${duration}s ease-in-out -${delay}s infinite`;
      el.innerHTML = blossomSvg;
      blossomsWrap.appendChild(el);
    }
  }

  function unlockAndHideIntro(immediate = false) {
    document.body.classList.remove("intro-locked");
    if (!introOverlay) return;
    if (immediate) {
      introOverlay.style.display = "none";
      return;
    }

    if (introSeal) {
      introSeal.classList.add("intro-seal-breaking");
    }

    const cardInner = introCardWrap ? introCardWrap.querySelector(".relative") : null;
    if (cardInner) {
      const ring = document.createElement("div");
      ring.className = "intro-seal-ring";
      cardInner.appendChild(ring);

      const t = activeTpl.theme || {};
      const particleColors = [
        t.cardText || "#ece4d8",
        t.goldAccent || "#c9a24a",
        t.primaryLight || "#3f6ea8",
        "#ffffff",
      ];
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.3;
        const dist = 60 + Math.random() * 90;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const p = document.createElement("span");
        p.className = "intro-particle";
        p.style.width = `${5 + Math.random() * 5}px`;
        p.style.height = p.style.width;
        p.style.borderRadius = i % 2 === 0 ? "9999px" : "2px";
        p.style.backgroundColor = particleColors[i % particleColors.length];
        p.style.setProperty("--dx", `${dx.toFixed(1)}px`);
        p.style.setProperty("--dy", `${dy.toFixed(1)}px`);
        p.style.setProperty("--rot-start", `${Math.round(Math.random() * 40)}deg`);
        p.style.setProperty("--rot-end", `${Math.round(120 + Math.random() * 200)}deg`);
        cardInner.appendChild(p);
      }
    }

    introOverlay.classList.add("intro-overlay-opening");
    tryPlayMusic();

    setTimeout(() => {
      introOverlay.style.display = "none";
    }, 1150);
  }

  if (urlParams.get("open") === "1") {
    unlockAndHideIntro(true);
  } else {
    createBlossoms();
  }

  if (openInviteBtn) {
    openInviteBtn.addEventListener("click", () => {
      unlockAndHideIntro(false);
    });
  }

  /* ========================================================================
     3. Subtle Scroll Parallax for Floral Decorations
     ======================================================================== */
  const parallaxFlowers = Array.from(document.querySelectorAll("[data-parallax-flower]"));
  let tickingParallax = false;

  function updateParallax() {
    tickingParallax = false;
    const vh = window.innerHeight || 800;
    for (const el of parallaxFlowers) {
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const dir = Number(el.getAttribute("data-parallax-flower")) || 1;
      const offset = Math.max(-28, Math.min(28, progress * 24 * dir));
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!tickingParallax) {
        tickingParallax = true;
        requestAnimationFrame(updateParallax);
      }
    },
    { passive: true }
  );
  updateParallax();

  /* ========================================================================
     4. 3D Photo Album Carousel & Fullscreen Lightbox
     ======================================================================== */
  const ALBUM_PHOTOS =
    activeTpl.photos && Array.isArray(activeTpl.photos.album) && activeTpl.photos.album.length > 0
      ? activeTpl.photos.album
      : window.DEFAULT_TEMPLATE.photos.album;

  const albumTrack = document.getElementById("album-track");
  const albumStage = document.getElementById("album-stage");
  const albumCounter = document.getElementById("album-counter");
  const albumPrevBtn = document.getElementById("album-prev-btn");
  const albumNextBtn = document.getElementById("album-next-btn");

  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxThumbs = document.getElementById("lightbox-thumbs");
  const lightboxCloseBtn = document.getElementById("lightbox-close-btn");
  const lightboxPrevBtn = document.getElementById("lightbox-prev-btn");
  const lightboxNextBtn = document.getElementById("lightbox-next-btn");

  let activeSlide = 0;
  let lightboxIndex = 0;
  let carouselTimer = null;

  function getCircularOffset(index, current, total) {
    let d = index - current;
    const half = Math.floor(total / 2);
    if (d > half) d -= total;
    if (d < -half) d += total;
    return d;
  }

  function renderCarousel() {
    if (!albumTrack) return;
    if (albumTrack.children.length === 0) {
      ALBUM_PHOTOS.forEach((photo, idx) => {
        const card = document.createElement("div");
        card.className =
          "absolute h-[92%] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all ease-in-out";
        card.style.transitionDuration = "1100ms";
        card.style.aspectRatio = photo.aspect || "0.66625 / 1";
        card.dataset.index = String(idx);

        const img = document.createElement("img");
        img.src = photo.src;
        img.alt = `Ảnh cưới ${idx + 1}`;
        img.className = "w-full h-full object-cover select-none";
        img.draggable = false;
        card.appendChild(img);

        card.addEventListener("click", () => {
          if (idx === activeSlide) {
            openLightbox(idx);
          } else {
            activeSlide = idx;
            renderCarousel();
            restartCarouselTimer();
          }
        });

        albumTrack.appendChild(card);
      });
    }

    const total = ALBUM_PHOTOS.length;
    Array.from(albumTrack.children).forEach((card, idx) => {
      const d = getCircularOffset(idx, activeSlide, total);
      const absD = Math.abs(d);
      const tx = d * 60;
      const tz = -absD * 150;
      const ry = d * 45;

      let scale = 0.7;
      let opacity = 0.3;
      if (absD === 0) {
        scale = 1;
        opacity = 1;
      } else if (absD === 1) {
        scale = 0.85;
        opacity = 0.75;
      } else if (absD === 2) {
        scale = 0.7;
        opacity = 0.5;
      }

      card.style.transform = `translateX(${tx}%) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.zIndex = String(100 - absD);
      card.classList.toggle("ring-2", d === 0);
      card.classList.toggle("ring-white/30", d === 0);
    });

    if (albumCounter) {
      albumCounter.textContent = `${activeSlide + 1} / ${total}`;
    }
  }

  function stepCarousel(delta) {
    const total = ALBUM_PHOTOS.length;
    activeSlide = (activeSlide + delta + total) % total;
    renderCarousel();
  }

  function restartCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
      if (!lightboxModal || !lightboxModal.open) {
        stepCarousel(1);
      }
    }, 4500);
  }

  if (albumPrevBtn) {
    albumPrevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      stepCarousel(-1);
      restartCarouselTimer();
    });
  }

  if (albumNextBtn) {
    albumNextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      stepCarousel(1);
      restartCarouselTimer();
    });
  }

  if (albumStage) {
    let touchStartX = 0;
    albumStage.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    albumStage.addEventListener(
      "touchend",
      (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 36) {
          stepCarousel(diff < 0 ? 1 : -1);
          restartCarouselTimer();
        }
      },
      { passive: true }
    );
  }

  renderCarousel();
  restartCarouselTimer();

  function renderLightbox() {
    if (!lightboxImg || !lightboxCounter || !lightboxThumbs) return;
    const total = ALBUM_PHOTOS.length;
    lightboxImg.src = ALBUM_PHOTOS[lightboxIndex].src;
    lightboxImg.alt = `Ảnh cưới ${lightboxIndex + 1}`;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${total}`;

    if (lightboxThumbs.children.length === 0) {
      ALBUM_PHOTOS.forEach((photo, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden cursor-pointer transition-all";
        const thumb = document.createElement("img");
        thumb.src = photo.src;
        thumb.alt = `Thu nhỏ ${idx + 1}`;
        thumb.className = "w-full h-full object-cover";
        btn.appendChild(thumb);
        btn.addEventListener("click", () => {
          lightboxIndex = idx;
          renderLightbox();
        });
        lightboxThumbs.appendChild(btn);
      });
    }

    const primaryColor = (activeTpl.theme && activeTpl.theme.primary) || "rgb(0, 34, 76)";
    Array.from(lightboxThumbs.children).forEach((btn, idx) => {
      const active = idx === lightboxIndex;
      btn.classList.toggle("scale-105", active);
      btn.classList.toggle("shadow-lg", active);
      btn.classList.toggle("opacity-60", !active);
      btn.style.outline = active ? `2px solid ${primaryColor}` : "none";
      btn.style.outlineOffset = active ? "2px" : "0px";
      if (active) {
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });
  }

  function openLightbox(idx) {
    if (!lightboxModal) return;
    lightboxIndex = idx;
    renderLightbox();
    if (!lightboxModal.open) {
      lightboxModal.showModal();
    }
  }

  if (lightboxCloseBtn && lightboxModal) {
    lightboxCloseBtn.addEventListener("click", () => lightboxModal.close());
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) lightboxModal.close();
    });
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener("click", () => {
      lightboxIndex = (lightboxIndex - 1 + ALBUM_PHOTOS.length) % ALBUM_PHOTOS.length;
      renderLightbox();
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener("click", () => {
      lightboxIndex = (lightboxIndex + 1) % ALBUM_PHOTOS.length;
      renderLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (lightboxModal && lightboxModal.open) {
      if (e.key === "ArrowLeft") {
        lightboxIndex = (lightboxIndex - 1 + ALBUM_PHOTOS.length) % ALBUM_PHOTOS.length;
        renderLightbox();
      } else if (e.key === "ArrowRight") {
        lightboxIndex = (lightboxIndex + 1) % ALBUM_PHOTOS.length;
        renderLightbox();
      }
    }
  });

  /* ========================================================================
     5. Live Countdown Timer
     ======================================================================== */
  const countdownEl = document.getElementById("countdown-display");
  const WEDDING_TIMESTAMP = new Date(
    (activeTpl.reception && activeTpl.reception.countdownIso) || "2026-12-19T18:30:00+07:00"
  ).getTime();

  function updateCountdown() {
    if (!countdownEl) return;
    const diff = WEDDING_TIMESTAMP - Date.now();
    if (Number.isNaN(diff) || diff <= 0) {
      countdownEl.textContent = "Đang diễn ra ngày chung đôi!";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    const pad = (n) => String(n).padStart(2, "0");
    countdownEl.textContent = `${days} ngày ${pad(hours)} giờ ${pad(mins)} phút ${pad(secs)} giây`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ========================================================================
     6. Optional Webhook Sync Helper
     ======================================================================== */
  function postToWebhook(payload) {
    const url = (activeTpl.webhookUrl || "").trim();
    if (!url) return;
    try {
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (_) {}
  }

  /* ========================================================================
     7. RSVP Modal (Conditional Guest Count Stepper & Local Persistence)
     ======================================================================== */
  const openRsvpBtn = document.getElementById("open-rsvp-btn");
  const rsvpModal = document.getElementById("rsvp-modal");
  const rsvpCloseBtn = document.getElementById("rsvp-close-btn");
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpNameInput = document.getElementById("rsvp-name");
  const rsvpNoteInput = document.getElementById("rsvp-note");
  const rsvpSubmitBtn = document.getElementById("rsvp-submit-btn");
  const rsvpGuestWrap = document.getElementById("rsvp-guest-count-wrap");
  const rsvpGuestCountEl = document.getElementById("rsvp-guest-count");
  const rsvpMinusBtn = document.getElementById("rsvp-minus-btn");
  const rsvpPlusBtn = document.getElementById("rsvp-plus-btn");
  const rsvpChoiceBtns = Array.from(document.querySelectorAll(".rsvp-choice-btn"));

  let rsvpChoice = "attending";
  let rsvpGuestCount = 1;

  function syncRsvpUI() {
    rsvpChoiceBtns.forEach((btn) => {
      const choice = btn.dataset.rsvpChoice;
      const isSelected = choice === rsvpChoice;
      const circle = btn.querySelector(".rsvp-choice-circle");
      const icon = circle.querySelector("svg");
      const label = btn.querySelector(".rsvp-choice-label");

      if (isSelected && choice === "attending") {
        btn.className =
          "rsvp-choice-btn flex items-center gap-3 py-2.5 px-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 text-left transition-all cursor-pointer";
        circle.className = "rsvp-choice-circle w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 shrink-0";
        icon.classList.remove("hidden");
        label.className = "rsvp-choice-label text-sm font-medium text-emerald-700";
      } else if (isSelected && choice === "declining") {
        btn.className =
          "rsvp-choice-btn flex items-center gap-3 py-2.5 px-3 rounded-xl border-2 border-[#00224c] bg-[#00224c0d] text-left transition-all cursor-pointer";
        circle.className = "rsvp-choice-circle w-5 h-5 rounded-full flex items-center justify-center bg-[#00224c] shrink-0";
        icon.classList.remove("hidden");
        label.className = "rsvp-choice-label text-sm font-medium text-[#00224c]";
      } else {
        btn.className =
          "rsvp-choice-btn flex items-center gap-3 py-2.5 px-3 rounded-xl border-2 border-gray-200 bg-white text-left transition-all cursor-pointer hover:border-gray-300";
        circle.className = "rsvp-choice-circle w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0";
        icon.classList.add("hidden");
        label.className = "rsvp-choice-label text-sm font-medium text-gray-700";
      }
    });

    if (rsvpGuestWrap) {
      rsvpGuestWrap.classList.toggle("hidden", rsvpChoice !== "attending");
    }
    if (rsvpGuestCountEl) {
      rsvpGuestCountEl.textContent = String(rsvpGuestCount);
    }
    if (rsvpSubmitBtn && rsvpNameInput) {
      rsvpSubmitBtn.disabled = rsvpNameInput.value.trim().length === 0;
    }
  }

  rsvpChoiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      rsvpChoice = btn.dataset.rsvpChoice || "attending";
      syncRsvpUI();
    });
  });

  if (rsvpNameInput) {
    rsvpNameInput.addEventListener("input", syncRsvpUI);
  }

  if (rsvpMinusBtn) {
    rsvpMinusBtn.addEventListener("click", () => {
      rsvpGuestCount = Math.max(1, rsvpGuestCount - 1);
      syncRsvpUI();
    });
  }

  if (rsvpPlusBtn) {
    rsvpPlusBtn.addEventListener("click", () => {
      rsvpGuestCount = Math.min(20, rsvpGuestCount + 1);
      syncRsvpUI();
    });
  }

  function closeRsvpModal() {
    if (rsvpModal && rsvpModal.open) rsvpModal.close();
  }

  if (openRsvpBtn && rsvpModal) {
    openRsvpBtn.addEventListener("click", () => {
      syncRsvpUI();
      if (!rsvpModal.open) rsvpModal.showModal();
    });
  }

  if (rsvpCloseBtn) {
    rsvpCloseBtn.addEventListener("click", closeRsvpModal);
  }

  if (rsvpModal) {
    rsvpModal.addEventListener("click", (e) => {
      if (e.target === rsvpModal) closeRsvpModal();
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = rsvpNameInput ? rsvpNameInput.value.trim() : "";
      if (!name) return;

      const record = {
        id: String(Date.now()),
        templateId: activeTpl.id,
        name,
        status: rsvpChoice,
        guests: rsvpChoice === "attending" ? rsvpGuestCount : 0,
        note: rsvpNoteInput ? rsvpNoteInput.value.trim() : "",
        createdAt: new Date().toISOString(),
      };

      try {
        const list = JSON.parse(localStorage.getItem("wedding_rsvps") || "[]");
        list.unshift(record);
        localStorage.setItem("wedding_rsvps", JSON.stringify(list));
      } catch (_) {}

      postToWebhook({ type: "rsvp", ...record });

      closeRsvpModal();
      rsvpForm.reset();
      rsvpChoice = "attending";
      rsvpGuestCount = 1;
      syncRsvpUI();
      showToast(
        record.status === "attending"
          ? `Cảm ơn ${name} đã xác nhận tham dự (${record.guests} khách)!`
          : `Cảm ơn ${name} đã gửi phản hồi đến hai vợ chồng!`
      );
    });
  }

  /* ========================================================================
     8. Guestbook Wishes & AI Wish Generator Modal
     ======================================================================== */
  const DEFAULT_WISHES = [
    { name: "Chị Hai và các cháu", time: "16:00:00 16/5/2027", message: "Mừng đám cưới. Hôm nào rảnh ghé nhà chơi nhé." },
    { name: "Anh Ba ngoài Hà Nội", time: "17:00:00 17/5/2027", message: "Chúc cô dâu chú rể mãi mặn nồng." },
    { name: "Gia đình thông gia", time: "18:00:00 18/5/2027", message: "Mong hai bạn vượt qua mọi chuyện cùng nhau." },
    { name: "Thầy cô trường cũ", time: "19:00:00 19/5/2027", message: "Chúc hai đứa sớm có tin vui." },
    { name: "Bạn bè đại học", time: "20:00:00 20/5/2027", message: "Ảnh chụp nhiều lắm, mai mốt gửi hết cho hai bạn nhé." },
    { name: "Gia đình bác Hoàng", time: "21:00:00 21/5/2027", message: "Chúc hai bạn giữ được sự kiên nhẫn dành cho nhau." },
    { name: "Gia đình cô Lan", time: "22:00:00 22/5/2027", message: "Mừng hạnh phúc trăm năm, vạn sự như ý." },
    { name: "Cô Bảy", time: "23:00:00 23/5/2027", message: "Nhà mới, chuyện mới, mong toàn chuyện lành." },
    { name: "Chú Tư", time: "0:00:00 25/5/2027", message: "Chúc hai em luôn nhìn nhau như hôm nay." },
    { name: "Bà ngoại", time: "1:00:00 26/5/2027", message: "Cảm ơn bữa tiệc thật chu đáo. Chúc mừng hai bạn." },
  ];

  const AI_WISH_POOL = [
    "Hy vọng rằng mỗi ngày của hai bạn đều là một ngày đáng nhớ và hạnh phúc.",
    "Hy vọng hai bạn luôn tìm thấy bình yên và hạnh phúc trong vòng tay của nhau.",
    "Hy vọng tình yêu của hai bạn ngày càng nở rộ và bền lâu.",
    "Mong rằng tổ ấm mới của hai bạn sẽ luôn đong đầy niềm vui và tiếng cười.",
    "Chúc cho cuộc sống hôn nhân của hai bạn luôn hòa hợp và bền chặt.",
    "Hy vọng rằng mỗi sáng thức dậy, hai bạn đều mỉm cười vì có nhau trong đời.",
    "Mong rằng cuộc sống hôn nhân sẽ là hành trình tuyệt vời nhất của hai bạn.",
    "Chúc đôi bạn trẻ mãi gắn bó, yêu thương và sẻ chia với nhau mọi điều trong cuộc sống.",
    "Chúc hôn nhân của hai bạn là câu chuyện cổ tích đẹp đẽ kéo dài mãi mãi.",
    "Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long và luôn giữ trọn ngọn lửa yêu thương.",
    "Mừng ngày trọng đại! Chúc cô dâu chú rể luôn đồng lòng, thấu hiểu và ngập tràn tiếng cười.",
    "Chúc cho hành trình mới của hai bạn lúc nào cũng rực rỡ nắng ấm và bình an.",
    "Mong rằng từng khoảnh khắc bên nhau của hai bạn đều ngọt ngào như ngày hôm nay.",
    "Chúc hai bạn xây dựng một mái ấm thật viên mãn, sung túc và bình yên.",
    `Gửi ngàn lời chúc tốt đẹp nhất tới ${activeTpl.couple.groomShort} và ${activeTpl.couple.brideShort} trong ngày chung đôi!`,
  ];

  const wishesListEl = document.getElementById("wishes-list");
  const guestbookForm = document.getElementById("guestbook-form");
  const wishNameInput = document.getElementById("wish-name-input");
  const wishMessageInput = document.getElementById("wish-message-input");

  const openAiWishBtn = document.getElementById("open-ai-wish-btn");
  const aiWishModal = document.getElementById("ai-wish-modal");
  const aiWishListEl = document.getElementById("ai-wish-list");
  const aiWishRegenBtn = document.getElementById("ai-wish-regen-btn");
  const aiWishCloseBtn = document.getElementById("ai-wish-close-btn");
  const aiWishCloseX = document.getElementById("ai-wish-close-x");

  function loadWishes() {
    try {
      const saved = JSON.parse(localStorage.getItem("wedding_wishes") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        return [...saved, ...DEFAULT_WISHES];
      }
    } catch (_) {}
    return DEFAULT_WISHES;
  }

  function formatViTimestamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getHours()}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  function renderWishes() {
    if (!wishesListEl) return;
    const primaryColor = (activeTpl.theme && activeTpl.theme.primary) || "#00224c";
    const wishes = loadWishes();
    wishesListEl.innerHTML = "";
    for (const item of wishes) {
      const card = document.createElement("div");
      card.className = "rounded-[8px] border p-4 text-sm";
      card.style.borderColor = hexToRgba(primaryColor, 0.2);
      card.style.backgroundColor = hexToRgba(primaryColor, 0.03);
      card.style.color = primaryColor;

      const header = document.createElement("div");
      header.className = "flex flex-wrap items-baseline justify-between gap-2 mb-1.5";

      const nameEl = document.createElement("span");
      nameEl.className = "font-semibold";
      nameEl.textContent = item.name;

      const timeEl = document.createElement("span");
      timeEl.className = "text-[11px] opacity-55 tabular-nums";
      timeEl.textContent = item.time;

      header.appendChild(nameEl);
      header.appendChild(timeEl);

      const msgEl = document.createElement("p");
      msgEl.className = "leading-relaxed opacity-90";
      msgEl.textContent = item.message;

      card.appendChild(header);
      card.appendChild(msgEl);
      wishesListEl.appendChild(card);
    }
  }

  renderWishes();

  if (guestbookForm) {
    guestbookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = wishNameInput ? wishNameInput.value.trim() : "";
      const message = wishMessageInput ? wishMessageInput.value.trim() : "";
      if (!name || !message) return;

      const newWish = {
        id: String(Date.now()),
        templateId: activeTpl.id,
        name,
        message,
        time: formatViTimestamp(new Date()),
      };

      try {
        const saved = JSON.parse(localStorage.getItem("wedding_wishes") || "[]");
        saved.unshift(newWish);
        localStorage.setItem("wedding_wishes", JSON.stringify(saved));
      } catch (_) {}

      postToWebhook({ type: "wish", ...newWish });

      guestbookForm.reset();
      renderWishes();
      showToast("Đã gửi lời chúc mừng đến cô dâu chú rể!");
    });
  }

  function renderAiSuggestions() {
    if (!aiWishListEl) return;
    const shuffled = [...AI_WISH_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
    aiWishListEl.innerHTML = "";
    for (const wish of shuffled) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "w-full text-left p-4 border border-gray-200 rounded-lg text-sm text-gray-800 hover:border-pink-500 hover:bg-pink-50 transition-all cursor-pointer";
      btn.textContent = wish;
      btn.addEventListener("click", () => {
        if (wishMessageInput) {
          wishMessageInput.value = wish;
          wishMessageInput.focus();
        }
        closeAiWishModal();
      });
      aiWishListEl.appendChild(btn);
    }
  }

  function closeAiWishModal() {
    if (aiWishModal && aiWishModal.open) aiWishModal.close();
  }

  if (openAiWishBtn && aiWishModal) {
    openAiWishBtn.addEventListener("click", () => {
      renderAiSuggestions();
      if (!aiWishModal.open) aiWishModal.showModal();
    });
  }

  if (aiWishRegenBtn) {
    aiWishRegenBtn.addEventListener("click", renderAiSuggestions);
  }
  if (aiWishCloseBtn) {
    aiWishCloseBtn.addEventListener("click", closeAiWishModal);
  }
  if (aiWishCloseX) {
    aiWishCloseX.addEventListener("click", closeAiWishModal);
  }
  if (aiWishModal) {
    aiWishModal.addEventListener("click", (e) => {
      if (e.target === aiWishModal) closeAiWishModal();
    });
  }

  /* ========================================================================
     9. Wedding Gift Box Modal
     ======================================================================== */
  const openGiftBtn = document.getElementById("open-gift-btn");
  const giftModal = document.getElementById("gift-modal");
  const giftCloseBtn = document.getElementById("gift-close-btn");

  if (openGiftBtn && giftModal) {
    openGiftBtn.addEventListener("click", () => {
      if (!giftModal.open) giftModal.showModal();
    });
  }

  if (giftCloseBtn && giftModal) {
    giftCloseBtn.addEventListener("click", () => giftModal.close());
    giftModal.addEventListener("click", (e) => {
      if (e.target === giftModal) giftModal.close();
    });
  }
})();
