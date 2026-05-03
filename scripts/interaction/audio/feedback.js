import { getNow, state, supportsHover } from "./config.js";
import {
  ensureAudio,
  playClickSound,
  playHoverExpandSound,
  playToggleSound,
} from "./engine.js";

export function getControl(target) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest("a[href], button, [role='button'], [role='radio'], [aria-pressed], [aria-checked]");
}

function isToggleControl(control) {
  if (!control) {
    return false;
  }

  return (
    control.matches("[role='radio'], [aria-pressed], [aria-checked]") ||
    control.hasAttribute("data-sound-toggle") ||
    control.hasAttribute("data-hackathons-mode") ||
    control.closest("[data-hackathons-toggle]")
  );
}

function pulseElement(element) {
  if (!element) {
    return;
  }

  element.classList.remove("interactive-clicking");
  void element.offsetWidth;
  element.classList.add("interactive-clicking");

  window.setTimeout(() => {
    element.classList.remove("interactive-clicking");
  }, 280);
}

export async function triggerActivationFeedback(control) {
  if (!control) {
    return;
  }

  state.lastFeedbackControl = control;
  state.lastFeedbackTime = getNow();
  pulseElement(control);

  if (control.hasAttribute("data-sound-toggle")) {
    return;
  }

  if (!control.closest(".site-sound-control")) {
    return;
  }

  const context = await ensureAudio();
  if (!context || state.muted) {
    return;
  }

  if (isToggleControl(control)) {
    playToggleSound();
    return;
  }

  playClickSound();
}

export function handleHoverStart(target) {
  const control = getControl(target);
  if (!control || control === state.lastHoverControl || !state.unlocked || state.muted) {
    return;
  }

  state.lastHoverControl = control;
  playHoverExpandSound();
}

export function bindFeedbackListeners() {
  document.addEventListener(
    "pointerdown",
    (event) => {
      const control = getControl(event.target);
      state.lastPointerControl = control;
      state.lastPointerTime = getNow();

      if (control) {
        triggerActivationFeedback(control).catch(() => {});
      }
    },
    { passive: true }
  );

  document.addEventListener("click", (event) => {
    const control = getControl(event.target);
    if (!control) {
      return;
    }

    if (control === state.lastPointerControl && getNow() - state.lastPointerTime < 320) {
      return;
    }

    if (control === state.lastFeedbackControl && getNow() - state.lastFeedbackTime < 320) {
      return;
    }

    triggerActivationFeedback(control).catch(() => {});
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const control = getControl(event.target);
    if (control) {
      triggerActivationFeedback(control).catch(() => {});
    }
  });

  document.addEventListener("mouseover", (event) => {
    if (supportsHover) {
      handleHoverStart(event.target);
    }
  });

  document.addEventListener("focusin", (event) => {
    handleHoverStart(event.target);
  });

  document.addEventListener("mouseout", (event) => {
    const control = getControl(event.target);
    const relatedControl = getControl(event.relatedTarget);

    if (control && control === state.lastHoverControl && control !== relatedControl) {
      state.lastHoverControl = null;
    }
  });
}
