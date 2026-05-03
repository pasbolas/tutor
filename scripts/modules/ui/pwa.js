export function initPwa() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
    // Ignore registration errors on unsupported contexts.
  });
}
