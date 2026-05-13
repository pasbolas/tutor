(() => {
  const themeToggles = Array.from(document.querySelectorAll(".theme-toggle"));
  const themeStorageKey = "hci-theme";
  const legacyStorageKeys = ["hci-q2-theme", "hci-q3-theme", "hci-q4-theme"];

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggles.forEach((themeToggle) => {
      themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
      themeToggle.setAttribute("aria-pressed", String(isDark));
    });
    localStorage.setItem(themeStorageKey, theme);
    legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
  }

  const savedTheme = localStorage.getItem(themeStorageKey)
    || legacyStorageKeys.map((key) => localStorage.getItem(key)).find(Boolean);
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  themeToggles.forEach((themeToggle) => {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(nextTheme);
    });
  });

  const menuButton = document.querySelector(".mobile-menu-button");
  const sidebar = document.querySelector(".sidebar");

  if (menuButton && sidebar) {
    const closeMenu = () => {
      document.body.classList.remove("mobile-menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("mobile-menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    sidebar.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  const mobileContents = document.querySelector("[data-mobile-contents]");
  const mobileContentsNav = mobileContents?.querySelector("nav");

  if (mobileContents && mobileContentsNav && sidebar) {
    const sidebarSections = Array.from(sidebar.querySelectorAll("h3"));

    sidebarSections.forEach((heading) => {
      const list = heading.nextElementSibling;

      if (!list || list.tagName !== "UL") {
        return;
      }

      const sectionHeading = document.createElement("strong");
      sectionHeading.textContent = heading.textContent.trim();
      mobileContentsNav.append(sectionHeading);

      Array.from(list.querySelectorAll("a")).forEach((link) => {
        const mobileLink = link.cloneNode(true);
        mobileContentsNav.append(mobileLink);
      });
    });
  }
})();
