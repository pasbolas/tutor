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
