export function initPageScrollMemory() {
  if (!("scrollTo" in window)) {
    return;
  }

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const storageKey = `${SCROLL_MEMORY_STORAGE_PREFIX}${window.location.origin}${window.location.pathname}`;
  const maxRestoreAttempts = 28;
  let saveRaf = 0;
  let restoreFrame = 0;
  let restoreAttempts = 0;
  let hasRestored = false;
  let isRestoring = false;
  let restoreSaveTimer = 0;

  const getStoredPosition = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      if (!value) {
        return null;
      }

      const position = JSON.parse(value);
      const top = Number(position.top);
      const left = Number(position.left);
      return {
        top: Number.isFinite(top) ? Math.max(0, top) : 0,
        left: Number.isFinite(left) ? Math.max(0, left) : 0,
      };
    } catch {
      return null;
    }
  };

  const savePosition = () => {
    saveRaf = 0;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        top: window.scrollY || 0,
        left: window.scrollX || 0,
        savedAt: Date.now(),
      }));
    } catch {
      // Scroll memory is an enhancement, so unavailable storage is fine.
    }
  };

  const requestSave = () => {
    if (isRestoring) {
      return;
    }

    if (saveRaf) {
      return;
    }

    saveRaf = window.requestAnimationFrame(savePosition);
  };

  const restorePosition = ({ force = false } = {}) => {
    if (hasRestored && !force) {
      return;
    }

    if (window.location.hash) {
      hasRestored = true;
      return;
    }

    const position = getStoredPosition();
    if (!position) {
      hasRestored = true;
      return;
    }

    if (restoreFrame) {
      window.cancelAnimationFrame(restoreFrame);
    }

    restoreAttempts = 0;

    const attemptRestore = () => {
      restoreFrame = 0;
      restoreAttempts += 1;
      isRestoring = true;

      if (restoreSaveTimer) {
        window.clearTimeout(restoreSaveTimer);
        restoreSaveTimer = 0;
      }

      const maxTop = Math.max(
        0,
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - window.innerHeight;
      const nextTop = Math.min(position.top, Math.max(0, maxTop));
      const canReachSavedPosition = position.top <= maxTop || restoreAttempts >= maxRestoreAttempts;

      window.scrollTo({
        left: position.left,
        top: nextTop,
        behavior: "auto",
      });

      if (!canReachSavedPosition) {
        restoreFrame = window.requestAnimationFrame(attemptRestore);
        return;
      }

      hasRestored = true;
      restoreSaveTimer = window.setTimeout(() => {
        isRestoring = false;
        restoreSaveTimer = 0;
      }, 120);
    };

    restoreFrame = window.requestAnimationFrame(attemptRestore);
  };

  window.addEventListener("scroll", requestSave, { passive: true });
  window.addEventListener("pagehide", savePosition);
  window.addEventListener("beforeunload", savePosition);
  window.addEventListener("load", () => restorePosition({ force: true }), { once: true });
  window.addEventListener("tutor:page-content-ready", () => restorePosition({ force: true }));
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      restorePosition({ force: true });
    }
  });

  restorePosition();
}
