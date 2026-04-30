const CURSOR_STORAGE_KEY = "tutor-notes-cursor-mode";
const SCROLL_MEMORY_STORAGE_PREFIX = "tutor-notes-scroll:";
const RECENT_NOTES_STORAGE_KEY = "tutor-notes-recent-history";
const RECENT_NOTES_LIMIT = 8;

function getStoredCursorMode() {
  try {
    const value = window.localStorage.getItem(CURSOR_STORAGE_KEY);
    return value === "blob" || value === "native" ? value : "";
  } catch {
    return "";
  }
}

function setStoredCursorMode(mode) {
  try {
    window.localStorage.setItem(CURSOR_STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}

function getStoredRecentNotes() {
  try {
    const value = window.localStorage.getItem(RECENT_NOTES_STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        href: typeof item?.href === "string" ? item.href : "",
        title: typeof item?.title === "string" ? item.title : "",
        subject: typeof item?.subject === "string" ? item.subject : "",
        meta: typeof item?.meta === "string" ? item.meta : "",
        sectionId: typeof item?.sectionId === "string" ? item.sectionId : "",
        sectionLabel: typeof item?.sectionLabel === "string" ? item.sectionLabel : "",
        sectionTitle: typeof item?.sectionTitle === "string" ? item.sectionTitle : "",
        sectionIndex: Number(item?.sectionIndex) || 0,
        totalSections: Number(item?.totalSections) || 0,
        progressPercent: Number(item?.progressPercent) || 0,
        visitedAt: Number(item?.visitedAt) || 0,
      }))
      .filter((item) => item.href && item.title && item.visitedAt > 0)
      .sort((left, right) => right.visitedAt - left.visitedAt)
      .slice(0, RECENT_NOTES_LIMIT);
  } catch {
    return [];
  }
}

function setStoredRecentNotes(entries) {
  try {
    window.localStorage.setItem(
      RECENT_NOTES_STORAGE_KEY,
      JSON.stringify(entries.slice(0, RECENT_NOTES_LIMIT))
    );
  } catch {
    // Reading history is an enhancement, so unavailable storage is fine.
  }
}

function rememberRecentNote(entry) {
  if (!entry || !entry.href || !entry.title) {
    return;
  }

  const normalizedHref = normalizeComparableHref(entry.href);
  const nextEntry = {
    href: normalizedHref,
    title: entry.title,
    subject: entry.subject || "",
    meta: entry.meta || "",
    sectionId: entry.sectionId || "",
    sectionLabel: entry.sectionLabel || "",
    sectionTitle: entry.sectionTitle || "",
    sectionIndex: Number(entry.sectionIndex) || 0,
    totalSections: Number(entry.totalSections) || 0,
    progressPercent: Number(entry.progressPercent) || 0,
    visitedAt: Date.now(),
  };

  const existing = getStoredRecentNotes().filter((item) => normalizeComparableHref(item.href) !== normalizedHref);
  existing.unshift(nextEntry);
  setStoredRecentNotes(existing);
}

function formatRelativeVisitTime(timestamp) {
  const elapsed = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < hour) {
    const minutes = Math.max(1, Math.round(elapsed / minute));
    return `${minutes} min ago`;
  }

  if (elapsed < day) {
    const hours = Math.max(1, Math.round(elapsed / hour));
    return `${hours}h ago`;
  }

  if (elapsed < day * 2) {
    return "Yesterday";
  }

  const days = Math.max(2, Math.round(elapsed / day));
  return `${days} days ago`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function initPageScrollMemory() {
  if (!("scrollTo" in window)) {
    return;
  }

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const storageKey = `${SCROLL_MEMORY_STORAGE_PREFIX}${window.location.origin}${window.location.pathname}`;
  const maxRestoreAttempts = 28;
  let saveRaf = 0;
  let restoreFrame = 0;
  let restoreAttempts = 0;
  let hasRestored = false;
  let isRestoring = false;
  let restoreSaveTimer = 0;

  const getStoredPosition = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      if (!value) {
        return null;
      }

      const position = JSON.parse(value);
      const top = Number(position.top);
      const left = Number(position.left);
      return {
        top: Number.isFinite(top) ? Math.max(0, top) : 0,
        left: Number.isFinite(left) ? Math.max(0, left) : 0,
      };
    } catch {
      return null;
    }
  };

  const savePosition = () => {
    saveRaf = 0;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        top: window.scrollY || 0,
        left: window.scrollX || 0,
        savedAt: Date.now(),
      }));
    } catch {
      // Scroll memory is an enhancement, so unavailable storage is fine.
    }
  };

  const requestSave = () => {
    if (isRestoring) {
      return;
    }

    if (saveRaf) {
      return;
    }

    saveRaf = window.requestAnimationFrame(savePosition);
  };

  const restorePosition = ({ force = false } = {}) => {
    if (hasRestored && !force) {
      return;
    }

    if (window.location.hash) {
      hasRestored = true;
      return;
    }

    const position = getStoredPosition();
    if (!position) {
      hasRestored = true;
      return;
    }

    if (restoreFrame) {
      window.cancelAnimationFrame(restoreFrame);
    }

    restoreAttempts = 0;

    const attemptRestore = () => {
      restoreFrame = 0;
      restoreAttempts += 1;
      isRestoring = true;

      if (restoreSaveTimer) {
        window.clearTimeout(restoreSaveTimer);
        restoreSaveTimer = 0;
      }

      const maxTop = Math.max(
        0,
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - window.innerHeight;
      const nextTop = Math.min(position.top, Math.max(0, maxTop));
      const canReachSavedPosition = position.top <= maxTop || restoreAttempts >= maxRestoreAttempts;

      window.scrollTo({
        left: position.left,
        top: nextTop,
        behavior: "auto",
      });

      if (!canReachSavedPosition) {
        restoreFrame = window.requestAnimationFrame(attemptRestore);
        return;
      }

      hasRestored = true;
      restoreSaveTimer = window.setTimeout(() => {
        isRestoring = false;
        restoreSaveTimer = 0;
      }, 120);
    };

    restoreFrame = window.requestAnimationFrame(attemptRestore);
  };

  window.addEventListener("scroll", requestSave, { passive: true });
  window.addEventListener("pagehide", savePosition);
  window.addEventListener("beforeunload", savePosition);
  window.addEventListener("load", () => restorePosition({ force: true }), { once: true });
  window.addEventListener("tutor:page-content-ready", () => restorePosition({ force: true }));
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      restorePosition({ force: true });
    }
  });

  restorePosition();
}

function initPwa() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
  if (localHosts.has(window.location.hostname)) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    }).catch(() => {
      // Local development should keep working even if cleanup is blocked.
    });

    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys
          .filter((key) => key.startsWith("tutor-notes-"))
          .forEach((key) => caches.delete(key));
      }).catch(() => {
        // Cache cleanup is best-effort in local development.
      });
    }

    return;
  }

  const scriptNode = Array.from(document.scripts).find((script) => {
    try {
      return /(^|\/)main\.js$/i.test(new URL(script.src).pathname);
    } catch {
      return false;
    }
  });
  const scriptUrl = scriptNode ? scriptNode.src : new URL("./scripts/main.js", window.location.href).href;
  const appRootUrl = new URL("../", scriptUrl);
  const serviceWorkerUrl = new URL("./sw.js", appRootUrl);
  const scope = appRootUrl;
  let refreshingForServiceWorker = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForServiceWorker) {
      return;
    }

    refreshingForServiceWorker = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: scope.pathname,
      updateViaCache: "none",
    }).catch(() => {
      // PWA support should never block the notes experience.
    });
  }, { once: true });
}

