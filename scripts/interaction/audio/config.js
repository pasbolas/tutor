export const profile = window.__tutorPerformanceProfile || {
  hoverCapable: window.matchMedia("(hover: hover)").matches,
  coarsePointer: window.matchMedia("(hover: none), (pointer: coarse)").matches,
  smallViewport: window.matchMedia("(max-width: 980px)").matches,
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

export const AudioContextClass = window.AudioContext || window.webkitAudioContext;
export const supportsHover = profile.hoverCapable;
export const hideSoundToggleOnMobile = profile.coarsePointer || window.matchMedia("(max-width: 720px)").matches;
export const hideScrollInstrumentOnMobile = profile.coarsePointer || profile.smallViewport;
export const prefersReducedMotion = profile.prefersReducedMotion;

export const SOUND_STORAGE_KEY = "tutor-interaction-sound-muted";
export const VOLUME_STORAGE_KEY = "tutor-interaction-sound-volume";
export const DEFAULT_VOLUME = 1;
export const MAX_MASTER_GAIN = 3.1;
export const SCROLL_TICK_SPACING_PX = 42;
export const MAX_SCROLL_TICKS_PER_FRAME = 6;

export const state = {
  ctx: null,
  masterGain: null,
  dragSource: null,
  dragGain: null,
  dragFilter: null,
  dragPan: null,
  dragStarted: false,
  scrollSource: null,
  scrollGain: null,
  scrollFilter: null,
  scrollShaper: null,
  scrollDetailSource: null,
  scrollDetailGain: null,
  scrollDetailFilter: null,
  scrollStarted: false,
  unlocked: false,
  muted: false,
  volume: DEFAULT_VOLUME,
  soundControl: null,
  soundToggle: null,
  soundToggleLabel: null,
  volumeSlider: null,
  volumeValue: null,
  lastHoverControl: null,
  lastFeedbackControl: null,
  lastFeedbackTime: 0,
  lastPointerControl: null,
  lastPointerTime: 0,
  lastMoveX: 0,
  lastMoveY: 0,
  lastMoveAt: 0,
  smoothedSpeed: 0,
  idleTimer: 0,
  dragSoundRaf: 0,
  pendingDragSpeed: 0,
  pendingDragX: 0,
  lastScrollY: window.scrollY || window.pageYOffset || 0,
  lastScrollAt: 0,
  scrollTickCarry: 0,
  scrollIdleTimer: 0,
  pendingScrollDelta: 0,
  scrollPendingSpeed: 0,
  scrollPendingDirection: 1,
  scrollDrift: 0,
  scrollRaf: 0,
  continuousListenersBound: false,
  handleMouseMove: null,
  handleMouseLeave: null,
  handleScroll: null,
  scrollInstrumentRoot: null,
  scrollInstrumentScrollTarget: null,
  scrollInstrumentTicks: [],
  scrollInstrumentMarker: null,
  scrollInstrumentSections: [],
  scrollInstrumentTarget: 0,
  scrollInstrumentCurrent: 0,
  scrollInstrumentActiveIndex: -1,
  scrollInstrumentPulse: 0,
  scrollInstrumentRaf: 0,
  scrollInstrumentTop: 0,
  scrollInstrumentPitch: 0,
  scrollInstrumentTitleWidth: 0,
  scrollInstrumentTitlePresence: 0,
  scrollInstrumentMarkerWidth: 18,
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const getNow = () => (window.performance && typeof window.performance.now === "function"
  ? window.performance.now()
  : Date.now());

let soundUiSync = () => {};

export function setSoundUiSync(sync) {
  soundUiSync = typeof sync === "function" ? sync : () => {};
}

export function getSoundState() {
  if (!AudioContextClass) {
    return "unsupported";
  }

  if (!state.unlocked) {
    return "locked";
  }

  return state.muted ? "off" : "on";
}

export function syncMasterGain() {
  if (!state.masterGain || !state.ctx) {
    return;
  }

  const target = state.muted ? 0.0001 : Math.max(0.0001, state.volume * MAX_MASTER_GAIN);
  state.masterGain.gain.setTargetAtTime(target, state.ctx.currentTime, 0.04);
}

export function setMuted(nextMuted) {
  state.muted = nextMuted;

  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, nextMuted ? "1" : "0");
  } catch {
    // Storage is only used for preference persistence.
  }

  syncMasterGain();
  soundUiSync();
}

export function setVolume(nextVolume) {
  state.volume = clamp(nextVolume, 0.15, 1);

  try {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(state.volume));
  } catch {
    // Storage is only used for preference persistence.
  }

  syncMasterGain();
  soundUiSync();
}

try {
  state.muted = window.localStorage.getItem(SOUND_STORAGE_KEY) === "1";
} catch {
  state.muted = false;
}

try {
  const storedVolume = Number.parseFloat(window.localStorage.getItem(VOLUME_STORAGE_KEY) || "");
  if (Number.isFinite(storedVolume)) {
    state.volume = clamp(storedVolume, 0.15, 1);
  }
} catch {
  state.volume = DEFAULT_VOLUME;
}
