import { closeSoundPanel, createSoundToggle } from "./controls.js";
import {
  cleanupContinuousInteractionListeners,
  bindContinuousInteractionListeners,
} from "./continuous-listeners.js";
import { setMuted, state } from "./config.js";
import { fadeDragSound, fadeScrollSound, setContinuousListenerBinder } from "./engine.js";
import { bindFeedbackListeners } from "./feedback.js";
import { createScrollInstrument } from "./scroll-instrument.js";

setContinuousListenerBinder(bindContinuousInteractionListeners);

function forceMutedForNavigation() {
  setMuted(true);
  state.lastHoverControl = null;
  state.lastFeedbackControl = null;
  fadeDragSound();
  fadeScrollSound();
  closeSoundPanel();
}

window.__tutorInteractionAudio = {
  forceMutedForNavigation,
};

bindFeedbackListeners();
createSoundToggle();
createScrollInstrument();

window.addEventListener("pagehide", cleanupContinuousInteractionListeners);
