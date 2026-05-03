import {
  clamp,
  hideScrollInstrumentOnMobile,
  prefersReducedMotion,
  state,
} from "./config.js";

function collectScrollInstrumentSections() {
  const studySections = Array.from(document.querySelectorAll("[data-study-section]"));
  const candidates = studySections.length
    ? studySections
    : Array.from(document.querySelectorAll("main .panel[id], section[id]"));
  const unique = new Set();

  return candidates.filter((section) => {
    if (!section.id || unique.has(section.id)) {
      return false;
    }

    unique.add(section.id);
    return true;
  });
}

function getSectionTitle(section) {
  if (!section) {
    return "";
  }

  const heading = section.querySelector(
    ".study-markdown__section-header h2, .notes-minimal__header h1, h2, h1"
  );

  return heading ? heading.textContent.trim() : "";
}

function updateScrollInstrumentTitleState() {
  if (!state.scrollInstrumentSections.length) {
    state.scrollInstrumentTitleWidth = 0;
    state.scrollInstrumentTitlePresence = 0;
    state.scrollInstrumentMarkerWidth = 18;
    return;
  }

  const anchorY = window.innerHeight * 0.34;
  let bestSection = null;
  let bestScore = Number.POSITIVE_INFINITY;

  state.scrollInstrumentSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const heading = section.querySelector(".study-markdown__section-header h2, h2, h1");
    const titleRect = heading ? heading.getBoundingClientRect() : rect;
    const sectionInView = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.08;

    if (!sectionInView) {
      return;
    }

    const score = Math.abs(Math.min(Math.max(titleRect.top, 0), window.innerHeight) - anchorY);
    if (score < bestScore) {
      bestScore = score;
      bestSection = section;
    }
  });

  if (!bestSection) {
    state.scrollInstrumentTitleWidth = 0;
    state.scrollInstrumentTitlePresence = 0;
    state.scrollInstrumentMarkerWidth = 18;
    return;
  }

  const title = getSectionTitle(bestSection);
  const heading = bestSection.querySelector(".study-markdown__section-header h2, h2, h1");
  const titleRect = heading ? heading.getBoundingClientRect() : bestSection.getBoundingClientRect();
  const distance = Math.abs(titleRect.top - anchorY);
  const presence = clamp(1 - (distance / Math.max(180, window.innerHeight * 0.42)), 0.18, 1);
  const titleWidth = clamp(title.length * 0.52, 12, 34);

  state.scrollInstrumentTitleWidth = titleWidth;
  state.scrollInstrumentTitlePresence = presence;
  state.scrollInstrumentMarkerWidth = 18 + titleWidth * presence;
  state.scrollInstrumentMarker.dataset.title = title;
}

function getScrollProgress() {
  const maxScrollable = Math.max(
    1,
    (document.documentElement.scrollHeight || 0) - window.innerHeight
  );

  return clamp((window.scrollY || window.pageYOffset || 0) / maxScrollable, 0, 1);
}

function measureScrollInstrument() {
  if (!state.scrollInstrumentMarker || state.scrollInstrumentTicks.length < 2) {
    return;
  }

  state.scrollInstrumentTop = state.scrollInstrumentTicks[0].offsetTop;
  state.scrollInstrumentPitch = state.scrollInstrumentTicks[1].offsetTop - state.scrollInstrumentTicks[0].offsetTop;
}

function updateScrollInstrumentTarget() {
  if (!state.scrollInstrumentTicks.length) {
    return;
  }

  const maxIndex = state.scrollInstrumentTicks.length - 1;
  state.scrollInstrumentTarget = getScrollProgress() * maxIndex;
}

