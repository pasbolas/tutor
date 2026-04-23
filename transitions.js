(() => {
  const getSitePerformanceProfile = () => {
    if (window.__tutorPerformanceProfile) {
      return window.__tutorPerformanceProfile;
    }

    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    const smallViewport = window.matchMedia("(max-width: 980px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const lowPowerMode = Boolean(
      prefersReducedMotion
      || saveData
      || deviceMemory <= 4
      || hardwareConcurrency <= 4
      || (coarsePointer && smallViewport)
    );

    const profile = {
      coarsePointer,
      hoverCapable,
      smallViewport,
      prefersReducedMotion,
      deviceMemory,
      hardwareConcurrency,
      saveData,
      lowPowerMode,
    };

    window.__tutorPerformanceProfile = profile;
    document.documentElement.classList.toggle("is-low-power-device", lowPowerMode);
    return profile;
  };

  const profile = getSitePerformanceProfile();

  const initBlobCursor = () => {
    if (!profile.hoverCapable || profile.coarsePointer || profile.smallViewport) {
      return;
    }

    if (document.querySelector(".blob-cursor")) {
      return;
    }

    const cursor = document.createElement("div");
    cursor.className = "blob-cursor";
    cursor.setAttribute("aria-hidden", "true");

    const blob = document.createElement("div");
    blob.className = "blob-cursor__blob";

    const dot = document.createElement("div");
    dot.className = "blob-cursor__dot";

    cursor.append(blob, dot);
    document.body.appendChild(cursor);
    document.body.classList.add("has-blob-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let blobX = mouseX;
    let blobY = mouseY;
    let targetElement = null;
    let blobWidth = 60;
    let blobHeight = 60;
    let blobRadius = 30;
    let appliedWidth = 0;
    let appliedHeight = 0;
    let appliedRadius = 0;
    let rafId = 0;
    let settleFrames = 0;

    const lerp = (start, end, amount) => start + (end - start) * amount;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const snap = (value) => Math.round(value * 100) / 100;

    const applyBlobShape = (nextWidth, nextHeight, nextRadius) => {
      const width = snap(nextWidth);
      const height = snap(nextHeight);
      const radius = snap(nextRadius);

      if (
        appliedWidth === width
        && appliedHeight === height
        && appliedRadius === radius
      ) {
        return;
      }

      appliedWidth = width;
      appliedHeight = height;
      appliedRadius = radius;
      blob.style.width = `${width}px`;
      blob.style.height = `${height}px`;
      blob.style.borderRadius = `${radius}px`;
    };

    const scheduleRender = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    const render = () => {
      rafId = 0;

      if (targetElement && !document.body.contains(targetElement)) {
        targetElement = null;
        cursor.classList.remove("is-link-hover");
      }

      let destinationX = mouseX;
      let destinationY = mouseY;
      let destinationWidth = 60;
      let destinationHeight = 60;
      let destinationRadius = 30;

      if (targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        destinationX = targetRect.left + targetRect.width / 2;
        destinationY = targetRect.top + targetRect.height / 2;
        destinationWidth = clamp(targetRect.width + 18, 34, window.innerWidth * 0.72);
        destinationHeight = clamp(targetRect.height + 14, 32, 88);
        destinationRadius = Math.min(destinationHeight / 2, 12);
      }

      const distance = Math.hypot(destinationX - blobX, destinationY - blobY);
      const positionFollow = targetElement
        ? clamp(0.28 + distance / 520, 0.28, 0.5)
        : clamp(0.3 + distance / 460, 0.3, 0.6);
      const shapeDelta = Math.max(
        Math.abs(destinationWidth - blobWidth),
        Math.abs(destinationHeight - blobHeight),
        Math.abs(destinationRadius - blobRadius)
      );
      const shapeFollow = targetElement
        ? clamp(0.18 + shapeDelta / 360, 0.18, 0.34)
        : clamp(0.2 + shapeDelta / 320, 0.2, 0.38);

      blobX = lerp(blobX, destinationX, positionFollow);
      blobY = lerp(blobY, destinationY, positionFollow);
      blobWidth = lerp(blobWidth, destinationWidth, shapeFollow);
      blobHeight = lerp(blobHeight, destinationHeight, shapeFollow);
      blobRadius = lerp(blobRadius, destinationRadius, shapeFollow);

      applyBlobShape(blobWidth, blobHeight, blobRadius);
      blob.style.transform = `translate3d(${blobX - blobWidth / 2}px, ${blobY - blobHeight / 2}px, 0)`;
      dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;

      const settled = (
        Math.abs(destinationX - blobX) < 0.35
        && Math.abs(destinationY - blobY) < 0.35
        && Math.abs(destinationWidth - blobWidth) < 0.35
        && Math.abs(destinationHeight - blobHeight) < 0.35
        && Math.abs(destinationRadius - blobRadius) < 0.25
      );

      if (settled) {
        settleFrames += 1;
      } else {
        settleFrames = 0;
      }

      if (!settled || settleFrames < 2) {
        scheduleRender();
      }
    };

    const getHoverTarget = (source) => {
      if (!(source instanceof Element)) {
        return null;
      }

      return (
        source.closest(".flowing-project__link")
        || source.closest("a, button, [role='button']")
      );
    };

    const handleMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      const hoverTarget = getHoverTarget(event.target);
      if (hoverTarget !== targetElement) {
        targetElement = hoverTarget;
        cursor.classList.toggle("is-link-hover", Boolean(targetElement));
      }

      if (!targetElement && Math.hypot(mouseX - blobX, mouseY - blobY) > 220) {
        blobX = mouseX;
        blobY = mouseY;
      }

      settleFrames = 0;
      scheduleRender();
    };

    const handleEnter = (event) => {
      const hoverTarget = getHoverTarget(event.target);
      if (!hoverTarget) {
        return;
      }

      targetElement = hoverTarget;
      cursor.classList.add("is-link-hover");
      settleFrames = 0;
      scheduleRender();
    };

    const handleLeave = (event) => {
      const leavingTarget = getHoverTarget(event.target);
      const nextTarget = getHoverTarget(event.relatedTarget);

      if (leavingTarget && leavingTarget === nextTarget) {
        return;
      }

      targetElement = nextTarget;
      if (targetElement) {
        cursor.classList.add("is-link-hover");
      } else {
        cursor.classList.remove("is-link-hover");
      }

      settleFrames = 0;
      scheduleRender();
    };

    const handleScroll = () => {
      if (targetElement) {
        targetElement = null;
        cursor.classList.remove("is-link-hover");
      }

      settleFrames = 0;
      scheduleRender();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        return;
      }

      settleFrames = 0;
      scheduleRender();
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });
    document.addEventListener("mouseover", handleEnter);
    document.addEventListener("mouseout", handleLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    scheduleRender();

    window.addEventListener("pagehide", () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseover", handleEnter);
      document.removeEventListener("mouseout", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, { once: true });
  };

  initBlobCursor();

  const loader = document.querySelector("[data-editorial-loader]");
  if (!loader) {
    return;
  }

  const body = document.body;
  const LOADER_SEQUENCE_MS = 355 + 470;
  const LOADER_SETTLE_MS = 60;
  const ENTER_MIN_MS = profile.prefersReducedMotion ? 180 : LOADER_SEQUENCE_MS + LOADER_SETTLE_MS;
  const LEAVE_MS = profile.prefersReducedMotion ? 120 : LOADER_SEQUENCE_MS + LOADER_SETTLE_MS;

  const revealPage = () => {
    body.classList.add("is-loaded");
    body.classList.remove("is-loading", "is-leaving");
    loader.setAttribute("aria-hidden", "true");
  };

  const showLoader = (isLeaving = false) => {
    loader.setAttribute("aria-hidden", "false");
    body.classList.add("is-loading");
    body.classList.toggle("is-leaving", isLeaving);
  };

  const canIntercept = (anchor) => {
    if (!anchor) {
      return false;
    }

    if (anchor.target && anchor.target !== "_self") {
      return false;
    }

    if (anchor.hasAttribute("download")) {
      return false;
    }

    const href = anchor.getAttribute("href");
    if (!href) {
      return false;
    }

    if (
      href.startsWith("#")
      || href.startsWith("mailto:")
      || href.startsWith("tel:")
      || href.startsWith("javascript:")
    ) {
      return false;
    }

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) {
      return false;
    }

    if (
      destination.pathname === window.location.pathname
      && destination.search === window.location.search
    ) {
      return false;
    }

    return true;
  };

  const startTime = performance.now();
  showLoader(false);

  window.addEventListener(
    "load",
    () => {
      const elapsed = performance.now() - startTime;
      const delay = Math.max(0, ENTER_MIN_MS - elapsed);
      window.setTimeout(revealPage, delay);
    },
    { once: true }
  );

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      revealPage();
    }
  });

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!canIntercept(anchor)) {
      return;
    }

    event.preventDefault();
    const destination = new URL(anchor.href, window.location.href);

    try {
      window.localStorage.setItem("tutor-interaction-sound-muted", "1");
    } catch {
      // Ignore storage failures and continue navigation.
    }

    if (window.__tutorInteractionAudio && window.__tutorInteractionAudio.forceMutedForNavigation) {
      window.__tutorInteractionAudio.forceMutedForNavigation();
    }

    showLoader(true);
    body.classList.remove("is-loaded");

    window.setTimeout(() => {
      window.location.assign(destination.href);
    }, LEAVE_MS);
  });
})();
