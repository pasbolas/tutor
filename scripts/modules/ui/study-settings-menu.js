import { getStoredCursorMode, setStoredCursorMode } from "../shared.js";
import { createCursorToggleButton, syncCursorToggleButton } from "./cursor-toggle.js";

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

