import {
  SCROLL_MEMORY_STORAGE_PREFIX,
  getStoredCursorMode,
  setStoredCursorMode,
} from "./shared.js";

export function initPageScrollMemory() {
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

export function initPwa() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
    // Ignore registration errors on unsupported contexts.
  });
}

export function initGlobalClickSpark() {
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotionQuery.matches) {
    return;
  }

  let sparkRoot = null;
  let pendingRaf = 0;
  let queuedClick = null;

  const createSparkRoot = () => {
    if (sparkRoot) {
      return;
    }

    sparkRoot = document.createElement("div");
    sparkRoot.className = "click-spark-overlay";
    sparkRoot.setAttribute("aria-hidden", "true");
    document.body.appendChild(sparkRoot);
  };

  const renderSpark = (x, y) => {
    if (!sparkRoot) {
      return;
    }

    const spark = document.createElement("span");
    spark.className = "click-spark";
    spark.style.setProperty("--spark-x", `${x}px`);
    spark.style.setProperty("--spark-y", `${y}px`);
    sparkRoot.appendChild(spark);

    spark.addEventListener("animationend", () => {
      spark.remove();
    });
  };

  const requestSpark = (x, y) => {
    queuedClick = { x, y };

    if (pendingRaf) {
      return;
    }

    pendingRaf = window.requestAnimationFrame(() => {
      pendingRaf = 0;
      if (!queuedClick) {
        return;
      }
      renderSpark(queuedClick.x, queuedClick.y);
      queuedClick = null;
    });
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    createSparkRoot();
    requestSpark(event.clientX, event.clientY);
  });
}

export function initScrollSoftening() {
  let scrollRaf = 0;
  let scrollEndTimer = 0;

  const clearScrollEndTimer = () => {
    if (!scrollEndTimer) {
      return;
    }

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = 0;
  };

  const endScroll = () => {
    document.body.classList.remove("is-page-scrolling");
    scrollEndTimer = 0;
  };

  const markScrolling = () => {
    scrollRaf = 0;

    if (!document.body.classList.contains("is-page-scrolling")) {
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

export function initCursorToggle() {
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

export function initStudySettingsMenu() {
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

    if (soundControl) {
      const soundButton = appendMenuItem(soundControl);
      soundButton.classList.add("study-settings__sound");
    }
  }

  settings.appendChild(trigger);
  settings.appendChild(menu);
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
    if (!settings.classList.contains("is-open")) {
      return;
    }

    settings.classList.remove("is-open");
    closeTimer = 0;

    hideTimer = window.setTimeout(() => {
      menu.hidden = true;
      hideTimer = 0;
    }, 240);
    trigger.setAttribute("aria-expanded", "false");
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

export function initScrollToTop() {
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

export function initSidebarSettings() {
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

export function initMobileSidebarDrawer() {
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

export function initDashboardMobileHeaderScroll() {
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
