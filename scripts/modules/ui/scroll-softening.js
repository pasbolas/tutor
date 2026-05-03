export function initScrollSoftening() {
  let scrollRaf = 0;
  let scrollEndTimer = 0;

  const clearScrollEndTimer = () => {
    if (!scrollEndTimer) {
      return;
    }

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = 0;
  };

  const endScroll = () => {
    document.body.classList.remove("is-page-scrolling");
    scrollEndTimer = 0;
  };

  const markScrolling = () => {
    scrollRaf = 0;

    if (!document.body.classList.contains("is-page-scrolling")) {
      document.body.classList.add("is-page-scrolling");
    }

    clearScrollEndTimer();
    scrollEndTimer = window.setTimeout(endScroll, 135);
  };

  const handleScroll = () => {
    if (scrollRaf) {
      return;
    }

    scrollRaf = window.requestAnimationFrame(markScrolling);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("pagehide", () => {
    if (scrollRaf) {
      window.cancelAnimationFrame(scrollRaf);
    }

    clearScrollEndTimer();
    document.body.classList.remove("is-page-scrolling");
  }, { once: true });
}
