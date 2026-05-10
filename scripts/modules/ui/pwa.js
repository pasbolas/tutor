export function initPwa() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  const appRoot = new URL("../../../", import.meta.url);
  const serviceWorkerUrl = new URL("sw.js", appRoot);

  navigator.serviceWorker.register(serviceWorkerUrl.href, { scope: appRoot.pathname }).catch(() => {
    // Ignore registration errors on unsupported contexts.
  });
}