function initGlobalClickSpark() {
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotionQuery.matches) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "click-spark-overlay";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const context = canvas.getContext("2d");
  if (!context) {
    canvas.remove();
    return;
  }

  const sparks = [];
  const config = {
    sparkColor: getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || "#a85a4d",
    sparkSize: 12,
    sparkRadius: 28,
    sparkCount: 8,
    duration: 420,
    lineWidth: 1.5,
    extraScale: 1,
  };

  let animationFrame = 0;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let resizeRaf = 0;

  const easeOut = (t) => t * (2 - t);

  const resizeCanvas = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const requestResize = () => {
    if (resizeRaf) {
      return;
    }

    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = 0;
      resizeCanvas();
    });
  };

  const stopAnimation = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };

  const draw = (timestamp) => {
    context.clearRect(0, 0, width, height);

    for (let index = sparks.length - 1; index >= 0; index -= 1) {
      const spark = sparks[index];
      const elapsed = timestamp - spark.startTime;

      if (elapsed >= config.duration) {
        sparks.splice(index, 1);
        continue;
      }

      const progress = elapsed / config.duration;
      const eased = easeOut(progress);
      const distance = eased * config.sparkRadius * config.extraScale;
      const lineLength = config.sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      context.globalAlpha = 1 - progress;
      context.strokeStyle = config.sparkColor;
      context.lineWidth = config.lineWidth;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    }

    context.globalAlpha = 1;

    if (sparks.length > 0) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }

    stopAnimation();
    context.clearRect(0, 0, width, height);
  };

  const startAnimation = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  };

  const createSparkBurst = (event) => {
    if (event.button !== 0) {
      return;
    }

    const originX = event.clientX;
    const originY = event.clientY;
    const now = performance.now();

    for (let index = 0; index < config.sparkCount; index += 1) {
      sparks.push({
        x: originX,
        y: originY,
        angle: (Math.PI * 2 * index) / config.sparkCount,
        startTime: now,
      });
    }

    startAnimation();
  };

  resizeCanvas();
  window.addEventListener("resize", requestResize, { passive: true });
  document.addEventListener("pointerdown", createSparkBurst, { passive: true });
  window.addEventListener("pagehide", () => {
    if (resizeRaf) {
      window.cancelAnimationFrame(resizeRaf);
    }
    stopAnimation();
    window.removeEventListener("resize", requestResize);
    document.removeEventListener("pointerdown", createSparkBurst);
  }, { once: true });
}

function initScrollSoftening() {
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotionQuery.matches) {
    return;
  }

  let scrollEndTimer = 0;
  let scrollRaf = 0;
  let isScrolling = false;

  const clearScrollEndTimer = () => {
    if (!scrollEndTimer) {
      return;
    }

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = 0;
  };

  const endScroll = () => {
    scrollEndTimer = 0;
    isScrolling = false;
    document.body.classList.remove("is-page-scrolling");
  };

  const markScrolling = () => {
    scrollRaf = 0;

    if (!isScrolling) {
      isScrolling = true;
      document.body.classList.add("is-page-scrolling");
    }

    clearScrollEndTimer();
    scrollEndTimer = window.setTimeout(endScroll, 135);
  };

  const handleScroll = () => {
    if (scrollRaf) {
      return;
    }

    scrollRaf = window.requestAnimationFrame(markScrolling);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("pagehide", () => {
    if (scrollRaf) {
      window.cancelAnimationFrame(scrollRaf);
    }

    clearScrollEndTimer();
    document.body.classList.remove("is-page-scrolling");
  }, { once: true });
}

function createCursorToggleButton() {
  const button = document.createElement("button");
  button.className = "cursor-toggle";
  button.type = "button";
  button.dataset.cursorToggle = "";
  button.innerHTML = `
    <span class="cursor-toggle__preview" aria-hidden="true">
      <span class="cursor-toggle__ring"></span>
      <span class="cursor-toggle__dot"></span>
    </span>
    <span class="cursor-toggle__label">Cursor FX</span>
  `;

  return button;
}

function syncCursorToggleButton(button, controller) {
  const currentMode = controller.getMode && controller.getMode() === "native" ? "native" : "blob";
  const isBlob = currentMode === "blob";

  button.dataset.cursorMode = currentMode;
  button.setAttribute("aria-pressed", String(isBlob));
  button.setAttribute("aria-label", isBlob ? "Switch to normal cursor" : "Switch to custom cursor");
  button.title = isBlob ? "Switch to normal cursor" : "Switch to custom cursor";

  const label = button.querySelector(".cursor-toggle__label");
  if (label) {
    label.textContent = isBlob ? "Cursor FX" : "Cursor";
  }
}

function initCursorToggle() {
  if (document.querySelector("[data-markdown-page]")) {
    return;
  }

  const topbars = document.querySelectorAll(".study-topbar");
  const sidebarCursorHost = document.querySelector("[data-sidebar-cursor-host]");
  const controller = window.__tutorCursorController;

  if ((!topbars.length && !sidebarCursorHost) || !controller || typeof controller.setMode !== "function") {
    return;
  }

  if (!controller.isAvailable) {
    return;
  }

  const buttons = [];

  const syncButtons = () => {
    buttons.forEach((button) => {
      syncCursorToggleButton(button, controller);
    });
  };

  const attachCursorButton = (button, host) => {
    host.appendChild(button);

    button.addEventListener("click", () => {
      const nextMode = controller.getMode() === "blob" ? "native" : "blob";
      controller.setMode(nextMode, { persist: true });
      setStoredCursorMode(nextMode);
      syncButtons();
    });

    buttons.push(button);
  };

  if (sidebarCursorHost && !sidebarCursorHost.querySelector("[data-cursor-toggle]")) {
    attachCursorButton(createCursorToggleButton(), sidebarCursorHost);
  }

  if (!sidebarCursorHost) {
    topbars.forEach((topbar) => {
      if (topbar.querySelector("[data-cursor-toggle]")) {
        return;
      }

      const button = createCursorToggleButton();

      const nav = topbar.querySelector(".study-topbar__nav");
      attachCursorButton(button, nav || topbar);
    });
  }

  document.querySelectorAll("[data-cursor-toggle]").forEach((button) => {
    if (buttons.includes(button)) {
      return;
    }

    button.addEventListener("click", () => {
      const nextMode = controller.getMode() === "blob" ? "native" : "blob";
      controller.setMode(nextMode, { persist: true });
      setStoredCursorMode(nextMode);
      syncButtons();
    });

    buttons.push(button);
  });

  const storedMode = getStoredCursorMode();
  if (storedMode) {
    controller.setMode(storedMode);
  }

  syncButtons();
}

function initStudySettingsMenu() {
  const panel = document.querySelector("[data-study-outline-panel]");
  const homeLink = panel ? panel.querySelector(".study-outline__home") : null;
  const controller = window.__tutorCursorController;
  const soundControl = document.querySelector(".site-sound-control");

  if (!panel || !homeLink) {
    return;
  }

  const actions = document.createElement("div");
  actions.className = "study-outline__actions";
  homeLink.before(actions);
  actions.appendChild(homeLink);

  const settings = document.createElement("div");
  settings.className = "study-settings";

  const trigger = document.createElement("button");
  trigger.className = "study-settings__trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-label", "Open settings");
  trigger.innerHTML = `
    <span class="study-settings__trigger-icon" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
    <span class="study-settings__trigger-label">Settings</span>
  `;

  const menu = document.createElement("div");
  menu.className = "study-settings__menu";
  menu.hidden = true;
  let closeTimer = 0;
  let hideTimer = 0;

  const menuTitle = document.createElement("p");
  menuTitle.className = "study-settings__menu-title";
  menuTitle.textContent = "Settings";
  menu.appendChild(menuTitle);

  const appendMenuItem = (button) => {
    const item = document.createElement("div");
    item.className = "study-settings__item";
    item.appendChild(button);
    menu.appendChild(item);
    return button;
  };

  if (controller && controller.isAvailable) {
    const cursorButton = appendMenuItem(createCursorToggleButton());
    const storedMode = getStoredCursorMode();
    if (storedMode) {
      controller.setMode(storedMode);
    }

    const syncCursorButton = () => {
      syncCursorToggleButton(cursorButton, controller);
    };

    cursorButton.addEventListener("click", () => {
      const nextMode = controller.getMode() === "blob" ? "native" : "blob";
      controller.setMode(nextMode, { persist: true });
      setStoredCursorMode(nextMode);
      syncCursorButton();
    });

    syncCursorButton();
  }

  if (soundControl) {
    const soundItem = document.createElement("div");
    soundItem.className = "study-settings__item study-settings__item--sound";
    soundItem.appendChild(soundControl);
    menu.appendChild(soundItem);
  }

  settings.append(trigger, menu);
  actions.appendChild(settings);

  const clearCloseTimers = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }

    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
    }
  };

  const closeMenu = () => {
    clearCloseTimers();
    settings.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    hideTimer = window.setTimeout(() => {
      if (!settings.classList.contains("is-open")) {
        menu.hidden = true;
      }
    }, 190);
  };

  const requestCloseMenu = () => {
    clearCloseTimers();
    closeTimer = window.setTimeout(closeMenu, 180);
  };

  const openMenu = () => {
    clearCloseTimers();
    menu.hidden = false;
    window.requestAnimationFrame(() => {
      settings.classList.add("is-open");
    });
    trigger.setAttribute("aria-expanded", "true");
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (settings.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  settings.addEventListener("pointerenter", clearCloseTimers);
  menu.addEventListener("pointerenter", clearCloseTimers);
  menu.addEventListener("focusin", clearCloseTimers);

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    if (!settings.contains(event.target)) {
      closeMenu();
    }
  });

  settings.addEventListener("mouseleave", () => {
    requestCloseMenu();
  });

  settings.addEventListener("pointerleave", () => {
    requestCloseMenu();
  });

  settings.addEventListener("focusout", (event) => {
    if (!settings.contains(event.relatedTarget)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInline(text) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let html = "";
  let lastIndex = 0;
  let match = pattern.exec(text);

  while (match) {
    html += escapeHtml(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith("`")) {
      html += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
    } else if (token.startsWith("**")) {
      html += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
    } else {
      html += `<em>${escapeHtml(token.slice(1, -1))}</em>`;
    }

    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }

  html += escapeHtml(text.slice(lastIndex));
  return html;
}

function prettifyImageName(filename) {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(text, usedSlugs) {
  const baseSlug = text
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*-{3,}\s*$/.test(line)) {
      index += 1;
      continue;
    }

    const codeMatch = line.match(/^```([\w-]+)?\s*$/);
    if (codeMatch) {
      const language = codeMatch[1] || "";
      const codeLines = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const imageMatch = line.match(/^\s*\[\[IMAGE:\s*([^\]]+?)\s*\]\]\s*$/i);
    if (imageMatch) {
      const filename = imageMatch[1].trim();
      blocks.push({
        type: "image",
        filename,
        alt: prettifyImageName(filename),
      });
      index += 1;
      continue;
    }

    const isTableLine = (value) => /^\s*\|.+\|\s*$/.test(value);
    const isTableSeparator = (value) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(value);
    if (
      isTableLine(line)
      && index + 1 < lines.length
      && isTableSeparator(lines[index + 1])
    ) {
      const splitRow = (value) => value
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());
      const headers = splitRow(line);
      const rows = [];
      index += 2;

      while (index < lines.length && isTableLine(lines[index])) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }

      blocks.push({
        type: "table",
        headers,
        rows,
      });
      continue;
    }

    const unorderedMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (unorderedMatch) {
      const items = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*[-*]\s+(.*)$/);
        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1].trim());
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered: false,
        items,
      });
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (orderedMatch) {
      const items = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*\d+\.\s+(.*)$/);
        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1].trim());
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered: true,
        items,
      });
      continue;
    }

    const paragraphLines = [];

    while (index < lines.length) {
      const currentLine = lines[index];
      if (
        !currentLine.trim()
        || /^```/.test(currentLine)
        || /^(#{1,6})\s+/.test(currentLine)
        || /^\s*\[\[IMAGE:\s*([^\]]+?)\s*\]\]\s*$/i.test(currentLine)
        || /^\s*\|.+\|\s*$/.test(currentLine)
        || /^\s*[-*]\s+/.test(currentLine)
        || /^\s*\d+\.\s+/.test(currentLine)
      ) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      lines: paragraphLines,
      preserveBreaks: paragraphLines.some((paragraphLine) => /\s{2,}$/.test(paragraphLine)),
      text: paragraphLines.map((paragraphLine) => paragraphLine.trim()).join(" "),
    });
  }

  return blocks;
}

