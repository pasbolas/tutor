(() => {
  function initGlobalNotesNavigation() {
    if (document.querySelector(".tutor-dashboard, [data-global-notes-navigation]")) return;

    const style = document.createElement("style");
    style.textContent = `
      :root { --global-notes-nav-offset: .75rem; }
      .global-notes-nav {
        position: fixed;
        top: max(var(--global-notes-nav-offset), env(safe-area-inset-top, 0px));
        left: max(var(--global-notes-nav-offset), env(safe-area-inset-left, 0px));
        z-index: 10000;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .45rem;
        min-width: 7.25rem;
        height: 2.5rem;
        padding: 0 .9rem;
        border: 1px solid rgba(224, 138, 118, .42);
        border-radius: 999px;
        background: rgba(26, 23, 21, .94);
        color: #f3eadf;
        box-shadow: 0 8px 24px rgba(0, 0, 0, .24);
        font: 700 .75rem/1 Inter, system-ui, sans-serif;
        letter-spacing: .02em;
        text-decoration: none;
        backdrop-filter: blur(14px);
        transition: border-color 140ms ease, transform 140ms ease, background 140ms ease;
      }
      .global-notes-nav:hover,
      .global-notes-nav:focus-visible {
        border-color: rgba(224, 138, 118, .9);
        background: rgba(46, 37, 33, .98);
        color: #fff;
        transform: translateX(-2px);
        outline: none;
      }
      .global-notes-nav__arrow { font-size: 1.05rem; line-height: 1; }
      .topbar-mini .global-notes-nav {
        position: static;
        flex: none;
      }
      .study-outline__back,
      .pdf-reader [data-pdf-back],
      .topbar-mini > .wrap > .back-btn,
      .wiki-shell .back-button { display: none !important; }
      @media (max-width: 780px) {
        :root { --global-notes-nav-offset: .65rem; }
        .global-notes-nav { min-width: 2.5rem; width: 2.5rem; padding: 0; }
        .global-notes-nav__label {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
      }
    `;

    const link = document.createElement("a");
    link.className = "global-notes-nav";
    link.href = "/";
    link.dataset.globalNotesNavigation = "";
    link.setAttribute("aria-label", "Back to all notes");
    link.innerHTML = '<span class="global-notes-nav__arrow" aria-hidden="true">&larr;</span><span class="global-notes-nav__label">All notes</span>';
    document.head.append(style);

    const databaseTopbar = document.querySelector(".topbar-mini > .wrap");
    if (databaseTopbar) {
      databaseTopbar.prepend(link);
    } else {
      document.body.append(link);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobalNotesNavigation, { once: true });
  } else {
    initGlobalNotesNavigation();
  }
})();
