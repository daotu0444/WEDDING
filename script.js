(() => {
  "use strict";

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

  // Initialize music UI as paused until user clicks "Mở thiệp" or toggles button
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
    const colors = ["#0b3a72", "#3f6ea8", "#c9a24a", "#ece4d8"];
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

    // Seal break + ring + particle burst
    if (introSeal) {
      introSeal.classList.add("intro-seal-breaking");
    }

    const cardInner = introCardWrap ? introCardWrap.querySelector(".relative") : null;
    if (cardInner) {
      const ring = document.createElement("div");
      ring.className = "intro-seal-ring";
      cardInner.appendChild(ring);

      const particleColors = ["#ece4d8", "#c9a24a", "#3f6ea8", "#ffffff"];
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

  const urlParams = new URLSearchParams(window.location.search);
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
  const ALBUM_PHOTOS = [
    { src: "./assets/images/photos/album-1.webp", aspect: "0.66625 / 1" },
    { src: "./assets/images/photos/album-2.webp", aspect: "0.66625 / 1" },
    { src: "./assets/images/photos/album-3.webp", aspect: "0.66625 / 1" },
    { src: "./assets/images/photos/album-4.webp", aspect: "0.749086 / 1" },
    { src: "./assets/images/photos/album-5.webp", aspect: "1.2 / 1" },
    { src: "./assets/images/photos/album-6.webp", aspect: "0.747991 / 1" },
    { src: "./assets/images/photos/album-7.webp", aspect: "0.66625 / 1" },
    { src: "./assets/images/photos/album-8.webp", aspect: "0.66625 / 1" },
    { src: "./assets/images/photos/album-9.webp", aspect: "0.66625 / 1" },
  ];

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
        card.style.aspectRatio = photo.aspect;
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

  // Touch swipe on carousel
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

    Array.from(lightboxThumbs.children).forEach((btn, idx) => {
      const active = idx === lightboxIndex;
      btn.classList.toggle("scale-105", active);
      btn.classList.toggle("shadow-lg", active);
      btn.classList.toggle("opacity-60", !active);
      btn.style.outline = active ? "2px solid rgb(0, 34, 76)" : "none";
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
     5. Live Countdown Timer (Target: 2026-12-19 18:30:00 +07:00)
     ======================================================================== */
  const countdownEl = document.getElementById("countdown-display");
  const WEDDING_TIMESTAMP = new Date("2026-12-19T18:30:00+07:00").getTime();

  function updateCountdown() {
    if (!countdownEl) return;
    const diff = WEDDING_TIMESTAMP - Date.now();
    if (diff <= 0) {
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
     6. RSVP Modal (Conditional Guest Count Stepper & Local Persistence)
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
     7. Guestbook Wishes & AI Wish Generator Modal
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
    "Gửi ngàn lời chúc tốt đẹp nhất tới Tuấn Kiệt và Minh Anh trong ngày chung đôi!",
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
    const wishes = loadWishes();
    wishesListEl.innerHTML = "";
    for (const item of wishes) {
      const card = document.createElement("div");
      card.className = "rounded-[8px] border p-4 text-sm";
      card.style.borderColor = "rgba(0, 34, 76, 0.2)";
      card.style.backgroundColor = "rgba(0, 34, 76, 0.03)";
      card.style.color = "#00224c";

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
        name,
        message,
        time: formatViTimestamp(new Date()),
      };

      try {
        const saved = JSON.parse(localStorage.getItem("wedding_wishes") || "[]");
        saved.unshift(newWish);
        localStorage.setItem("wedding_wishes", JSON.stringify(saved));
      } catch (_) {}

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
     8. Wedding Gift Box Modal
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
