export function initGlobalClickSpark() {
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotionQuery.matches) {
    return;
  }

  let sparkRoot = null;
  let pendingRaf = 0;
  let queuedClick = null;

  const createSparkRoot = () => {
    if (sparkRoot) {
      return;
    }

    sparkRoot = document.createElement("div");
    sparkRoot.className = "click-spark-overlay";
    sparkRoot.setAttribute("aria-hidden", "true");
    document.body.appendChild(sparkRoot);
  };

  const renderSpark = (x, y) => {
    if (!sparkRoot) {
      return;
    }

    const spark = document.createElement("span");
    spark.className = "click-spark";
    spark.style.setProperty("--spark-x", `${x}px`);
    spark.style.setProperty("--spark-y", `${y}px`);
    sparkRoot.appendChild(spark);

    spark.addEventListener("animationend", () => {
      spark.remove();
    });
  };

  const requestSpark = (x, y) => {
    queuedClick = { x, y };

    if (pendingRaf) {
      return;
    }

    pendingRaf = window.requestAnimationFrame(() => {
      pendingRaf = 0;
      if (!queuedClick) {
        return;
      }
      renderSpark(queuedClick.x, queuedClick.y);
      queuedClick = null;
    });
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    createSparkRoot();
    requestSpark(event.clientX, event.clientY);
  });
}
