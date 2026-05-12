export function bindDismissableLayer({
  root,
  close,
  shouldHandleEscape = () => true,
  shouldIgnorePointerDown = () => false,
} = {}) {
  if (!root || typeof close !== "function") {
    return () => {};
  }

  const handlePointerDown = (event) => {
    if (root.contains(event.target) || shouldIgnorePointerDown(event)) {
      return;
    }
    close();
  };

  const handleClick = (event) => {
    if (root.contains(event.target)) {
      return;
    }
    close();
  };

  const handleKeydown = (event) => {
    if (event.key !== "Escape" || !shouldHandleEscape(event)) {
      return;
    }
    close();
  };

  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown);
    document.removeEventListener("click", handleClick);
    document.removeEventListener("keydown", handleKeydown);
  };
}