function renderBlock(block, options = {}) {
  if (block.type === "paragraph") {
    if (block.preserveBreaks && Array.isArray(block.lines)) {
      return `<p>${block.lines.map((line) => renderInline(line.trim())).join("<br />")}</p>`;
    }

    return `<p>${renderInline(block.text)}</p>`;
  }

  if (block.type === "list") {
    const tag = block.ordered ? "ol" : "ul";
    const items = block.items
      .map((item) => `<li>${renderInline(item)}</li>`)
      .join("");
    return `<${tag}>${items}</${tag}>`;
  }

  if (block.type === "code") {
    const language = block.language || "text";
    return [
      '<figure class="study-code">',
      `  <figcaption class="study-markdown__caption"><span>Code Sample</span><span>${escapeHtml(language)}</span></figcaption>`,
      `  <pre data-language="${escapeHtml(language)}"><code>${escapeHtml(block.code)}</code></pre>`,
      "</figure>",
    ].join("");
  }

  if (block.type === "heading") {
    const level = Math.min(Math.max(block.level, 3), 4);
    return `<h${level}>${renderInline(block.text)}</h${level}>`;
  }

  if (block.type === "image") {
    const imageBase = options.imageBase || "";
    const src = `${imageBase}${block.filename}`;
    return [
      '<figure class="study-image">',
      `  <img src="${escapeAttribute(src)}" alt="${escapeAttribute(block.alt)}" loading="lazy" />`,
      `  <figcaption class="study-markdown__caption"><span>Figure</span><span>${escapeHtml(block.alt)}</span></figcaption>`,
      "</figure>",
    ].join("");
  }

  if (block.type === "table") {
    const headers = block.headers
      .map((cell) => `<th scope="col">${renderInline(cell)}</th>`)
      .join("");
    const rows = block.rows
      .map((row) => `
        <tr>
          ${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}
        </tr>
      `)
      .join("");

    return [
      '<div class="study-table-wrap">',
      '  <table class="study-table">',
      `    <thead><tr>${headers}</tr></thead>`,
      `    <tbody>${rows}</tbody>`,
      "  </table>",
      "</div>",
    ].join("");
  }

  return "";
}

function isMcqHeading(block) {
  return block.type === "heading" && /^MCQ\s+\d+/i.test(block.text);
}

function renderMcqOptions(block) {
  const text = (Array.isArray(block.lines) ? block.lines.join("\n") : block.text)
    .split(/\n\s*\*\*(?:Answer|Explanation):/i)[0]
    .trim();
  const optionMatches = [...text.matchAll(/(?:^|\n)\s*([A-D])\.\s+([\s\S]*?)(?=\n\s*[A-D]\.\s+|$)/g)];

  if (optionMatches.length < 2) {
    return renderBlock(block);
  }

  const items = optionMatches
    .map((match) => `
      <li class="study-mcq__option">
        <span class="study-mcq__option-letter">${escapeHtml(match[1])}</span>
        <span>${renderInline(match[2].replace(/\s+/g, " ").trim())}</span>
      </li>
    `)
    .join("");

  return `<ol class="study-mcq__options" aria-label="Answer options">${items}</ol>`;
}

function getMcqAnswer(block) {
  const text = Array.isArray(block.lines) ? block.lines.join("\n") : block.text;
  const answerMatch = text.match(/(?:^|\n)\s*\*\*Answer:\*\*\s*([^\n]*)/i)
    || text.match(/(?:^|\n)\s*\*\*Answer:\s*(.*?)\*\*/i);

  return answerMatch ? answerMatch[1].trim() : "";
}

function getMcqExplanation(block) {
  const text = Array.isArray(block.lines) ? block.lines.join("\n") : block.text;
  const explanationMatch = text.match(/(?:^|\n)\s*\*\*Explanation:\*\*\s*([\s\S]*)$/i);

  return explanationMatch ? explanationMatch[1].trim() : "";
}

function renderMcqFeedback(answer, explanation) {
  if (!answer && !explanation) {
    return "";
  }

  return `
    <div class="study-mcq__feedback">
      ${answer ? `
        <p class="study-mcq__feedback-row study-mcq__feedback-row--answer">
          <span>Answer</span>
          <strong>${renderInline(answer)}</strong>
        </p>
      ` : ""}
      ${explanation ? `
        <p class="study-mcq__feedback-row">
          <span>Explanation</span>
          <em>${renderInline(explanation)}</em>
        </p>
      ` : ""}
    </div>
  `;
}

function renderMcqCard(card, options = {}) {
  const question = card.blocks.find((block) => block.type === "paragraph");
  const optionsBlock = card.blocks.find((block) => (
    block.type === "paragraph"
    && /^A\.\s+/i.test(Array.isArray(block.lines) ? block.lines[0]?.trim() || "" : block.text)
  ));

  const answerBlock = card.blocks.find((block) => block.type === "paragraph" && getMcqAnswer(block));
  const explanationBlock = card.blocks.find((block) => block.type === "paragraph" && getMcqExplanation(block));
  const renderedBlocks = new Set([question, optionsBlock, answerBlock, explanationBlock].filter(Boolean));
  const detailBlocks = card.blocks.filter((block) => !renderedBlocks.has(block));

  return [
    '<article class="study-mcq">',
    `  <h3>${renderInline(card.title)}</h3>`,
    question ? `  <p class="study-mcq__question">${renderInline(question.text)}</p>` : "",
    optionsBlock ? renderMcqOptions(optionsBlock) : "",
    renderMcqFeedback(
      answerBlock ? getMcqAnswer(answerBlock) : "",
      explanationBlock ? getMcqExplanation(explanationBlock) : ""
    ),
    detailBlocks.map((block) => renderBlock(block, options)).join(""),
    "</article>",
  ].join("");
}