function renderScrollInstrument() {
  state.scrollInstrumentRaf = 0;

  if (!state.scrollInstrumentMarker || !state.scrollInstrumentTicks.length) {
    return;
  }

  const delta = state.scrollInstrumentTarget - state.scrollInstrumentCurrent;
  if (prefersReducedMotion) {
    state.scrollInstrumentCurrent = state.scrollInstrumentTarget;
  } else {
    state.scrollInstrumentCurrent += delta * 0.2;
  }

  if (Math.abs(delta) < 0.0008) {
    state.scrollInstrumentCurrent = state.scrollInstrumentTarget;
  }

  const markerY = state.scrollInstrumentTop + state.scrollInstrumentCurrent * state.scrollInstrumentPitch;
  state.scrollInstrumentMarker.style.transform = `translate(-50%, ${markerY}px)`;
  state.scrollInstrumentMarker.style.setProperty("--instrument-marker-width", `${state.scrollInstrumentMarkerWidth}px`);

  const activeIndex = Math.round(state.scrollInstrumentCurrent);
  if (activeIndex !== state.scrollInstrumentActiveIndex) {
    if (state.scrollInstrumentTicks[state.scrollInstrumentActiveIndex]) {
      state.scrollInstrumentTicks[state.scrollInstrumentActiveIndex].classList.remove("is-active");
    }

    if (state.scrollInstrumentTicks[activeIndex]) {
      state.scrollInstrumentTicks[activeIndex].classList.add("is-active");
    }

    state.scrollInstrumentActiveIndex = activeIndex;
  }

  state.scrollInstrumentPulse = Math.max(0, state.scrollInstrumentPulse * 0.86 - 0.008);
  state.scrollInstrumentMarker.style.setProperty("--instrument-pulse", String(state.scrollInstrumentPulse));

  if (Math.abs(delta) > 0.0008 || state.scrollInstrumentPulse > 0.014) {
    scheduleScrollInstrumentRender();
  }
}

function scheduleScrollInstrumentRender() {
  if (state.scrollInstrumentRaf || !state.scrollInstrumentMarker || !state.scrollInstrumentTicks.length) {
    return;
  }

  state.scrollInstrumentRaf = window.requestAnimationFrame(renderScrollInstrument);
}

export function pulseScrollInstrument(intensity = 0.5) {
  if (!state.scrollInstrumentMarker) {
    return;
  }

  const nextPulse = 0.24 + clamp(intensity, 0.2, 1) * 0.72;
  state.scrollInstrumentPulse = Math.max(state.scrollInstrumentPulse, nextPulse);
  scheduleScrollInstrumentRender();
}

export function createScrollInstrument() {
  if (hideScrollInstrumentOnMobile || state.scrollInstrumentRoot || document.querySelector(".tutor-dashboard")) {
    return;
  }

  const root = document.createElement("nav");
  root.className = "site-scroll-instrument";
  root.setAttribute("aria-label", "Scroll progress");

  const ticksWrap = document.createElement("div");
  ticksWrap.className = "site-scroll-instrument__ticks";

  const marker = document.createElement("div");
  marker.className = "site-scroll-instrument__marker";
  marker.setAttribute("aria-hidden", "true");

  const tickCount = Math.max(14, Math.min(22, Math.round(window.innerHeight / 52)));
  const ticks = [];

  for (let index = 0; index < tickCount; index += 1) {
    const tick = document.createElement("button");
    tick.type = "button";
    tick.className = "site-scroll-instrument__tick";
    tick.setAttribute("aria-label", `Jump to ${Math.round((index / Math.max(1, tickCount - 1)) * 100)}%`);

    tick.addEventListener("click", () => {
      const ratio = index / Math.max(1, tickCount - 1);
      const sections = state.scrollInstrumentSections;

      if (sections.length > 1) {
        const sectionIndex = Math.round(ratio * (sections.length - 1));
        sections[sectionIndex].scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const maxScrollable = Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight);
      window.scrollTo({ top: maxScrollable * ratio, behavior: "smooth" });
    });

    ticks.push(tick);
    ticksWrap.appendChild(tick);
  }

  ticksWrap.appendChild(marker);
  root.append(ticksWrap);
  document.body.appendChild(root);

  state.scrollInstrumentRoot = root;
  state.scrollInstrumentTicks = ticks;
  state.scrollInstrumentMarker = marker;
  state.scrollInstrumentSections = collectScrollInstrumentSections();

  let syncRaf = 0;
  const syncInstrument = () => {
    syncRaf = 0;
    state.scrollInstrumentSections = collectScrollInstrumentSections();
    measureScrollInstrument();
    updateScrollInstrumentTarget();
    updateScrollInstrumentTitleState();
    scheduleScrollInstrumentRender();
  };

  const requestSync = () => {
    if (!syncRaf) {
      syncRaf = window.requestAnimationFrame(syncInstrument);
    }
  };

  window.addEventListener("resize", requestSync, { passive: true });
  window.addEventListener("scroll", requestSync, { passive: true });

  measureScrollInstrument();
  updateScrollInstrumentTarget();
  updateScrollInstrumentTitleState();
  state.scrollInstrumentCurrent = state.scrollInstrumentTarget;
  scheduleScrollInstrumentRender();
}
