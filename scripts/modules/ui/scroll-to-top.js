export function initScrollToTop() {
  const scrollButton = document.querySelector("[data-scroll-to-top]");
  if (!scrollButton) return;

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      scrollButton.classList.add("is-visible");
    } else {
      scrollButton.classList.remove("is-visible");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  scrollButton.addEventListener("click", scrollToTop);

  // Check initial state
  toggleVisibility();
}
