const THEME_STORAGE_KEY = "tutor-notes-theme";
const CURSOR_STORAGE_KEY = "tutor-notes-cursor-mode";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : "";
  } catch {
    return "";
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}

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

function applyTheme(theme, options = {}) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  if (options.persist) {
    setStoredTheme(nextTheme);
  }
}

applyTheme(getStoredTheme() || getSystemTheme());

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
      return /(^|\/)script\.js$/i.test(new URL(script.src).pathname);
    } catch {
      return false;
    }
  });
  const scriptUrl = scriptNode ? scriptNode.src : new URL("./script.js", window.location.href).href;
  const serviceWorkerUrl = new URL("./sw.js", scriptUrl);
  const scope = new URL("./", scriptUrl);
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

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function createThemeToggleButton() {
  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  button.dataset.themeToggle = "";
  button.innerHTML = `
    <span class="theme-toggle__track" aria-hidden="true">
      <span class="theme-toggle__thumb"></span>
    </span>
    <span class="theme-toggle__label">Dark</span>
  `;

  return button;
}

function syncThemeToggleButton(button) {
  const isDark = getCurrentTheme() === "dark";
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  button.title = isDark ? "Switch to light mode" : "Switch to dark mode";

  const label = button.querySelector(".theme-toggle__label");
  if (label) {
    label.textContent = isDark ? "Light" : "Dark";
  }
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

function initThemeToggle() {
  if (document.querySelector("[data-markdown-page]")) {
    return;
  }

  const topbars = document.querySelectorAll(".study-topbar");
  if (!topbars.length) {
    return;
  }

  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const buttons = [];

  const syncButtons = () => {
    buttons.forEach((button) => {
      syncThemeToggleButton(button);
    });
  };

  topbars.forEach((topbar) => {
    if (topbar.querySelector("[data-theme-toggle]")) {
      return;
    }

    const button = createThemeToggleButton();

    const nav = topbar.querySelector(".study-topbar__nav");
    if (nav) {
      nav.appendChild(button);
    } else {
      topbar.appendChild(button);
    }

    button.addEventListener("click", () => {
      const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme, { persist: true });
      syncButtons();
    });

    buttons.push(button);
  });

  const handleSystemThemeChange = () => {
    if (getStoredTheme()) {
      return;
    }

    applyTheme(getSystemTheme());
    syncButtons();
  };

  if (typeof systemThemeQuery.addEventListener === "function") {
    systemThemeQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemThemeQuery.addListener === "function") {
    systemThemeQuery.addListener(handleSystemThemeChange);
  }

  window.addEventListener("pagehide", () => {
    if (typeof systemThemeQuery.removeEventListener === "function") {
      systemThemeQuery.removeEventListener("change", handleSystemThemeChange);
    } else if (typeof systemThemeQuery.removeListener === "function") {
      systemThemeQuery.removeListener(handleSystemThemeChange);
    }
  }, { once: true });

  syncButtons();
}

function initCursorToggle() {
  if (document.querySelector("[data-markdown-page]")) {
    return;
  }

  const topbars = document.querySelectorAll(".study-topbar");
  const controller = window.__tutorCursorController;

  if (!topbars.length || !controller || typeof controller.setMode !== "function") {
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

  topbars.forEach((topbar) => {
    if (topbar.querySelector("[data-cursor-toggle]")) {
      return;
    }

    const button = createCursorToggleButton();

    const nav = topbar.querySelector(".study-topbar__nav");
    if (nav) {
      nav.appendChild(button);
    } else {
      topbar.appendChild(button);
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

  const themeButton = appendMenuItem(createThemeToggleButton());
  const syncThemeButton = () => {
    syncThemeToggleButton(themeButton);
  };

  themeButton.addEventListener("click", () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme, { persist: true });
    syncThemeButton();
  });

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

  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (getStoredTheme()) {
      return;
    }

    applyTheme(getSystemTheme());
    syncThemeButton();
  };

  if (typeof systemThemeQuery.addEventListener === "function") {
    systemThemeQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemThemeQuery.addListener === "function") {
    systemThemeQuery.addListener(handleSystemThemeChange);
  }

  window.addEventListener("pagehide", () => {
    if (typeof systemThemeQuery.removeEventListener === "function") {
      systemThemeQuery.removeEventListener("change", handleSystemThemeChange);
    } else if (typeof systemThemeQuery.removeListener === "function") {
      systemThemeQuery.removeListener(handleSystemThemeChange);
    }
  }, { once: true });

  syncThemeButton();
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
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let html = "";
  let lastIndex = 0;
  let match = pattern.exec(text);

  while (match) {
    html += escapeHtml(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith("`")) {
      html += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
    } else {
      html += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
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

      paragraphLines.push(currentLine.trim());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
  }

  return blocks;
}

function renderBlock(block, options = {}) {
  if (block.type === "paragraph") {
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
      `<section class="study-markdown__section" id="${id}" data-study-section>`,
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

  const setActive = (id) => {
    if (id === currentActiveId) {
      return;
    }

    currentActiveId = id;
    const activeLink = linkMap.get(id);
    outlineLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.outlineLink === id);
    });

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

function flattenHubTree(items, bucket = []) {
  items.forEach((item) => {
    bucket.push(item);
    if (item.type === "folder") {
      flattenHubTree(item.children, bucket);
    }
  });
  return bucket;
}

function escapeAttribute(value) {
  return escapeHtml(String(value));
}

function initNotesHub() {
  const hub = document.querySelector("[data-notes-hub]");
  if (!hub) {
    return;
  }

  const dataNode = document.querySelector("[data-notes-tree]");
  if (!dataNode) {
    return;
  }

  let config;
  try {
    config = JSON.parse(dataNode.textContent || "{}");
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
    const guide = buildGuide(guideBlocks, {
      imageBase: page.dataset.markdownImageBase || "",
    });
    const wordCount = countWords(blocks);
    const readTime = Math.max(1, Math.round(wordCount / 220));

    contentRoot.innerHTML = guide.html;
    renderOutline(guide.outline);
    initOutlineTracking();

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
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initPwa();
  initThemeToggle();
  initCursorToggle();
  initStudySettingsMenu();
  initGlobalClickSpark();
  initScrollSoftening();
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
  initOutlineToggle();
  initMarkdownPage();
  initNotesHub();
});
