(() => {
  const getMatch = (query) => window.matchMedia(query).matches;

  function getPerformanceProfile() {
    if (window.__tutorPerformanceProfile) {
      return window.__tutorPerformanceProfile;
    }

    const coarsePointer = getMatch("(hover: none), (pointer: coarse)");
    const hoverCapable = getMatch("(hover: hover)");
    const smallViewport = getMatch("(max-width: 980px)");
    const prefersReducedMotion = getMatch("(prefers-reduced-motion: reduce)");
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const lowPowerMode = Boolean(
      prefersReducedMotion
      || saveData
      || deviceMemory <= 4
      || hardwareConcurrency <= 4
      || (coarsePointer && smallViewport)
    );

    const profile = {
      coarsePointer,
      hoverCapable,
      smallViewport,
      prefersReducedMotion,
      deviceMemory,
      hardwareConcurrency,
      saveData,
      lowPowerMode,
    };

    window.__tutorPerformanceProfile = profile;
    return profile;
  }

  window.__tutorGetPerformanceProfile = getPerformanceProfile;
  const profile = getPerformanceProfile();
  document.documentElement.classList.toggle("is-low-power-device", profile.lowPowerMode);
})();
