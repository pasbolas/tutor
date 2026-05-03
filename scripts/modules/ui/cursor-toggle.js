import { getStoredCursorMode, setStoredCursorMode } from "../shared.js";

export function createCursorToggleButton() {
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

export function syncCursorToggleButton(button, controller) {
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

