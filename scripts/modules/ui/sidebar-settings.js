import { bindDismissableLayer } from "./dismissable.js";

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

  bindDismissableLayer({
    root,
    close: () => {
      setOpen(false);
      trigger.focus();
    },
  });

  setOpen(false, { immediate: true });
}
