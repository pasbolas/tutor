(() => {
  if (window.__tutorInteractionAudioInitialized) {
    return;
  }

  window.__tutorInteractionAudioInitialized = true;
  import("./audio/main.js").catch(() => {});
})();
