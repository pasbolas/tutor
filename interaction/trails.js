(() => {
  if (window.__tutorTrailOverlayInitialized) {
    return;
  }

  window.__tutorTrailOverlayInitialized = true;

  const profile = window.__tutorPerformanceProfile || {
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    coarsePointer: window.matchMedia("(hover: none), (pointer: coarse)").matches,
    smallViewport: window.matchMedia("(max-width: 980px)").matches,
    lowPowerMode: false,
  };

  if (profile.prefersReducedMotion || profile.coarsePointer || profile.smallViewport) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "site-trail-overlay";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const state = {
    dpr: 1,
    width: 0,
    height: 0,
    pointerX: window.innerWidth * 0.5,
    pointerY: window.innerHeight * 0.5,
    lastPointerX: window.innerWidth * 0.5,
    lastPointerY: window.innerHeight * 0.5,
    lastPointerTime: 0,
    lastScrollY: window.scrollY,
    pendingPointer: null,
    pendingScrollDelta: 0,
    activity: 0,
    rafId: 0,
    resizeRaf: 0,
    lastFrameTime: 0,
    hasPointer: false,
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const resize = () => {
    state.dpr = Math.min(window.devicePixelRatio || 1, profile.lowPowerMode ? 1.4 : 1.8);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  };

  const requestResize = () => {
    if (state.resizeRaf) {
      return;
    }

    state.resizeRaf = window.requestAnimationFrame(() => {
      state.resizeRaf = 0;
      resize();
      state.activity = Math.max(state.activity, 0.12);
      scheduleLoop();
    });
  };

  const fade = (strength) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0, 0, 0, ${strength})`;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.restore();
  };

  const drawStamp = (x, y, size, color, alpha = 1, squash = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * squash, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawPointerTrail = (fromX, fromY, toX, toY, speed, phase) => {
    const distance = Math.hypot(toX - fromX, toY - fromY);
    const steps = Math.min(14, Math.max(2, Math.ceil(distance / 12)));
    const strength = clamp(speed / 1100, 0.18, 1);

    for (let index = 0; index <= steps; index += 1) {
      const t = index / steps;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      const wobble = Math.sin(phase * 10 + t * 7.5) * 2.8 * strength;
      const jitter = Math.cos(phase * 8 + t * 5.1) * 1.6 * strength;
      const size = 1.2 + strength * 2.8;
      const alpha = 0.03 + strength * 0.085;

      drawStamp(x + wobble, y + jitter, size, "rgba(185, 78, 78, 0.92)", alpha, 0.72);
      drawStamp(x - wobble * 0.35, y - jitter * 0.2, size * 0.78, "rgba(38, 31, 27, 0.86)", alpha * 0.44, 0.9);
    }
  };

  const drawScrollTrail = (deltaY, phase) => {
    const magnitude = clamp(Math.abs(deltaY), 6, 120);
    const direction = deltaY > 0 ? 1 : -1;
    const anchorX = clamp(state.pointerX || state.width * 0.5, 34, state.width - 34);
    const anchorY = clamp(state.pointerY || state.height * 0.5, 34, state.height - 34);
    const tailLength = magnitude * 0.72;
    const steps = Math.max(4, Math.ceil(magnitude / 9));

    for (let index = 0; index <= steps; index += 1) {
      const t = index / steps;
      const spread = (t - 0.5) * 2;
      const x = anchorX + Math.sin(phase * 2 + t * Math.PI * 1.2) * (7 + magnitude * 0.06) * direction;
      const y = anchorY - tailLength * 0.5 + tailLength * t;
      const size = 1.4 + (1 - Math.abs(t - 0.5) * 2) * 2.4;
      const alpha = 0.045 + (magnitude / 120) * 0.08;

      drawStamp(x, y, size, "rgba(185, 78, 78, 0.84)", alpha, 0.62);
      drawStamp(x + direction * 3.2, y - spread * 2.2, size * 0.58, "rgba(38, 31, 27, 0.72)", alpha * 0.36, 1);
    }

    const sweepWidth = 36 + magnitude * 1.6;
    const sweepSteps = Math.max(4, Math.ceil(sweepWidth / 18));

    for (let index = 0; index <= sweepSteps; index += 1) {
      const t = index / sweepSteps;
      const x = anchorX - sweepWidth * 0.5 + sweepWidth * t;
      const y = anchorY + Math.sin(phase * 3 + t * Math.PI * 2) * 3.4 * direction;
      const alpha = 0.018 + (magnitude / 120) * 0.026;

      drawStamp(x, y, 1.05, "rgba(185, 78, 78, 0.8)", alpha, 0.5);
    }

    drawStamp(anchorX, anchorY, 2.4 + magnitude * 0.02, "rgba(185, 78, 78, 0.88)", 0.08, 0.82);
  };

  const scheduleLoop = () => {
    if (!state.rafId) {
      state.rafId = window.requestAnimationFrame(loop);
    }
  };

  const loop = (timestamp) => {
    state.rafId = 0;

    const elapsed = state.lastFrameTime ? Math.min(32, timestamp - state.lastFrameTime) : 16;
    state.lastFrameTime = timestamp;
    const frameScale = clamp(elapsed / 16, 0.75, 2);
    const phase = timestamp * 0.001;
    let didDraw = false;

    if (state.pendingPointer) {
      const { fromX, fromY, toX, toY, speed } = state.pendingPointer;
      drawPointerTrail(fromX, fromY, toX, toY, speed, phase);
      state.pendingPointer = null;
      state.activity = Math.min(1, state.activity + 0.5);
      didDraw = true;
    }

    if (Math.abs(state.pendingScrollDelta) >= 1) {
      drawScrollTrail(state.pendingScrollDelta, phase);
      state.pendingScrollDelta = 0;
      state.activity = Math.min(1, state.activity + 0.42);
      didDraw = true;
    }

    if (didDraw || state.activity > 0.02) {
      fade((didDraw ? 0.05 : 0.095) * frameScale);
    }

    state.activity = Math.max(0, state.activity - 0.045 * frameScale);

    if (state.activity > 0.015 || state.pendingPointer || Math.abs(state.pendingScrollDelta) >= 1) {
      scheduleLoop();
      return;
    }

    ctx.clearRect(0, 0, state.width, state.height);
    state.lastFrameTime = 0;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      const now = performance.now();

      if (!state.hasPointer) {
        state.pointerX = event.clientX;
        state.pointerY = event.clientY;
        state.lastPointerX = event.clientX;
        state.lastPointerY = event.clientY;
        state.lastPointerTime = now;
        state.hasPointer = true;
        return;
      }

      const elapsed = Math.max(now - state.lastPointerTime, 8);
      const distance = Math.hypot(event.clientX - state.lastPointerX, event.clientY - state.lastPointerY);
      const speed = distance / elapsed * 1000;

      state.pendingPointer = {
        fromX: state.lastPointerX,
        fromY: state.lastPointerY,
        toX: event.clientX,
        toY: event.clientY,
        speed,
      };

      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      state.lastPointerX = event.clientX;
      state.lastPointerY = event.clientY;
      state.lastPointerTime = now;
      scheduleLoop();
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const currentY = window.scrollY;
      const deltaY = currentY - state.lastScrollY;
      state.lastScrollY = currentY;

      if (Math.abs(deltaY) < 2) {
        return;
      }

      state.pendingScrollDelta += deltaY;
      scheduleLoop();
    },
    { passive: true }
  );

  window.addEventListener("resize", requestResize, { passive: true });
  window.addEventListener("pagehide", () => {
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
    }

    if (state.resizeRaf) {
      window.cancelAnimationFrame(state.resizeRaf);
    }
  }, { once: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.activity > 0) {
      scheduleLoop();
      return;
    }

    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  });

  resize();
})();
