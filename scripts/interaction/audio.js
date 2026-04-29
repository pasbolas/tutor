(() => {
  if (window.__tutorInteractionAudioInitialized) {
    return;
  }

  window.__tutorInteractionAudioInitialized = true;

  const profile = window.__tutorPerformanceProfile || {
    hoverCapable: window.matchMedia("(hover: hover)").matches,
    coarsePointer: window.matchMedia("(hover: none), (pointer: coarse)").matches,
    smallViewport: window.matchMedia("(max-width: 980px)").matches,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const supportsHover = profile.hoverCapable;
  const hideSoundToggleOnMobile = profile.coarsePointer || window.matchMedia("(max-width: 720px)").matches;
  const hideScrollInstrumentOnMobile = profile.coarsePointer || profile.smallViewport;
  const prefersReducedMotion = profile.prefersReducedMotion;
  const SOUND_STORAGE_KEY = "tutor-interaction-sound-muted";
  const VOLUME_STORAGE_KEY = "tutor-interaction-sound-volume";
  const DEFAULT_VOLUME = 1;
  const MAX_MASTER_GAIN = 3.1;
  const SCROLL_TICK_SPACING_PX = 42;
  const MAX_SCROLL_TICKS_PER_FRAME = 6;
  const state = {
    ctx: null,
    masterGain: null,
    dragSource: null,
    dragGain: null,
    dragFilter: null,
    dragPan: null,
    dragStarted: false,
    scrollSource: null,
    scrollGain: null,
    scrollFilter: null,
    scrollShaper: null,
    scrollDetailSource: null,
    scrollDetailGain: null,
    scrollDetailFilter: null,
    scrollStarted: false,
    unlocked: false,
    muted: false,
    volume: DEFAULT_VOLUME,
    soundControl: null,
    soundToggle: null,
    soundToggleLabel: null,
    volumeSlider: null,
    volumeValue: null,
    lastHoverControl: null,
    lastFeedbackControl: null,
    lastFeedbackTime: 0,
    lastPointerControl: null,
    lastPointerTime: 0,
    lastMoveX: 0,
    lastMoveY: 0,
    lastMoveAt: 0,
    smoothedSpeed: 0,
    idleTimer: 0,
    dragSoundRaf: 0,
    pendingDragSpeed: 0,
    pendingDragX: 0,
    lastScrollY: window.scrollY || window.pageYOffset || 0,
    lastScrollAt: 0,
    scrollTickCarry: 0,
    scrollIdleTimer: 0,
    pendingScrollDelta: 0,
    scrollPendingSpeed: 0,
    scrollPendingDirection: 1,
    scrollDrift: 0,
    scrollRaf: 0,
    continuousListenersBound: false,
    handleMouseMove: null,
    handleMouseLeave: null,
    handleScroll: null,
    scrollInstrumentRoot: null,
    scrollInstrumentTicks: [],
    scrollInstrumentMarker: null,
    scrollInstrumentSections: [],
    scrollInstrumentTarget: 0,
    scrollInstrumentCurrent: 0,
    scrollInstrumentActiveIndex: -1,
    scrollInstrumentPulse: 0,
    scrollInstrumentRaf: 0,
    scrollInstrumentTop: 0,
    scrollInstrumentPitch: 0,
    scrollInstrumentTitleWidth: 0,
    scrollInstrumentTitlePresence: 0,
    scrollInstrumentMarkerWidth: 18,
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getNow = () => (window.performance && typeof window.performance.now === "function"
    ? window.performance.now()
    : Date.now());

  try {
    state.muted = window.localStorage.getItem(SOUND_STORAGE_KEY) === "1";
  } catch {
    state.muted = false;
  }

  try {
    const storedVolume = Number.parseFloat(window.localStorage.getItem(VOLUME_STORAGE_KEY) || "");
    if (Number.isFinite(storedVolume)) {
      state.volume = clamp(storedVolume, 0.15, 1);
    }
  } catch {
    state.volume = DEFAULT_VOLUME;
  }

  const getControl = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest("a[href], button, [role='button'], [role='radio'], [aria-pressed], [aria-checked]");
  };

  const isToggleControl = (control) => {
    if (!control) {
      return false;
    }

    return (
      control.matches("[role='radio'], [aria-pressed], [aria-checked]") ||
      control.hasAttribute("data-sound-toggle") ||
      control.hasAttribute("data-hackathons-mode") ||
      control.closest("[data-hackathons-toggle]")
    );
  };

  const getSoundState = () => {
    if (!AudioContextClass) {
      return "unsupported";
    }

    if (!state.unlocked) {
      return "locked";
    }

    return state.muted ? "off" : "on";
  };

  const updateSoundToggleUI = () => {
    if (!state.soundToggle || !state.soundToggleLabel || !state.soundControl) {
      return;
    }

    const soundState = getSoundState();
    let label = "Sound off";

    if (soundState === "unsupported") {
      label = "Sound unavailable";
      state.soundToggle.disabled = true;
    } else if (soundState === "off" || soundState === "locked") {
      label = "Sound off";
      state.soundToggle.disabled = false;
    } else if (soundState === "on") {
      label = "Sound on";
      state.soundToggle.disabled = false;
    } else {
      state.soundToggle.disabled = false;
    }

    state.soundControl.dataset.state = soundState;
    state.soundToggle.dataset.state = soundState;
    state.soundToggle.setAttribute("aria-label", label);
    state.soundToggle.setAttribute("aria-pressed", soundState === "on" ? "true" : "false");
    state.soundToggleLabel.textContent = label;

    if (state.volumeSlider) {
      state.volumeSlider.value = String(Math.round(state.volume * 100));
      state.volumeSlider.disabled = soundState !== "on";
    }

    if (state.volumeValue) {
      state.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;
    }
  };

  const syncMasterGain = () => {
    if (!state.masterGain || !state.ctx) {
      return;
    }

    const target = state.muted ? 0.0001 : Math.max(0.0001, state.volume * MAX_MASTER_GAIN);
    state.masterGain.gain.setTargetAtTime(target, state.ctx.currentTime, 0.04);
  };

  const setMuted = (nextMuted) => {
    state.muted = nextMuted;

    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, nextMuted ? "1" : "0");
    } catch {
      // Ignore storage failures and continue with in-memory state.
    }

    syncMasterGain();
    updateSoundToggleUI();
  };

  const setVolume = (nextVolume) => {
    state.volume = clamp(nextVolume, 0.15, 1);

    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(state.volume));
    } catch {
      // Ignore storage failures and continue with in-memory state.
    }

    syncMasterGain();
    updateSoundToggleUI();
  };

  const collectScrollInstrumentSections = () => {
    const studySections = Array.from(document.querySelectorAll("[data-study-section]"));
    const candidates = studySections.length
      ? studySections
      : Array.from(document.querySelectorAll("main .panel[id], section[id]"));
    const unique = new Set();

    return candidates.filter((section) => {
      if (!section.id || unique.has(section.id)) {
        return false;
      }

      unique.add(section.id);
      return true;
    });
  };

  const getSectionTitle = (section) => {
    if (!section) {
      return "";
    }

    const heading = section.querySelector(
      ".study-markdown__section-header h2, .notes-minimal__header h1, h2, h1"
    );

    return heading ? heading.textContent.trim() : "";
  };

  const updateScrollInstrumentTitleState = () => {
    if (!state.scrollInstrumentSections.length) {
      state.scrollInstrumentTitleWidth = 0;
      state.scrollInstrumentTitlePresence = 0;
      state.scrollInstrumentMarkerWidth = 18;
      return;
    }

    const anchorY = window.innerHeight * 0.34;
    let bestSection = null;
    let bestScore = Number.POSITIVE_INFINITY;

    state.scrollInstrumentSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const heading = section.querySelector(".study-markdown__section-header h2, h2, h1");
      const titleRect = heading ? heading.getBoundingClientRect() : rect;
      const sectionInView = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.08;

      if (!sectionInView) {
        return;
      }

      const score = Math.abs(Math.min(Math.max(titleRect.top, 0), window.innerHeight) - anchorY);
      if (score < bestScore) {
        bestScore = score;
        bestSection = section;
      }
    });

    if (!bestSection) {
      state.scrollInstrumentTitleWidth = 0;
      state.scrollInstrumentTitlePresence = 0;
      state.scrollInstrumentMarkerWidth = 18;
      return;
    }

    const title = getSectionTitle(bestSection);
    const heading = bestSection.querySelector(".study-markdown__section-header h2, h2, h1");
    const titleRect = heading ? heading.getBoundingClientRect() : bestSection.getBoundingClientRect();
    const distance = Math.abs(titleRect.top - anchorY);
    const presence = clamp(1 - (distance / Math.max(180, window.innerHeight * 0.42)), 0.18, 1);
    const titleWidth = clamp(title.length * 0.52, 12, 34);

    state.scrollInstrumentTitleWidth = titleWidth;
    state.scrollInstrumentTitlePresence = presence;
    state.scrollInstrumentMarkerWidth = 18 + titleWidth * presence;
    state.scrollInstrumentMarker.dataset.title = title;
  };

  const getScrollProgress = () => {
    const maxScrollable = Math.max(
      1,
      (document.documentElement.scrollHeight || 0) - window.innerHeight
    );

    return clamp((window.scrollY || window.pageYOffset || 0) / maxScrollable, 0, 1);
  };

  const measureScrollInstrument = () => {
    if (!state.scrollInstrumentMarker || state.scrollInstrumentTicks.length < 2) {
      return;
    }

    state.scrollInstrumentTop = state.scrollInstrumentTicks[0].offsetTop;
    state.scrollInstrumentPitch = state.scrollInstrumentTicks[1].offsetTop - state.scrollInstrumentTicks[0].offsetTop;
  };

  const updateScrollInstrumentTarget = () => {
    if (!state.scrollInstrumentTicks.length) {
      return;
    }

    const maxIndex = state.scrollInstrumentTicks.length - 1;
    state.scrollInstrumentTarget = getScrollProgress() * maxIndex;
  };

  const pulseScrollInstrument = (intensity = 0.5) => {
    if (!state.scrollInstrumentMarker) {
      return;
    }

    const nextPulse = 0.24 + clamp(intensity, 0.2, 1) * 0.72;
    state.scrollInstrumentPulse = Math.max(state.scrollInstrumentPulse, nextPulse);
    scheduleScrollInstrumentRender();
  };

  const scheduleScrollInstrumentRender = () => {
    if (state.scrollInstrumentRaf || !state.scrollInstrumentMarker || !state.scrollInstrumentTicks.length) {
      return;
    }

    state.scrollInstrumentRaf = window.requestAnimationFrame(renderScrollInstrument);
  };

  const renderScrollInstrument = () => {
    state.scrollInstrumentRaf = 0;

    if (!state.scrollInstrumentMarker || !state.scrollInstrumentTicks.length) {
      return;
    }

    const delta = state.scrollInstrumentTarget - state.scrollInstrumentCurrent;
    if (prefersReducedMotion) {
      state.scrollInstrumentCurrent = state.scrollInstrumentTarget;
    } else {
      state.scrollInstrumentCurrent += delta * 0.2;
    }

    if (Math.abs(delta) < 0.0008) {
      state.scrollInstrumentCurrent = state.scrollInstrumentTarget;
    }

    const markerY = state.scrollInstrumentTop + state.scrollInstrumentCurrent * state.scrollInstrumentPitch;
    state.scrollInstrumentMarker.style.transform = `translate(-50%, ${markerY}px)`;
    state.scrollInstrumentMarker.style.setProperty(
      "--instrument-marker-width",
      `${state.scrollInstrumentMarkerWidth}px`
    );

    const activeIndex = Math.round(state.scrollInstrumentCurrent);
    if (activeIndex !== state.scrollInstrumentActiveIndex) {
      if (state.scrollInstrumentTicks[state.scrollInstrumentActiveIndex]) {
        state.scrollInstrumentTicks[state.scrollInstrumentActiveIndex].classList.remove("is-active");
      }

      if (state.scrollInstrumentTicks[activeIndex]) {
        state.scrollInstrumentTicks[activeIndex].classList.add("is-active");
      }

      state.scrollInstrumentActiveIndex = activeIndex;
    }

    state.scrollInstrumentPulse = Math.max(0, state.scrollInstrumentPulse * 0.86 - 0.008);
    state.scrollInstrumentMarker.style.setProperty("--instrument-pulse", String(state.scrollInstrumentPulse));

    if (Math.abs(delta) > 0.0008 || state.scrollInstrumentPulse > 0.014) {
      scheduleScrollInstrumentRender();
    }
  };

  const createScrollInstrument = () => {
    if (hideScrollInstrumentOnMobile || state.scrollInstrumentRoot || document.querySelector(".tutor-dashboard")) {
      return;
    }

    const root = document.createElement("nav");
    root.className = "site-scroll-instrument";
    root.setAttribute("aria-label", "Scroll progress");

    const ticksWrap = document.createElement("div");
    ticksWrap.className = "site-scroll-instrument__ticks";

    const marker = document.createElement("div");
    marker.className = "site-scroll-instrument__marker";
    marker.setAttribute("aria-hidden", "true");

    const tickCount = Math.max(14, Math.min(22, Math.round(window.innerHeight / 52)));
    const ticks = [];

    for (let index = 0; index < tickCount; index += 1) {
      const tick = document.createElement("button");
      tick.type = "button";
      tick.className = "site-scroll-instrument__tick";
      tick.setAttribute("aria-label", `Jump to ${Math.round((index / Math.max(1, tickCount - 1)) * 100)}%`);

      tick.addEventListener("click", () => {
        const ratio = index / Math.max(1, tickCount - 1);
        const sections = state.scrollInstrumentSections;

        if (sections.length > 1) {
          const sectionIndex = Math.round(ratio * (sections.length - 1));
          sections[sectionIndex].scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        const maxScrollable = Math.max(
          0,
          (document.documentElement.scrollHeight || 0) - window.innerHeight
        );
        window.scrollTo({ top: maxScrollable * ratio, behavior: "smooth" });
      });

      ticks.push(tick);
      ticksWrap.appendChild(tick);
    }

    ticksWrap.appendChild(marker);
    root.append(ticksWrap);
    document.body.appendChild(root);

    state.scrollInstrumentRoot = root;
    state.scrollInstrumentTicks = ticks;
    state.scrollInstrumentMarker = marker;
    state.scrollInstrumentSections = collectScrollInstrumentSections();

    let syncRaf = 0;

    const syncInstrument = () => {
      syncRaf = 0;
      state.scrollInstrumentSections = collectScrollInstrumentSections();
      measureScrollInstrument();
      updateScrollInstrumentTarget();
      updateScrollInstrumentTitleState();
      scheduleScrollInstrumentRender();
    };

    const requestSync = () => {
      if (syncRaf) {
        return;
      }

      syncRaf = window.requestAnimationFrame(syncInstrument);
    };

    window.addEventListener("resize", requestSync, { passive: true });
    window.addEventListener("scroll", requestSync, { passive: true });

    measureScrollInstrument();
    updateScrollInstrumentTarget();
    updateScrollInstrumentTitleState();
    state.scrollInstrumentCurrent = state.scrollInstrumentTarget;
    scheduleScrollInstrumentRender();
  };

  const forceMutedForNavigation = () => {
    setMuted(true);
    state.lastHoverControl = null;
    state.lastFeedbackControl = null;
    fadeDragSound();
    fadeScrollSound();

    if (state.soundControl) {
      state.soundControl.classList.remove("is-panel-open");
    }
  };

  window.__tutorInteractionAudio = {
    forceMutedForNavigation,
  };

  const createSoundToggle = () => {
    if (hideSoundToggleOnMobile) {
      return;
    }

    if (state.soundControl) {
      return;
    }

    const control = document.createElement("div");
    control.className = "site-sound-control";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "site-sound-toggle";
    button.setAttribute("data-sound-toggle", "true");

    const dot = document.createElement("span");
    dot.className = "site-sound-toggle__dot";
    dot.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "site-sound-toggle__label";

    const panel = document.createElement("div");
    panel.className = "site-sound-panel";

    const panelRow = document.createElement("div");
    panelRow.className = "site-sound-panel__row";

    const panelLabel = document.createElement("span");
    panelLabel.className = "site-sound-panel__label";
    panelLabel.textContent = "Volume";

    const panelValue = document.createElement("span");
    panelValue.className = "site-sound-panel__value";

    const slider = document.createElement("input");
    slider.className = "site-sound-panel__slider";
    slider.type = "range";
    slider.min = "15";
    slider.max = "100";
    slider.step = "1";

    const hint = document.createElement("p");
    hint.className = "site-sound-panel__hint";
    hint.textContent = "Hover here to adjust sound level";

    panelRow.append(panelLabel, panelValue);
    panel.append(panelRow, slider, hint);
    button.append(dot, label);
    control.append(button, panel);

    const sidebarSoundHost = document.querySelector("[data-sidebar-sound-host]");
    const host = sidebarSoundHost
      || document.querySelector(".topbar__group--right")
      || document.querySelector(".study-topbar__nav")
      || document.querySelector(".project-topbar__links")
      || document.querySelector(".hackathon-topbar__nav");

    if (host) {
      if (sidebarSoundHost) {
        host.appendChild(control);
      } else {
        host.prepend(control);
      }
    } else {
      document.body.appendChild(control);
    }

    state.soundControl = control;
    state.soundToggle = button;
    state.soundToggleLabel = label;
    state.volumeSlider = slider;
    state.volumeValue = panelValue;
    updateSoundToggleUI();

    const openPanel = () => {
      if (getSoundState() !== "on") {
        control.classList.remove("is-panel-open");
        return;
      }

      control.classList.add("is-panel-open");
    };

    const closePanel = () => {
      control.classList.remove("is-panel-open");
    };

    slider.addEventListener("input", () => {
      const nextVolume = Number(slider.value) / 100;
      setVolume(nextVolume);
    });

    control.addEventListener("pointerenter", openPanel);
    control.addEventListener("pointerleave", closePanel);
    control.addEventListener("mouseleave", closePanel);
    control.addEventListener("focusin", openPanel);
    control.addEventListener("focusout", (event) => {
      if (control.contains(event.relatedTarget)) {
        return;
      }

      closePanel();
    });

    control.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
        button.focus();
      }
    });

    if (!supportsHover) {
      button.addEventListener("click", () => {
        if (getSoundState() === "on") {
          control.classList.toggle("is-panel-open");
        } else {
          closePanel();
        }
      });

      document.addEventListener("click", (event) => {
        if (!control.contains(event.target)) {
          closePanel();
        }
      });
    }

    window.addEventListener("blur", closePanel);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        closePanel();
      }
    });

    button.addEventListener("click", async () => {
      if (!AudioContextClass) {
        return;
      }

      const wasLocked = !state.unlocked;
      const wasMuted = state.muted;
      const context = await ensureAudio();

      if (!context) {
        return;
      }

      if (wasLocked || wasMuted) {
        setMuted(false);
        playToggleSound();
        if (!supportsHover) {
          openPanel();
        }
        return;
      }

      setMuted(true);
      closePanel();
    });
  };

  const createNoiseBuffer = (context) => {
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < channel.length; i += 1) {
      channel[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  const createSoftClipCurve = (samples = 128, drive = 1.35) => {
    const curve = new Float32Array(samples);

    for (let index = 0; index < samples; index += 1) {
      const x = (index / (samples - 1)) * 2 - 1;
      curve[index] = Math.tanh(x * drive);
    }

    return curve;
  };

  const pulseElement = (element) => {
    if (!element) {
      return;
    }

    element.classList.remove("interactive-clicking");
    void element.offsetWidth;
    element.classList.add("interactive-clicking");

    window.setTimeout(() => {
      element.classList.remove("interactive-clicking");
    }, 280);
  };

  const createMasterGain = (context) => {
    const gainNode = context.createGain();
    gainNode.gain.value = state.muted ? 0.0001 : Math.max(0.0001, state.volume * MAX_MASTER_GAIN);
    gainNode.connect(context.destination);
    return gainNode;
  };

  const scheduleDragSoundUpdate = () => {
    if (state.dragSoundRaf) {
      return;
    }

    state.dragSoundRaf = window.requestAnimationFrame(() => {
      state.dragSoundRaf = 0;
      updateDragSound(state.pendingDragSpeed, state.pendingDragX);
    });
  };

  const scheduleScrollTextureUpdate = (delta, speed, direction = 1) => {
    state.pendingScrollDelta += delta;
    state.scrollPendingSpeed = Math.max(state.scrollPendingSpeed, speed);
    state.scrollPendingDirection = direction || state.scrollPendingDirection;

    if (state.scrollRaf) {
      return;
    }

    state.scrollRaf = window.requestAnimationFrame(() => {
      const pendingDelta = state.pendingScrollDelta;
      const pendingSpeed = state.scrollPendingSpeed;
      const pendingDirection = state.scrollPendingDirection;

      state.scrollRaf = 0;
      state.pendingScrollDelta = 0;
      state.scrollPendingSpeed = 0;

      updateScrollSound(pendingSpeed, pendingDirection);
      emitScrollTicksForDelta(pendingDelta, pendingSpeed, pendingDirection);
    });
  };

  const bindContinuousInteractionListeners = () => {
    if (state.continuousListenersBound) {
      return;
    }

    if (supportsHover) {
      state.handleMouseMove = (event) => {
        const now = getNow();

        if (!state.lastMoveAt) {
          state.lastMoveX = event.clientX;
          state.lastMoveY = event.clientY;
          state.lastMoveAt = now;
          return;
        }

        const elapsed = now - state.lastMoveAt;
        const distance = Math.hypot(event.clientX - state.lastMoveX, event.clientY - state.lastMoveY);

        state.lastMoveX = event.clientX;
        state.lastMoveY = event.clientY;
        state.lastMoveAt = now;

        if (!state.unlocked || state.muted || !state.dragStarted || elapsed <= 8 || elapsed > 140) {
          return;
        }

        const instantaneousSpeed = distance / elapsed * 1000;
        state.smoothedSpeed = state.smoothedSpeed * 0.72 + instantaneousSpeed * 0.28;
        state.pendingDragSpeed = state.smoothedSpeed;
        state.pendingDragX = event.clientX;
        scheduleDragSoundUpdate();

        window.clearTimeout(state.idleTimer);
        state.idleTimer = window.setTimeout(() => {
          fadeDragSound();
        }, 90);
      };

      state.handleMouseLeave = () => {
        fadeDragSound();
      };

      window.addEventListener("mousemove", state.handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", state.handleMouseLeave);
    }

    state.handleScroll = () => {
      const now = getNow();
      const scrollY = window.scrollY || window.pageYOffset || 0;

      if (!state.lastScrollAt) {
        state.lastScrollY = scrollY;
        state.lastScrollAt = now;
        return;
      }

      const elapsed = now - state.lastScrollAt;
      const delta = scrollY - state.lastScrollY;

      state.lastScrollY = scrollY;
      state.lastScrollAt = now;

      if (!state.unlocked || state.muted || !state.scrollStarted || elapsed <= 10 || elapsed > 220 || delta === 0) {
        return;
      }

      const speed = Math.abs(delta) / elapsed * 1000;
      const direction = Math.sign(delta) || state.scrollPendingDirection;
      scheduleScrollTextureUpdate(delta, speed, direction);

      window.clearTimeout(state.scrollIdleTimer);
      state.scrollIdleTimer = window.setTimeout(() => {
        fadeScrollSound();
      }, 140);
    };

    window.addEventListener("scroll", state.handleScroll, { passive: true });
    state.continuousListenersBound = true;
  };

  const ensureAudio = async () => {
    if (!AudioContextClass) {
      return null;
    }

    if (!state.ctx) {
      state.ctx = new AudioContextClass();
      state.masterGain = createMasterGain(state.ctx);
    }

    if (state.ctx.state === "suspended") {
      await state.ctx.resume();
    }

    state.unlocked = true;
    syncMasterGain();
    updateSoundToggleUI();

    if (supportsHover && !state.dragStarted) {
      const dragSource = state.ctx.createBufferSource();
      const dragFilter = state.ctx.createBiquadFilter();
      const dragGain = state.ctx.createGain();
      const highpass = state.ctx.createBiquadFilter();
      const dragPan = typeof state.ctx.createStereoPanner === "function"
        ? state.ctx.createStereoPanner()
        : null;

      dragSource.buffer = createNoiseBuffer(state.ctx);
      dragSource.loop = true;

      highpass.type = "highpass";
      highpass.frequency.value = 220;

      dragFilter.type = "bandpass";
      dragFilter.frequency.value = 680;
      dragFilter.Q.value = 1.1;

      dragGain.gain.value = 0.0001;

      dragSource.connect(highpass);
      highpass.connect(dragFilter);

      if (dragPan) {
        dragFilter.connect(dragPan);
        dragPan.connect(dragGain);
      } else {
        dragFilter.connect(dragGain);
      }

      dragGain.connect(state.masterGain);
      dragSource.start();

      state.dragSource = dragSource;
      state.dragGain = dragGain;
      state.dragFilter = dragFilter;
      state.dragPan = dragPan;
      state.dragStarted = true;
    }

    if (!state.scrollStarted) {
      const scrollSource = state.ctx.createBufferSource();
      const scrollHighpass = state.ctx.createBiquadFilter();
      const scrollFilter = state.ctx.createBiquadFilter();
      const scrollShaper = state.ctx.createWaveShaper();
      const scrollGain = state.ctx.createGain();
      const scrollDetailSource = state.ctx.createBufferSource();
      const scrollDetailHighpass = state.ctx.createBiquadFilter();
      const scrollDetailFilter = state.ctx.createBiquadFilter();
      const scrollDetailGain = state.ctx.createGain();

      scrollSource.buffer = createNoiseBuffer(state.ctx);
      scrollSource.loop = true;
      scrollSource.playbackRate.value = 0.74;

      scrollHighpass.type = "highpass";
      scrollHighpass.frequency.value = 180;

      scrollFilter.type = "bandpass";
      scrollFilter.frequency.value = 520;
      scrollFilter.Q.value = 0.82;

      scrollDetailSource.buffer = createNoiseBuffer(state.ctx);
      scrollDetailSource.loop = true;
      scrollDetailSource.playbackRate.value = 0.86;

      scrollDetailHighpass.type = "highpass";
      scrollDetailHighpass.frequency.value = 720;

      scrollDetailFilter.type = "bandpass";
      scrollDetailFilter.frequency.value = 1260;
      scrollDetailFilter.Q.value = 2.5;

      scrollShaper.curve = createSoftClipCurve(160, 1.85);
      scrollShaper.oversample = "4x";

      scrollGain.gain.value = 0.0001;
      scrollDetailGain.gain.value = 0.0001;

      scrollSource.connect(scrollHighpass);
      scrollHighpass.connect(scrollFilter);
      scrollFilter.connect(scrollGain);
      scrollGain.connect(state.masterGain);

      scrollDetailSource.connect(scrollDetailHighpass);
      scrollDetailHighpass.connect(scrollDetailFilter);
      scrollDetailFilter.connect(scrollShaper);
      scrollShaper.connect(scrollDetailGain);
      scrollDetailGain.connect(state.masterGain);

      scrollSource.start();
      scrollDetailSource.start();

      state.scrollSource = scrollSource;
      state.scrollGain = scrollGain;
      state.scrollFilter = scrollFilter;
      state.scrollShaper = scrollShaper;
      state.scrollDetailSource = scrollDetailSource;
      state.scrollDetailGain = scrollDetailGain;
      state.scrollDetailFilter = scrollDetailFilter;
      state.scrollStarted = true;
    }

    bindContinuousInteractionListeners();
    return state.ctx;
  };

  const playTransient = (parts, envelope) => {
    if (!state.ctx || !state.masterGain) {
      return;
    }

    const now = state.ctx.currentTime;
    const voiceGain = state.ctx.createGain();

    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(envelope.peak, now + envelope.attack);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + envelope.release);
    voiceGain.connect(state.masterGain);

    parts.forEach((part) => {
      const oscillator = state.ctx.createOscillator();
      oscillator.type = part.type;
      oscillator.frequency.setValueAtTime(part.from, now);
      oscillator.frequency.exponentialRampToValueAtTime(part.to, now + part.duration);
      oscillator.connect(voiceGain);
      oscillator.start(now);
      oscillator.stop(now + part.duration + 0.02);
    });
  };

  const playClickSound = () => {
    playTransient(
      [
        { type: "triangle", from: 920, to: 520, duration: 0.06 },
        { type: "square", from: 1480, to: 760, duration: 0.045 },
      ],
      { attack: 0.008, peak: 0.085, release: 0.08 }
    );
  };

  const playToggleSound = () => {
    playTransient(
      [
        { type: "triangle", from: 560, to: 760, duration: 0.05 },
        { type: "sine", from: 910, to: 700, duration: 0.07 },
      ],
      { attack: 0.006, peak: 0.1, release: 0.11 }
    );
  };

  const playHoverExpandSound = () => {
    playTransient(
      [
        { type: "sine", from: 310, to: 620, duration: 0.09 },
        { type: "triangle", from: 480, to: 980, duration: 0.06 },
      ],
      { attack: 0.01, peak: 0.055, release: 0.12 }
    );
  };

  const playScrollTick = (direction = 1, intensity = 0.5) => {
    const clampedIntensity = clamp(intensity, 0.2, 1);
    const pitchJitter = 1 + (Math.random() * 2 - 1) * 0.05;
    const releaseJitter = 0.068 + Math.random() * 0.024;
    const peak = 0.011 + clampedIntensity * 0.022;

    if (direction >= 0) {
      playTransient(
        [
          { type: "triangle", from: 620 * pitchJitter, to: 430 * pitchJitter, duration: 0.052 },
          { type: "sine", from: 880 * pitchJitter, to: 610 * pitchJitter, duration: 0.042 },
        ],
        { attack: 0.004, peak, release: releaseJitter }
      );
      return;
    }

    playTransient(
      [
        { type: "triangle", from: 560 * pitchJitter, to: 390 * pitchJitter, duration: 0.056 },
        { type: "sine", from: 760 * pitchJitter, to: 520 * pitchJitter, duration: 0.044 },
      ],
      { attack: 0.004, peak: peak * 0.95, release: releaseJitter + 0.004 }
    );
  };

  const emitScrollTicksForDelta = (delta, speed, direction) => {
    const travel = Math.abs(delta);
    if (!travel) {
      return;
    }

    state.scrollTickCarry += travel;

    const normalized = clamp(speed / 1800, 0, 1);
    const maxTicks = Math.max(
      1,
      Math.min(
        MAX_SCROLL_TICKS_PER_FRAME,
        1 + Math.floor(normalized * MAX_SCROLL_TICKS_PER_FRAME)
      )
    );

    const availableTicks = Math.floor(state.scrollTickCarry / SCROLL_TICK_SPACING_PX);
    if (!availableTicks) {
      return;
    }

    const ticksToPlay = Math.min(availableTicks, maxTicks);
    state.scrollTickCarry -= ticksToPlay * SCROLL_TICK_SPACING_PX;

    for (let index = 0; index < ticksToPlay; index += 1) {
      const tickIntensity = clamp(normalized * (0.88 + index * 0.035), 0.2, 1);
      playScrollTick(direction, tickIntensity);
      pulseScrollInstrument(tickIntensity);
    }
  };

  const fadeDragSound = () => {
    if (!state.dragGain || !state.ctx) {
      return;
    }

    state.dragGain.gain.setTargetAtTime(0.0001, state.ctx.currentTime, 0.08);
  };

  const fadeScrollSound = () => {
    if (!state.ctx) {
      return;
    }

    if (state.scrollGain) {
      state.scrollGain.gain.setTargetAtTime(0.0001, state.ctx.currentTime, 0.12);
    }

    if (state.scrollDetailGain) {
      state.scrollDetailGain.gain.setTargetAtTime(0.0001, state.ctx.currentTime, 0.14);
    }
  };

  const updateDragSound = (speed, clientX) => {
    if (!state.dragGain || !state.dragFilter || !state.ctx) {
      return;
    }

    const normalized = clamp((speed - 80) / 1200, 0, 1);
    const xRatio = clamp(clientX / Math.max(window.innerWidth, 1), 0, 1);
    const now = state.ctx.currentTime;

    state.dragGain.gain.setTargetAtTime(0.0001 + normalized * 0.05, now, 0.06);
    state.dragFilter.frequency.setTargetAtTime(520 + normalized * 2350, now, 0.05);
    state.dragFilter.Q.setTargetAtTime(0.8 + normalized * 5.6, now, 0.05);

    if (state.dragPan) {
      state.dragPan.pan.setTargetAtTime((xRatio - 0.5) * 0.9, now, 0.08);
    }
  };

  const updateScrollSound = (speed, direction = 1) => {
    if (
      !state.scrollGain ||
      !state.scrollFilter ||
      !state.scrollDetailGain ||
      !state.scrollDetailFilter ||
      !state.scrollSource ||
      !state.scrollDetailSource ||
      !state.ctx
    ) {
      return;
    }

    const normalized = clamp((speed - 24) / 1650, 0, 1);
    const now = state.ctx.currentTime;
    const directionBias = direction >= 0 ? 1 : 0.96;
    state.scrollDrift = state.scrollDrift * 0.74 + (Math.random() * 2 - 1) * 0.26;
    const drift = state.scrollDrift;
    const bodyGain = 0.0024 + normalized * 0.014;
    const detailGain = 0.00045 + normalized * normalized * 0.0095;

    state.scrollGain.gain.setTargetAtTime(bodyGain, now, 0.06);
    state.scrollDetailGain.gain.setTargetAtTime(detailGain, now, 0.055);
    state.scrollFilter.frequency.setTargetAtTime(340 + normalized * 480 + drift * 30, now, 0.06);
    state.scrollFilter.Q.setTargetAtTime(0.7 + normalized * 1.05, now, 0.065);
    state.scrollDetailFilter.frequency.setTargetAtTime(
      (860 + normalized * 980 + drift * 60) * directionBias,
      now,
      0.058
    );
    state.scrollDetailFilter.Q.setTargetAtTime(2.1 + normalized * 3.1, now, 0.058);
    state.scrollSource.playbackRate.setTargetAtTime(0.7 + normalized * 0.12 + drift * 0.012, now, 0.085);
    state.scrollDetailSource.playbackRate.setTargetAtTime(0.82 + normalized * 0.16 - drift * 0.016, now, 0.075);
  };

  const triggerActivationFeedback = async (control) => {
    if (!control) {
      return;
    }

    state.lastFeedbackControl = control;
    state.lastFeedbackTime = getNow();
    pulseElement(control);

    // Let the dedicated button click handler own the first sound-toggle transition.
    // Otherwise pointerdown/keydown feedback can unlock audio early and invert the
    // intended off -> on toggle on the first click.
    if (control.hasAttribute("data-sound-toggle")) {
      return;
    }

    if (!control.closest(".site-sound-control")) {
      return;
    }

    const context = await ensureAudio();
    if (!context) {
      return;
    }

    if (state.muted) {
      return;
    }

    if (isToggleControl(control)) {
      playToggleSound();
      return;
    }

    playClickSound();
  };

  document.addEventListener(
    "pointerdown",
    (event) => {
      const control = getControl(event.target);
      state.lastPointerControl = control;
      state.lastPointerTime = getNow();

      if (control) {
        triggerActivationFeedback(control).catch(() => {});
      }
    },
    { passive: true }
  );

  document.addEventListener("click", (event) => {
    const control = getControl(event.target);
    if (!control) {
      return;
    }

    if (
      control === state.lastPointerControl &&
      getNow() - state.lastPointerTime < 320
    ) {
      return;
    }

    if (
      control === state.lastFeedbackControl &&
      getNow() - state.lastFeedbackTime < 320
    ) {
      return;
    }

    triggerActivationFeedback(control).catch(() => {});
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const control = getControl(event.target);
    if (!control) {
      return;
    }

    triggerActivationFeedback(control).catch(() => {});
  });

  const handleHoverStart = (target) => {
    const control = getControl(target);
    if (!control || control === state.lastHoverControl || !state.unlocked || state.muted) {
      return;
    }

    state.lastHoverControl = control;
    playHoverExpandSound();
  };

  document.addEventListener("mouseover", (event) => {
    if (!supportsHover) {
      return;
    }

    handleHoverStart(event.target);
  });

  document.addEventListener("focusin", (event) => {
    handleHoverStart(event.target);
  });

  document.addEventListener("mouseout", (event) => {
    const control = getControl(event.target);
    const relatedControl = getControl(event.relatedTarget);

    if (control && control === state.lastHoverControl && control !== relatedControl) {
      state.lastHoverControl = null;
    }
  });

  createSoundToggle();
  createScrollInstrument();

  window.addEventListener("pagehide", () => {
    window.clearTimeout(state.idleTimer);
    window.clearTimeout(state.scrollIdleTimer);
    window.cancelAnimationFrame(state.dragSoundRaf);
    window.cancelAnimationFrame(state.scrollRaf);
    window.cancelAnimationFrame(state.scrollInstrumentRaf);

    if (state.handleMouseMove) {
      window.removeEventListener("mousemove", state.handleMouseMove);
    }

    if (state.handleMouseLeave) {
      window.removeEventListener("mouseleave", state.handleMouseLeave);
    }

    if (state.handleScroll) {
      window.removeEventListener("scroll", state.handleScroll);
    }

    if (state.dragSource) {
      state.dragSource.stop();
    }

    if (state.scrollSource) {
      state.scrollSource.stop();
    }

    if (state.scrollDetailSource) {
      state.scrollDetailSource.stop();
    }
  });
})();