function buildMcqGuide(blocks, options = {}) {
  const usedSlugs = new Set();
  const outline = [];
  const htmlParts = [];
  let sectionCount = 0;
  let codeCount = 0;
  let currentSectionOpen = false;
  let currentMcq = null;
  let hasSeenTitle = false;

  const openSection = (headingText) => {
    const id = slugify(headingText, usedSlugs);
    const label = String(sectionCount + 1).padStart(2, "0");
    outline.push({
      id,
      label,
      text: headingText,
    });

    htmlParts.push(
      `<section class="study-markdown__section study-markdown__section--mcq" id="${id}" data-study-section data-study-section-label="${escapeAttribute(label)}" data-study-section-title="${escapeAttribute(headingText)}" data-study-section-index="${sectionCount + 1}">`,
      '  <header class="study-markdown__section-header">',
      `    <span class="study-markdown__section-index">${label}</span>`,
      "    <div>",
      `      <p class="study-kicker">Question Set ${label}</p>`,
      `      <h2>${renderInline(headingText)}</h2>`,
      "    </div>",
      "  </header>",
      '  <div class="study-markdown__section-body study-markdown__section-body--mcq">'
    );

    currentSectionOpen = true;
    sectionCount += 1;
  };

  const closeMcq = () => {
    if (!currentMcq) {
      return;
    }

    htmlParts.push(renderMcqCard(currentMcq, options));
    currentMcq = null;
  };

  const closeSection = () => {
    closeMcq();
    if (!currentSectionOpen) {
      return;
    }

    htmlParts.push("  </div>", "</section>");
    currentSectionOpen = false;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 1) {
      if (!hasSeenTitle) {
        hasSeenTitle = true;
        return;
      }

      closeSection();
      openSection(block.text);
      return;
    }

    if (isMcqHeading(block)) {
      if (!currentSectionOpen) {
        openSection("Practice Questions");
      }

      closeMcq();
      codeCount += 1;
      currentMcq = {
        title: block.text,
        blocks: [],
      };
      return;
    }

    if (!currentSectionOpen) {
      openSection("Practice Questions");
    }

    if (block.type === "code" || block.type === "image") {
      codeCount += 1;
    }

    if (currentMcq) {
      currentMcq.blocks.push(block);
      return;
    }

    htmlParts.push(renderBlock(block, options));
  });

  closeSection();

  return {
    html: htmlParts.join(""),
    outline,
    sectionCount,
    codeCount,
  };
}

function buildGuide(blocks, options = {}) {
  const usedSlugs = new Set();
  const outline = [];
  const htmlParts = [];
  let sectionCount = 0;
  let codeCount = 0;
  let currentSectionOpen = false;

  const openSection = (headingText) => {
    const id = slugify(headingText, usedSlugs);
    const label = String(sectionCount + 1).padStart(2, "0");
    outline.push({
      id,
      label,
      text: headingText,
    });

    htmlParts.push(
      `<section class="study-markdown__section" id="${id}" data-study-section data-study-section-label="${escapeAttribute(label)}" data-study-section-title="${escapeAttribute(headingText)}" data-study-section-index="${sectionCount + 1}">`,
      '  <header class="study-markdown__section-header">',
      `    <span class="study-markdown__section-index">${label}</span>`,
      "    <div>",
      `      <p class="study-kicker">Section ${label}</p>`,
      `      <h2>${renderInline(headingText)}</h2>`,
      "    </div>",
      "  </header>",
      '  <div class="study-markdown__section-body">'
    );

    currentSectionOpen = true;
    sectionCount += 1;
  };

  const closeSection = () => {
    if (!currentSectionOpen) {
      return;
    }

    htmlParts.push("  </div>", "</section>");
    currentSectionOpen = false;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 2) {
      closeSection();
      openSection(block.text);
      return;
    }

    if (!currentSectionOpen) {
      openSection("Guide Overview");
    }

    if (block.type === "code" || block.type === "image") {
      codeCount += 1;
    }

    if (block.type === "heading" && block.level === 1) {
      return;
    }

    htmlParts.push(renderBlock(block, options));
  });

  closeSection();

  return {
    html: htmlParts.join(""),
    outline,
    sectionCount,
    codeCount,
  };
}

function countWords(blocks) {
  const text = blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return block.text;
      }

      if (block.type === "heading") {
        return block.text;
      }

      if (block.type === "list") {
        return block.items.join(" ");
      }

      if (block.type === "table") {
        return block.headers.concat(block.rows.flat()).join(" ");
      }

      return "";
    })
    .join(" ")
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).length;
}

function setText(selector, value) {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach((node) => {
    node.textContent = value;
  });
}

function renderOutline(outline) {
  const outlineRoot = document.querySelector("[data-study-outline]");
  if (!outlineRoot) {
    return;
  }

  outlineRoot.innerHTML = outline
    .map(
      (item) => `
        <a class="study-outline__link" href="#${item.id}" data-outline-link="${item.id}">
          <span>${item.label}</span>
          <span>${renderInline(item.text)}</span>
        </a>
      `
    )
    .join("");
}

function initOutlineToggle() {
  const panel = document.querySelector("[data-study-outline-panel]");
  const toggle = document.querySelector("[data-study-outline-toggle]");
  const outlineRoot = document.querySelector("[data-study-outline]");
  const toggleLabel = toggle ? toggle.querySelector("span") : null;

  if (!panel || !toggle || !outlineRoot || !toggleLabel) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 780px)");
  let scrollAnimationFrame = 0;
  let isProgrammaticScroll = false;

  const easeInOutCubic = (progress) => (
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - ((-2 * progress + 2) ** 3) / 2
  );

  const cancelSmoothScroll = () => {
    if (!scrollAnimationFrame) {
      return;
    }

    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = 0;
    isProgrammaticScroll = false;
  };

  const animateScrollTo = (targetTop) => {
    cancelSmoothScroll();

    const startTop = window.scrollY;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const endTop = Math.min(Math.max(0, targetTop), maxTop);
    const distance = endTop - startTop;
    const duration = Math.min(1150, Math.max(620, 520 + Math.abs(distance) * 0.18));
    const startTime = performance.now();

    if (Math.abs(distance) < 1) {
      window.scrollTo(0, endTop);
      return;
    }

    isProgrammaticScroll = true;

    const step = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startTop + distance * eased);

      if (progress < 1) {
        scrollAnimationFrame = window.requestAnimationFrame(step);
        return;
      }

      scrollAnimationFrame = 0;
      isProgrammaticScroll = false;
    };

    scrollAnimationFrame = window.requestAnimationFrame(step);
  };

  const closePanel = () => {
    panel.classList.remove("is-open");
    syncState();
  };

  const syncState = () => {
    if (mobileQuery.matches) {
      const isOpen = panel.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggleLabel.textContent = isOpen ? "Close map" : "Guide map";
      return;
    }

    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Guide map";
  };

  toggle.addEventListener("click", () => {
    if (!mobileQuery.matches) {
      return;
    }

    panel.classList.toggle("is-open");
    syncState();
  });

  outlineRoot.addEventListener("click", (event) => {
    if (!mobileQuery.matches) {
      return;
    }

    const link = event.target.closest("[data-outline-link]");
    if (!link) {
      return;
    }

    const href = link.getAttribute("href") || "";
    const targetId = href.startsWith("#") ? href.slice(1) : "";
    const target = targetId ? document.getElementById(decodeURIComponent(targetId)) : null;
    if (!target) {
      closePanel();
      return;
    }

    event.preventDefault();
    closePanel();

    window.requestAnimationFrame(() => {
      const header = panel.querySelector(".study-outline__header");
      const headerRect = header ? header.getBoundingClientRect() : panel.getBoundingClientRect();
      const panelStyles = window.getComputedStyle(panel);
      const panelPaddingBottom = parseFloat(panelStyles.paddingBottom) || 0;
      const sectionGap = 14;
      const landingY = headerRect.bottom + panelPaddingBottom + sectionGap;
      const targetY = target.getBoundingClientRect().top + window.scrollY - landingY;

      animateScrollTo(targetY);

      window.history.replaceState(null, "", `#${target.id}`);
    });
  });

  document.addEventListener("click", (event) => {
    if (!mobileQuery.matches || !panel.classList.contains("is-open")) {
      return;
    }

    if (panel.contains(event.target)) {
      return;
    }

    closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !mobileQuery.matches) {
      return;
    }

    closePanel();
  });

  window.addEventListener("wheel", () => {
    if (!isProgrammaticScroll) {
      return;
    }

    cancelSmoothScroll();
  }, { passive: true });

  window.addEventListener("touchstart", () => {
    if (!isProgrammaticScroll) {
      return;
    }

    cancelSmoothScroll();
  }, { passive: true });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncState);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(syncState);
  }

  window.addEventListener("pagehide", () => {
    cancelSmoothScroll();
  }, { once: true });

  syncState();
}

