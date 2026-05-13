(() => {
  const themeToggle = document.getElementById("themeToggle");
  const themeStorageKey = "hci-theme";
  const legacyStorageKey = "hci-q2-theme";

  if (!themeToggle) {
    return;
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    localStorage.setItem(themeStorageKey, theme);
    localStorage.removeItem(legacyStorageKey);
  }

  const savedTheme = localStorage.getItem(themeStorageKey) || localStorage.getItem(legacyStorageKey);
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
  });
})();
