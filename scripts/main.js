import {
  initCursorToggle,
  initDashboardMobileHeaderScroll,
  initGlobalClickSpark,
  initMobileSidebarDrawer,
  initPageScrollMemory,
  initPwa,
  initScrollSoftening,
  initScrollToTop,
  initSidebarSettings,
  initStudySettingsMenu,
} from "./modules/ui.js?v=20260503-2";
import { initDashboardGreeting } from "./modules/greetings.js?v=20260503-1";
import { initCatalogSidebar, initNotesHub } from "./modules/catalog.js";
import { initMarkdownPage, initOutlineToggle } from "./modules/markdown.js";

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
  initDashboardGreeting();
  initDashboardMobileHeaderScroll();
  initMarkdownPage();
  initNotesHub();
  initScrollToTop();
});