function initOutlineTracking() {
  const sectionNodes = document.querySelectorAll("[data-study-section]");
  const outlineLinks = document.querySelectorAll("[data-outline-link]");
  const outlinePanel = document.querySelector("[data-study-outline-panel]");

  if (!sectionNodes.length || !outlineLinks.length) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 780px)");
  const linkMap = new Map(
    Array.from(outlineLinks).map((link) => [link.dataset.outlineLink, link])
  );
  let currentActiveId = "";
  let observer = null;

  const emitActiveSectionChange = (node) => {
    if (!node) {
      return;
    }

    const totalSections = sectionNodes.length;
    const sectionIndex = Number(node.dataset.studySectionIndex) || 1;
    const progressPercent = Math.round((sectionIndex / Math.max(1, totalSections)) * 100);

    window.dispatchEvent(new CustomEvent("tutor:active-section-change", {
      detail: {
        id: node.id,
        label: node.dataset.studySectionLabel || String(sectionIndex).padStart(2, "0"),
        title: node.dataset.studySectionTitle || "",
        index: sectionIndex,
        total: totalSections,
        progressPercent: clamp(progressPercent, 0, 100),
      },
    }));
  };

  const setActive = (id) => {
    if (id === currentActiveId) {
      return;
    }

    currentActiveId = id;
    const activeLink = linkMap.get(id);
    const activeNode = Array.from(sectionNodes).find((node) => node.id === id) || null;
    outlineLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.outlineLink === id);
    });

    emitActiveSectionChange(activeNode);

    const shouldScrollOutline =
      activeLink
      && (
        !mobileQuery.matches
        || !outlinePanel
        || outlinePanel.classList.contains("is-open")
      );

    if (shouldScrollOutline) {
      activeLink.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  };

  const updateActiveSectionFromScroll = () => {
    const viewportAnchor = Math.max(window.innerHeight * 0.26, 180);
    let activeId = sectionNodes[0].id;

    sectionNodes.forEach((node) => {
      const { top } = node.getBoundingClientRect();
      if (top <= viewportAnchor) {
        activeId = node.id;
      }
    });

    setActive(activeId);
  };

  if (typeof IntersectionObserver === "function") {
    observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (!visibleEntries.length) {
          return;
        }

        const leadingEntry = visibleEntries[0];
        setActive(leadingEntry.target.id);
      },
      {
        root: null,
        rootMargin: "-22% 0px -58% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionNodes.forEach((node) => observer.observe(node));
  }

  const requestUpdate = () => {
    window.requestAnimationFrame(updateActiveSectionFromScroll);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("pagehide", () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    if (observer) {
      observer.disconnect();
    }
  }, { once: true });

  setActive(sectionNodes[0].id);
  updateActiveSectionFromScroll();
}

function slugifyHubId(text) {
  return text
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function normalizeHubTree(items, parentId = "") {
  return items.map((item, index) => {
    const safeName = typeof item.name === "string" ? item.name : `Item ${index + 1}`;
    const id = item.id || [parentId, slugifyHubId(safeName)].filter(Boolean).join("/");
    const type = item.type === "file" ? "file" : "folder";

    if (type === "folder") {
      return {
        ...item,
        id,
        type,
        children: normalizeHubTree(Array.isArray(item.children) ? item.children : [], id),
      };
    }

    return {
      ...item,
      id,
      type,
      href: item.href || "#",
    };
  });
}

function escapeAttribute(value) {
  return escapeHtml(String(value));
}

async function loadNotesCatalog(hub) {
  const catalogUrl = hub.dataset.notesCatalog;
  if (catalogUrl) {
    const response = await fetch(catalogUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${catalogUrl} (${response.status})`);
    }

    return response.json();
  }

  const dataNode = document.querySelector("[data-notes-tree]");
  if (!dataNode) {
    return { items: [] };
  }

  return JSON.parse(dataNode.textContent || "{}");
}

async function initNotesHub() {
  const hub = document.querySelector("[data-notes-hub]");
  if (!hub) {
    return;
  }

  let config;
  try {
    config = await loadNotesCatalog(hub);
  } catch {
    return;
  }

  const tree = normalizeHubTree(Array.isArray(config.items) ? config.items : []);
  const subjectsRoot = document.querySelector("[data-notes-subjects-root]");
  if (!subjectsRoot) {
    return;
  }

  const collectNotes = (items) => items.flatMap((item) => {
    if (item.type === "file") {
      return [item];
    }

    return collectNotes(item.children);
  });

  const renderSubjects = () => {
    subjectsRoot.innerHTML = tree
      .filter((item) => item.type === "folder")
      .map((subject, index) => {
        const notes = collectNotes(subject.children);
        const listId = `subject-list-${index + 1}`;

        return `
          <section class="notes-subject">
            <button
              class="notes-subject__toggle"
              type="button"
              aria-expanded="false"
              aria-controls="${listId}"
            >
              <span class="notes-subject__title">${escapeHtml(subject.name)}</span>
              <span class="notes-subject__count">${notes.length}</span>
            </button>
            <div class="notes-subject__panel" id="${listId}">
              <div class="notes-subject__notes">
                ${notes.length
                  ? notes
                    .map(
                      (note) => `
                        <a class="notes-subject__note" href="${escapeAttribute(note.href || "#")}">
                          <span class="notes-subject__note-title">${escapeHtml(note.name)}</span>
                          ${note.meta ? `<span class="notes-subject__note-meta">${escapeHtml(note.meta)}</span>` : ""}
                        </a>
                      `
                    )
                    .join("")
                  : '<p class="notes-subject__empty">No notes here yet.</p>'}
              </div>
            </div>
          </section>
        `;
      })
      .join("");

    window.dispatchEvent(new CustomEvent("tutor:page-content-ready"));
  };

  subjectsRoot.addEventListener("click", (event) => {
    const toggle = event.target.closest(".notes-subject__toggle");
    if (!toggle) {
      return;
    }

    const subject = toggle.closest(".notes-subject");
    if (!subject) {
      return;
    }

    const isOpen = subject.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  renderSubjects();
}

function initTutorSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!sidebar) {
    return;
  }

  const subjects = Array.from(sidebar.querySelectorAll(".tutor-sidebar__subject"));
  if (!subjects.length) {
    return;
  }

  const setSubjectOpen = (subject, isOpen) => {
    const toggle = subject.querySelector(".tutor-sidebar__subject-toggle");
    const panel = subject.querySelector("ul");

    if (toggle) {
      toggle.setAttribute("aria-expanded", String(isOpen));
    }
    if (panel) {
      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);

      if (isOpen) {
        panel.hidden = false;
        window.requestAnimationFrame(() => {
          panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
          subject.classList.add("is-open");
        });
        return;
      }

      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
      window.requestAnimationFrame(() => {
        subject.classList.remove("is-open");
        panel.style.setProperty("--sidebar-subject-panel-height", "0px");
      });

      const hidePanel = (event) => {
        if (event.target !== panel || event.propertyName !== "max-height") {
          return;
        }
        panel.hidden = true;
        panel.removeEventListener("transitionend", hidePanel);
      };

      panel.addEventListener("transitionend", hidePanel);
      window.setTimeout(() => {
        if (!subject.classList.contains("is-open")) {
          panel.hidden = true;
          panel.removeEventListener("transitionend", hidePanel);
        }
      }, 320);
      return;
    }

    subject.classList.toggle("is-open", isOpen);
  };

  subjects.forEach((subject) => {
    setSubjectOpen(subject, subject.classList.contains("is-open"));
  });

  sidebar.addEventListener("click", (event) => {
    const toggle = event.target.closest(".tutor-sidebar__subject-toggle");
    if (toggle) {
      const subject = toggle.closest(".tutor-sidebar__subject");
      if (!subject) {
        return;
      }

      const shouldOpen = !subject.classList.contains("is-open");
      subjects.forEach((candidate) => {
        setSubjectOpen(candidate, candidate === subject ? shouldOpen : false);
        candidate.classList.toggle("is-active", candidate === subject);
      });
      return;
    }

    const topic = event.target.closest(".tutor-sidebar li a");
    if (!topic) {
      return;
    }

    sidebar.querySelectorAll(".tutor-sidebar li a.is-active").forEach((link) => {
      link.classList.remove("is-active");
    });
    topic.classList.add("is-active");

    const activeSubject = topic.closest(".tutor-sidebar__subject");
    subjects.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === activeSubject);
    });
  });
}

function getSubjectIcon(subjectName) {
  const normalizedName = subjectName.toLowerCase();

  if (normalizedName.includes("law")) {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 4v16"></path>
        <path d="M5 8h14"></path>
        <path d="m7 8-3 6h6Z"></path>
        <path d="m17 8-3 6h6Z"></path>
      </svg>
    `;
  }

  if (normalizedName.includes("data")) {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 8h14"></path>
        <path d="M5 16h14"></path>
        <circle cx="7" cy="8" r="2"></circle>
        <circle cx="17" cy="16" r="2"></circle>
      </svg>
    `;
  }

  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 9h8"></path>
      <path d="M8 15h8"></path>
      <path d="M9 4 5 20"></path>
      <path d="m19 4-4 16"></path>
    </svg>
  `;
}

function collectCatalogNotes(items) {
  return items.flatMap((item) => {
    if (item.type === "file") {
      return [item];
    }

    return collectCatalogNotes(Array.isArray(item.children) ? item.children : []);
  });
}

function normalizeComparableHref(href) {
  try {
    const url = new URL(href, window.location.href);
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(href || "").split("?")[0];
  }
}

function getSidebarActiveHref() {
  const current = normalizeComparableHref(window.location.href);
  const hasReadingHistory = getStoredRecentNotes().length > 0;
  const continueLink = document.querySelector(".tutor-button[href]");
  const continueHref = continueLink ? normalizeComparableHref(continueLink.getAttribute("href")) : "";

  if (!hasReadingHistory && (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html"))) {
    return "";
  }

  return window.location.pathname.endsWith("/")
    || window.location.pathname.endsWith("/index.html")
    ? continueHref
    : current;
}

function getCatalogNoteRows(tree) {
  return tree
    .filter((item) => item.type === "folder")
    .flatMap((subject) => collectCatalogNotes(subject.children).map((note) => ({
      ...note,
      subject: subject.name,
    })));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compactWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getNoteAbsoluteUrl(href) {
  return new URL(href, window.location.href);
}

async function loadSearchableNote(note) {
  const noteUrl = getNoteAbsoluteUrl(note.href);
  const noteHtml = await fetch(noteUrl.href).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${noteUrl.href}`);
    }
    return response.text();
  });

  const sourceMatch = noteHtml.match(/data-markdown-source="([^"]+)"/i);
  if (!sourceMatch) {
    return {
      ...note,
      sections: [],
      searchText: compactWhitespace(`${note.subject} ${note.name} ${note.meta}`),
    };
  }

  const markdownUrl = new URL(sourceMatch[1], noteUrl.href);
  const markdown = await fetch(markdownUrl.href).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${markdownUrl.href}`);
    }
    return response.text();
  });

  const blocks = parseMarkdown(markdown);
  const sections = [];
  const usedSlugs = new Set();
  let activeSection = null;

  const ensureSection = (title = "Guide Overview") => {
    if (activeSection) {
      return activeSection;
    }

    const id = slugify(title, usedSlugs);
    activeSection = {
      id,
      title,
      body: [],
    };
    sections.push(activeSection);
    return activeSection;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 1) {
      return;
    }

    if (block.type === "heading" && block.level === 2) {
      const id = slugify(block.text, usedSlugs);
      activeSection = {
        id,
        title: block.text,
        body: [],
      };
      sections.push(activeSection);
      return;
    }

    const section = ensureSection();

    if (block.type === "paragraph") {
      section.body.push(block.text);
      return;
    }

    if (block.type === "list") {
      section.body.push(block.items.join(" "));
      return;
    }

    if (block.type === "heading") {
      section.body.push(block.text);
    }
  });

  return {
    ...note,
    sections: sections.map((section, index) => ({
      ...section,
      label: String(index + 1).padStart(2, "0"),
      bodyText: compactWhitespace(section.body.join(" ")),
      href: `${note.href.split("#")[0]}#${section.id}`,
    })),
    searchText: compactWhitespace([
      note.subject,
      note.name,
      note.meta,
      ...sections.flatMap((section) => [section.title, section.body.join(" ")]),
    ].join(" ")),
  };
}

