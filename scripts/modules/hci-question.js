(() => {
  const themeToggle = document.getElementById("themeToggle");
  const themeStorageKey = "hci-theme";
  const legacyStorageKeys = ["hci-q2-theme", "hci-q3-theme"];

  if (!themeToggle) {
    return;
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    localStorage.setItem(themeStorageKey, theme);
    legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
  }

  const savedTheme = localStorage.getItem(themeStorageKey)
    || legacyStorageKeys.map((key) => localStorage.getItem(key)).find(Boolean);
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
  });
})();
