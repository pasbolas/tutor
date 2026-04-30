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
} from "./modules/ui.js";
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
  initDashboardMobileHeaderScroll();
  initMarkdownPage();
  initNotesHub();
  initScrollToTop();
});