function getSearchSnippet(text, query) {
  const normalizedText = compactWhitespace(text);
  const lowerText = normalizedText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return normalizedText.slice(0, 120);
  }

  const start = Math.max(0, matchIndex - 38);
  const end = Math.min(normalizedText.length, matchIndex + lowerQuery.length + 58);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalizedText.length ? "..." : "";
  return `${prefix}${normalizedText.slice(start, end)}${suffix}`;
}

function scoreSearchCandidate(candidate, queryTerms) {
  const title = compactWhitespace(candidate.title || candidate.name || "").toLowerCase();
  const subject = compactWhitespace(candidate.subject || "").toLowerCase();
  const meta = compactWhitespace(candidate.meta || "").toLowerCase();
  const section = compactWhitespace(candidate.sectionTitle || "").toLowerCase();
  const snippet = compactWhitespace(candidate.snippet || "").toLowerCase();

  return queryTerms.reduce((score, term) => {
    let nextScore = score;
    if (title.includes(term)) nextScore += 18;
    if (subject.includes(term)) nextScore += 7;
    if (meta.includes(term)) nextScore += 5;
    if (section.includes(term)) nextScore += 10;
    if (snippet.includes(term)) nextScore += 4;
    if (title.startsWith(term)) nextScore += 8;
    if (section.startsWith(term)) nextScore += 6;
    return nextScore;
  }, 0);
}

