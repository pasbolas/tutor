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