function buildSearchResults(query, index) {
  const trimmed = compactWhitespace(query);
  if (!trimmed) {
    return [];
  }

  const queryTerms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = [];

  index.forEach((note) => {
    const titleText = `${note.name} ${note.subject} ${note.meta}`.toLowerCase();
    const titleMatch = queryTerms.every((term) => titleText.includes(term));

    if (titleMatch) {
      matches.push({
        type: "note",
        href: note.href,
        title: note.name,
        subject: note.subject,
        meta: note.meta,
        sectionTitle: "",
        snippet: note.meta || note.subject,
      });
    }

    note.sections.forEach((section) => {
      const corpus = `${note.name} ${note.subject} ${section.title} ${section.bodyText}`.toLowerCase();
      if (!queryTerms.every((term) => corpus.includes(term))) {
        return;
      }

      matches.push({
        type: "section",
        href: section.href,
        title: note.name,
        subject: note.subject,
        meta: note.meta,
        sectionTitle: section.title,
        snippet: getSearchSnippet(section.bodyText || section.title, trimmed),
      });
    });
  });

  const deduped = [];
  const seen = new Set();
  matches
    .sort((left, right) => (
      scoreSearchCandidate(right, queryTerms) - scoreSearchCandidate(left, queryTerms)
    ))
    .forEach((match) => {
      const key = `${match.href}|${match.type}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      deduped.push(match);
    });

  return deduped.slice(0, 8);
}

function renderSidebarSearchResults(resultsRoot, query, results) {
  if (!resultsRoot) {
    return;
  }

  if (!compactWhitespace(query)) {
    resultsRoot.hidden = true;
    resultsRoot.innerHTML = "";
    return;
  }

  if (!results.length) {
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = `
      <div class="tutor-search-results__empty">
        <strong>No matches</strong>
        <span>Try a note title, subject, or a term from inside a note.</span>
      </div>
    `;
    return;
  }

  resultsRoot.hidden = false;
  resultsRoot.innerHTML = results.map((result) => `
    <a class="tutor-search-result" href="${escapeAttribute(result.href)}">
      <span class="tutor-search-result__kind">${result.type === "section" ? "Section" : "Note"}</span>
      <strong>${escapeHtml(result.title)}</strong>
      <small>${escapeHtml(result.subject)} <span>&rsaquo;</span> ${escapeHtml(result.sectionTitle || result.meta || "Note")}</small>
      <p>${escapeHtml(result.snippet || "")}</p>
    </a>
  `).join("");
}

function initSidebarSearch(tree) {
  const input = document.querySelector(".tutor-search__input");
  const resultsRoot = document.querySelector("[data-search-results]");
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!input || !resultsRoot) {
    return;
  }

  const notes = getCatalogNoteRows(tree);
  let searchIndexPromise = null;

  const loadIndex = async () => {
    if (!searchIndexPromise) {
      searchIndexPromise = Promise.all(notes.map(async (note) => {
        try {
          return await loadSearchableNote(note);
        } catch {
          return {
            ...note,
            sections: [],
            searchText: compactWhitespace(`${note.subject} ${note.name} ${note.meta}`),
          };
        }
      }));
    }

    return searchIndexPromise;
  };

  let activeToken = 0;

  const setSearchOpen = (isOpen) => {
    sidebar?.classList.toggle("is-searching", isOpen);
  };

  const runSearch = async () => {
    const query = input.value;
    const token = ++activeToken;
    if (!compactWhitespace(query)) {
      setSearchOpen(false);
      renderSidebarSearchResults(resultsRoot, "", []);
      return;
    }

    setSearchOpen(true);
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = '<div class="tutor-search-results__empty"><strong>Searching...</strong><span>Scanning note titles and sections.</span></div>';

    const index = await loadIndex();
    if (token !== activeToken) {
      return;
    }

    renderSidebarSearchResults(resultsRoot, query, buildSearchResults(query, index));
  };

  input.addEventListener("input", runSearch);
  input.addEventListener("focus", () => {
    if (compactWhitespace(input.value)) {
      runSearch();
    }
  });

  document.addEventListener("click", (event) => {
    if (resultsRoot.contains(event.target) || input.contains(event.target)) {
      return;
    }
    setSearchOpen(false);
    resultsRoot.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      input.focus();
      input.select();
    }

    if (event.key === "Escape" && document.activeElement === input) {
      input.blur();
      setSearchOpen(false);
      resultsRoot.hidden = true;
    }
  });
}

function getRecentDashboardNotes(notes) {
  const notesByHref = new Map(
    notes.map((note) => [normalizeComparableHref(note.href), note])
  );
  const history = getStoredRecentNotes();
  const recent = history
    .map((entry) => {
      const matchedNote = notesByHref.get(normalizeComparableHref(entry.href));
      return {
        href: matchedNote?.href || entry.href,
        name: matchedNote?.name || entry.title,
        subject: matchedNote?.subject || entry.subject || "Notes",
        meta: matchedNote?.meta || entry.meta || "Note",
        sectionId: entry.sectionId || "",
        sectionLabel: entry.sectionLabel || "",
        sectionTitle: entry.sectionTitle || "",
        sectionIndex: entry.sectionIndex || 0,
        totalSections: entry.totalSections || 0,
        progressPercent: entry.progressPercent || 0,
        visitedAt: entry.visitedAt,
      };
    })
    .filter((entry) => entry.href && entry.name);

  return recent;
}

function renderDashboardCatalog(tree, activeHref) {
  const notes = getCatalogNoteRows(tree);
  const hasReadingHistory = getStoredRecentNotes().length > 0;
  const recentNotes = getRecentDashboardNotes(notes);
  const activeNote = recentNotes[0]
    || notes.find((note) => normalizeComparableHref(note.href) === activeHref)
    || notes[0];

  if (activeNote) {
    const hero = document.querySelector(".tutor-hero-note");
    if (hero) {
      const title = hero.querySelector("h1");
      const path = hero.querySelector(".tutor-note-path");
      const sectionMeta = hero.querySelector(".tutor-note-meta__section");
      const openedMeta = hero.querySelector(".tutor-note-meta__opened");
      const button = hero.querySelector(".tutor-button");
      const moreButton = hero.querySelector(".tutor-more");
      const progress = hero.querySelector(".tutor-progress span");
      const progressValue = hero.querySelector(".tutor-progress__value");
      const progressTrack = hero.querySelector(".tutor-progress");

      hero.classList.toggle("is-empty", !hasReadingHistory);

      if (title) {
        title.textContent = hasReadingHistory
          ? (activeNote.name || activeNote.title)
          : "Start reading your notes";
      }
      if (path) {
        path.innerHTML = hasReadingHistory
          ? `${escapeHtml(activeNote.subject)} <span>&rsaquo;</span> ${escapeHtml(activeNote.name || activeNote.title)}`
          : `Choose a subject <span>&rsaquo;</span> Open any note`;
      }
      if (sectionMeta) {
        sectionMeta.textContent = hasReadingHistory
          ? `${activeNote.sectionTitle || activeNote.sectionLabel || "Slide 01"}`
          : "Open your first note";
      }
      if (openedMeta) {
        openedMeta.textContent = hasReadingHistory
          ? `Last opened ${formatRelativeVisitTime(activeNote.visitedAt)}`
          : "Ready when you are";
      }
      if (button) {
        button.setAttribute("href", activeNote.href || "#");
        button.textContent = hasReadingHistory ? "Continue" : "Start Reading";
      }
      if (moreButton) {
        moreButton.hidden = !hasReadingHistory;
      }
      if (progress) {
        progress.style.width = `${clamp(Number(activeNote.progressPercent) || 0, 0, 100)}%`;
      }
      if (progressValue) {
        progressValue.textContent = hasReadingHistory
          ? `${clamp(Number(activeNote.progressPercent) || 0, 0, 100)}%`
          : "0%";
      }
      if (progressTrack) {
        progressTrack.setAttribute(
          "aria-label",
          hasReadingHistory
            ? `${clamp(Number(activeNote.progressPercent) || 0, 0, 100)} percent through ${activeNote.name || activeNote.title}`
            : "No reading progress yet"
        );
      }
    }
  }

  const recentList = document.querySelector(".tutor-note-list");
  if (!recentList || !notes.length) {
    return;
  }

  if (!hasReadingHistory || !recentNotes.length) {
    recentList.innerHTML = "";
    return;
  }

  recentList.innerHTML = recentNotes.slice(0, 4).map((note) => `
    <a class="tutor-note-row" href="${escapeAttribute(note.href || "#")}">
      <span class="tutor-note-row__icon">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6 2h8l4 4v16H6Z"></path>
          <path d="M14 2v5h5"></path>
          <path d="M9 12h6M9 16h6M9 8h2"></path>
        </svg>
      </span>
      <span>
        <strong>${escapeHtml(note.name || note.title)}</strong>
        <small>${escapeHtml(note.subject)} <span>&rsaquo;</span> ${escapeHtml(note.meta || "Note")}</small>
      </span>
      <time>${escapeHtml(formatRelativeVisitTime(note.visitedAt))}</time>
      <span class="tutor-row-arrow">&rsaquo;</span>
    </a>
  `).join("");
}

async function initCatalogSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar[data-sidebar-catalog]");
  const subjectsRoot = document.querySelector("[data-sidebar-subjects-root]");
  if (!sidebar || !subjectsRoot) {
    initTutorSidebar();
    return;
  }

  let config;
  try {
    const response = await fetch(sidebar.dataset.sidebarCatalog);
    if (!response.ok) {
      throw new Error(`Failed to load ${sidebar.dataset.sidebarCatalog}`);
    }
    config = await response.json();
  } catch {
    initTutorSidebar();
    return;
  }

  const tree = normalizeHubTree(Array.isArray(config.items) ? config.items : []);
  const subjects = tree.filter((item) => item.type === "folder");
  const activeHref = getSidebarActiveHref();
  let openSubjectId = "";

  renderDashboardCatalog(tree, activeHref);

  const renderedSubjects = subjects.map((subject, index) => {
    const notes = collectCatalogNotes(subject.children);
    const hasActiveNote = notes.some((note) => normalizeComparableHref(note.href) === activeHref);
    const subjectId = subject.id || slugifyHubId(subject.name);
    const listId = `sidebar-subject-${subjectId || index + 1}`;

    if (hasActiveNote && !openSubjectId) {
      openSubjectId = listId;
    }

    return {
      html: `
        <section class="tutor-sidebar__subject${hasActiveNote ? " is-open is-active" : ""}">
          <button type="button" class="tutor-sidebar__subject-toggle" aria-expanded="${hasActiveNote}" aria-controls="${escapeAttribute(listId)}">
            <span class="tutor-sidebar__subject-icon">${getSubjectIcon(subject.name)}</span>
            <span class="tutor-sidebar__subject-name">${escapeHtml(subject.name)}</span>
            <span class="tutor-sidebar__badge">${notes.length}</span>
            <span class="tutor-sidebar__chevron" aria-hidden="true"></span>
          </button>
          <ul id="${escapeAttribute(listId)}"${hasActiveNote ? "" : " hidden"}>
            ${notes.length
              ? notes.map((note) => {
                const isActive = normalizeComparableHref(note.href) === activeHref;
                return `
                  <li>
                    <a${isActive ? ' class="is-active"' : ""} href="${escapeAttribute(note.href || "#")}" title="${escapeAttribute(note.name)}">
                      ${escapeHtml(note.name)}
                    </a>
                  </li>
                `;
              }).join("")
              : '<li><span class="tutor-sidebar__empty">No notes yet</span></li>'}
          </ul>
        </section>
      `,
      listId,
    };
  });

  subjectsRoot.innerHTML = renderedSubjects.map((subject) => subject.html).join("");

  if (!openSubjectId && getStoredRecentNotes().length > 0) {
    const firstSubject = subjectsRoot.querySelector(".tutor-sidebar__subject");
    if (firstSubject) {
      firstSubject.classList.add("is-open");
      const toggle = firstSubject.querySelector(".tutor-sidebar__subject-toggle");
      const panel = firstSubject.querySelector("ul");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "true");
      }
      if (panel) {
        panel.hidden = false;
      }
    }
  }

  initTutorSidebar();
  initSidebarSearch(tree);
}

async function initMarkdownPage() {
  const page = document.querySelector("[data-markdown-page]");
  const contentRoot = document.querySelector("[data-study-content]");
  const statusRoot = document.querySelector("[data-study-status]");
  if (!page || !contentRoot || !statusRoot) {
    return;
  }

  const source = page.dataset.markdownSource;
  if (!source) {
    return;
  }

  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to load ${source} (${response.status})`);
    }

    const markdown = await response.text();
    const blocks = parseMarkdown(markdown);
    const titleBlock = blocks.find((block) => block.type === "heading" && block.level === 1);
    const introBlock = blocks.find((block, index) => {
      if (block.type !== "paragraph") {
        return false;
      }

      const headingBefore = blocks
        .slice(0, index)
        .some((candidate) => candidate.type === "heading" && candidate.level === 1);

      return !headingBefore;
    });

    const guideBlocks = blocks.filter((block) => block !== introBlock);
    const guideOptions = {
      imageBase: page.dataset.markdownImageBase || "",
    };
    const guide = page.dataset.markdownMode === "mcq"
      ? buildMcqGuide(guideBlocks, guideOptions)
      : buildGuide(guideBlocks, guideOptions);
    const wordCount = countWords(blocks);
    const readTime = Math.max(1, Math.round(wordCount / 220));
    const heroKicker = document.querySelector(".study-hero .study-kicker");
    const subjectLabel = heroKicker ? heroKicker.textContent.split("/")[0].trim() : "";
    const pageTitle = titleBlock ? titleBlock.text : document.title.replace(/\s*\|\s*Tutor Notes\s*$/i, "").trim();
    let latestSectionProgress = null;

    contentRoot.innerHTML = guide.html;
    renderOutline(guide.outline);
    initOutlineTracking();
    window.dispatchEvent(new CustomEvent("tutor:page-content-ready"));

    const persistReadingProgress = () => {
      rememberRecentNote({
        href: window.location.href,
        title: pageTitle || "Untitled note",
        subject: subjectLabel || "Notes",
        meta: `${readTime} min read`,
        sectionId: latestSectionProgress?.id || "",
        sectionLabel: latestSectionProgress?.label || "",
        sectionTitle: latestSectionProgress?.title || "",
        sectionIndex: latestSectionProgress?.index || 0,
        totalSections: latestSectionProgress?.total || guide.sectionCount,
        progressPercent: latestSectionProgress?.progressPercent || 0,
      });
    };

    const getSectionProgressFromNode = (node) => {
      if (!node) {
        return null;
      }

      const sectionIndex = Number(node.dataset.studySectionIndex) || 1;
      const totalSections = guide.sectionCount || 1;
      return {
        id: node.id,
        label: node.dataset.studySectionLabel || String(sectionIndex).padStart(2, "0"),
        title: node.dataset.studySectionTitle || "",
        index: sectionIndex,
        total: totalSections,
        progressPercent: clamp(Math.round((sectionIndex / Math.max(1, totalSections)) * 100), 0, 100),
      };
    };

    const handleActiveSectionChange = (event) => {
      latestSectionProgress = event.detail || null;
      persistReadingProgress();
    };

    window.addEventListener("tutor:active-section-change", handleActiveSectionChange);
    window.addEventListener("pagehide", persistReadingProgress, { once: true });
    latestSectionProgress = getSectionProgressFromNode(contentRoot.querySelector("[data-study-section]"));
    persistReadingProgress();

    setText("[data-study-title]", titleBlock ? titleBlock.text : "Functions in C");
    setText(
      "[data-study-intro]",
      introBlock
        ? introBlock.text
        : page.dataset.markdownIntro || "These notes are laid out in a way that is easier to revise from and easier to teach from."
    );
    
    setText("[data-study-stat='sections']", String(guide.sectionCount));
    setText("[data-study-stat='samples']", String(guide.codeCount));
    setText("[data-study-stat='readTime']", `${readTime} min`);
    setText("[data-study-status-label]", "Ready");
    setText("[data-study-source-name]", source.replace("./", ""));
    statusRoot.textContent = `Pulled in ${guide.sectionCount} sections from ${source.replace("./", "")}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the markdown file.";
    statusRoot.textContent = "Could not load the notes file.";
    setText("[data-study-status-label]", "Error");
    contentRoot.innerHTML = `
      <div class="study-markdown__error">
        <strong>I could not load the notes file.</strong>
        <p>${escapeHtml(message)}</p>
        <p>If this page is being opened as a file instead of through a local server, the browser will usually block the fetch for <code>functions.md</code>.</p>
      </div>
    `;
    window.dispatchEvent(new CustomEvent("tutor:page-content-ready"));
  }
}

function initScrollToTop() {
  const scrollButton = document.querySelector("[data-scroll-to-top]");
  if (!scrollButton) return;

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      scrollButton.classList.add("is-visible");
    } else {
      scrollButton.classList.remove("is-visible");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  scrollButton.addEventListener("click", scrollToTop);

  // Check initial state
  toggleVisibility();
}

function initSidebarSettings() {
  const root = document.querySelector("[data-sidebar-settings]");
  if (!root) {
    return;
  }

  const sidebar = root.closest(".tutor-sidebar");
  const trigger = root.querySelector(".tutor-sidebar__settings");
  const menu = root.querySelector(".tutor-sidebar__settings-menu");

  if (!trigger || !menu) {
    return;
  }

  const TRANSITION_MS = 420;
  let closeTimer = 0;

  const setOpen = (isOpen, { immediate = false } = {}) => {
    window.clearTimeout(closeTimer);

    if (isOpen) {
      if (menu.hidden) {
        menu.hidden = false;
        menu.getBoundingClientRect();
      }
      root.classList.add("is-open");
    } else {
      root.classList.remove("is-open");
    }

    sidebar?.classList.toggle("is-settings-open", isOpen);
    trigger.setAttribute("aria-expanded", String(isOpen));
    trigger.setAttribute("aria-label", isOpen ? "Close settings" : "Open settings");
    trigger.title = isOpen ? "Close settings" : "Open settings";

    if (!isOpen) {
      if (immediate) {
        menu.hidden = true;
      } else {
        closeTimer = window.setTimeout(() => {
          if (!root.classList.contains("is-open")) {
            menu.hidden = true;
          }
        }, TRANSITION_MS);
      }
    }
  };

  trigger.addEventListener("click", () => {
    setOpen(!root.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (root.contains(event.target)) {
      return;
    }

    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      trigger.focus();
    }
  });

  setOpen(false, { immediate: true });
}

function initMobileSidebarDrawer() {
  const dashboard = document.querySelector(".tutor-dashboard");
  const sidebar = document.querySelector(".tutor-sidebar");
  const toggle = document.querySelector(".tutor-mobile-nav-toggle");
  const backdrop = document.querySelector(".tutor-mobile-sidebar-backdrop");

  if (!dashboard || !sidebar || !toggle || !backdrop) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 820px)");

  const setOpen = (isOpen) => {
    const shouldOpen = mobileQuery.matches && isOpen;
    dashboard.classList.toggle("is-mobile-sidebar-open", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    toggle.setAttribute("aria-label", shouldOpen ? "Close subjects" : "Open subjects");
  };

  toggle.addEventListener("click", () => {
    setOpen(!dashboard.classList.contains("is-mobile-sidebar-open"));
  });

  backdrop.addEventListener("click", () => {
    setOpen(false);
  });

  sidebar.addEventListener("click", (event) => {
    if (!mobileQuery.matches) {
      return;
    }

    if (event.target.closest("a[href]")) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  const syncForViewport = () => {
    if (!mobileQuery.matches) {
      setOpen(false);
    }
  };

  if ("addEventListener" in mobileQuery) {
    mobileQuery.addEventListener("change", syncForViewport);
  } else if ("addListener" in mobileQuery) {
    mobileQuery.addListener(syncForViewport);
  }

  setOpen(false);
}

function initDashboardMobileHeaderScroll() {
  const dashboard = document.querySelector(".tutor-dashboard");
  const main = document.querySelector(".tutor-dashboard__main");

  if (!dashboard || !main) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 820px)");

  const sync = () => {
    dashboard.classList.toggle(
      "is-dashboard-scrolled",
      mobileQuery.matches && main.scrollTop > 8
    );
  };

  main.addEventListener("scroll", sync, { passive: true });

  if ("addEventListener" in mobileQuery) {
    mobileQuery.addEventListener("change", sync);
  } else if ("addListener" in mobileQuery) {
    mobileQuery.addListener(sync);
  }

  sync();
}

window.addEventListener("DOMContentLoaded", () => {
  initPageScrollMemory();
  initPwa();
  initCursorToggle();
  initSidebarSettings();
  initStudySettingsMenu();
  initGlobalClickSpark();
  initScrollSoftening();
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
  initOutlineToggle();
  initCatalogSidebar();
  initMobileSidebarDrawer();
  initDashboardMobileHeaderScroll();
  initMarkdownPage();
  initNotesHub();
  initScrollToTop();
});
