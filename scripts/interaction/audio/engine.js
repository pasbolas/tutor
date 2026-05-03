import {
  AudioContextClass,
  MAX_SCROLL_TICKS_PER_FRAME,
  SCROLL_TICK_SPACING_PX,
  clamp,
  state,
  supportsHover,
  syncMasterGain,
} from "./config.js";
import { pulseScrollInstrument } from "./scroll-instrument.js";

let bindContinuousListeners = () => {};

export function setContinuousListenerBinder(binder) {
  bindContinuousListeners = typeof binder === "function" ? binder : () => {};
}

function createNoiseBuffer(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createSoftClipCurve(samples = 128, drive = 1.35) {
  const curve = new Float32Array(samples);

  for (let index = 0; index < samples; index += 1) {
    const x = (index / (samples - 1)) * 2 - 1;
    curve[index] = Math.tanh(x * drive);
  }

  return curve;
}

function createMasterGain(context) {
  const gainNode = context.createGain();
  gainNode.gain.value = state.muted ? 0.0001 : Math.max(0.0001, state.volume * 3.1);
  gainNode.connect(context.destination);
  return gainNode;
}

export async function ensureAudio() {
  if (!AudioContextClass) {
    return null;
  }

  if (!state.ctx) {
    state.ctx = new AudioContextClass();
    state.masterGain = createMasterGain(state.ctx);
  }

  if (state.ctx.state === "suspended") {
    await state.ctx.resume();
  }

  state.unlocked = true;
  syncMasterGain();

  if (supportsHover && !state.dragStarted) {
    const dragSource = state.ctx.createBufferSource();
    const dragFilter = state.ctx.createBiquadFilter();
    const dragGain = state.ctx.createGain();
    const highpass = state.ctx.createBiquadFilter();
    const dragPan = typeof state.ctx.createStereoPanner === "function"
      ? state.ctx.createStereoPanner()
      : null;

    dragSource.buffer = createNoiseBuffer(state.ctx);
    dragSource.loop = true;
    highpass.type = "highpass";
    highpass.frequency.value = 220;
    dragFilter.type = "bandpass";
    dragFilter.frequency.value = 680;
    dragFilter.Q.value = 1.1;
    dragGain.gain.value = 0.0001;

    dragSource.connect(highpass);
    highpass.connect(dragFilter);
    if (dragPan) {
      dragFilter.connect(dragPan);
      dragPan.connect(dragGain);
    } else {
      dragFilter.connect(dragGain);
    }

    dragGain.connect(state.masterGain);
    dragSource.start();
    state.dragSource = dragSource;
    state.dragGain = dragGain;
    state.dragFilter = dragFilter;
    state.dragPan = dragPan;
    state.dragStarted = true;
  }

  if (!state.scrollStarted) {
    const scrollSource = state.ctx.createBufferSource();
    const scrollHighpass = state.ctx.createBiquadFilter();
    const scrollFilter = state.ctx.createBiquadFilter();
    const scrollShaper = state.ctx.createWaveShaper();
    const scrollGain = state.ctx.createGain();
    const scrollDetailSource = state.ctx.createBufferSource();
    const scrollDetailHighpass = state.ctx.createBiquadFilter();
    const scrollDetailFilter = state.ctx.createBiquadFilter();
    const scrollDetailGain = state.ctx.createGain();

    scrollSource.buffer = createNoiseBuffer(state.ctx);
    scrollSource.loop = true;
    scrollSource.playbackRate.value = 0.74;
    scrollHighpass.type = "highpass";
    scrollHighpass.frequency.value = 180;
    scrollFilter.type = "bandpass";
    scrollFilter.frequency.value = 520;
    scrollFilter.Q.value = 0.82;

    scrollDetailSource.buffer = createNoiseBuffer(state.ctx);
    scrollDetailSource.loop = true;
    scrollDetailSource.playbackRate.value = 0.86;
    scrollDetailHighpass.type = "highpass";
    scrollDetailHighpass.frequency.value = 720;
    scrollDetailFilter.type = "bandpass";
    scrollDetailFilter.frequency.value = 1260;
    scrollDetailFilter.Q.value = 2.5;
    scrollShaper.curve = createSoftClipCurve(160, 1.85);
    scrollShaper.oversample = "4x";
    scrollGain.gain.value = 0.0001;
    scrollDetailGain.gain.value = 0.0001;

    scrollSource.connect(scrollHighpass);
    scrollHighpass.connect(scrollFilter);
    scrollFilter.connect(scrollGain);
    scrollGain.connect(state.masterGain);
    scrollDetailSource.connect(scrollDetailHighpass);
    scrollDetailHighpass.connect(scrollDetailFilter);
    scrollDetailFilter.connect(scrollShaper);
    scrollShaper.connect(scrollDetailGain);
    scrollDetailGain.connect(state.masterGain);
    scrollSource.start();
    scrollDetailSource.start();

    state.scrollSource = scrollSource;
    state.scrollGain = scrollGain;
    state.scrollFilter = scrollFilter;
    state.scrollShaper = scrollShaper;
    state.scrollDetailSource = scrollDetailSource;
    state.scrollDetailGain = scrollDetailGain;
    state.scrollDetailFilter = scrollDetailFilter;
    state.scrollStarted = true;
  }

  bindContinuousListeners();
  return state.ctx;
}

function playTransient(parts, envelope) {
  if (!state.ctx || !state.masterGain) {
    return;
  }

  const now = state.ctx.currentTime;
  const voiceGain = state.ctx.createGain();
  voiceGain.gain.setValueAtTime(0.0001, now);
  voiceGain.gain.linearRampToValueAtTime(envelope.peak, now + envelope.attack);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + envelope.release);
  voiceGain.connect(state.masterGain);

  parts.forEach((part) => {
    const oscillator = state.ctx.createOscillator();
    oscillator.type = part.type;
    oscillator.frequency.setValueAtTime(part.from, now);
    oscillator.frequency.exponentialRampToValueAtTime(part.to, now + part.duration);
    oscillator.connect(voiceGain);
    oscillator.start(now);
    oscillator.stop(now + part.duration + 0.02);
  });
}

export function playClickSound() {
  playTransient(
    [
      { type: "triangle", from: 920, to: 520, duration: 0.06 },
      { type: "square", from: 1480, to: 760, duration: 0.045 },
    ],
    { attack: 0.008, peak: 0.085, release: 0.08 }
  );
}

export function playToggleSound() {
  playTransient(
    [
      { type: "triangle", from: 560, to: 760, duration: 0.05 },
      { type: "sine", from: 910, to: 700, duration: 0.07 },
    ],
    { attack: 0.006, peak: 0.1, release: 0.11 }
  );
}

export function playHoverExpandSound() {
  playTransient(
    [
      { type: "sine", from: 310, to: 620, duration: 0.09 },
      { type: "triangle", from: 480, to: 980, duration: 0.06 },
    ],
    { attack: 0.01, peak: 0.055, release: 0.12 }
  );
}

function playScrollTick(direction = 1, intensity = 0.5) {
  const clampedIntensity = clamp(intensity, 0.2, 1);
  const pitchJitter = 1 + (Math.random() * 2 - 1) * 0.05;
  const releaseJitter = 0.068 + Math.random() * 0.024;
  const peak = 0.011 + clampedIntensity * 0.022;

  playTransient(
    direction >= 0
      ? [
        { type: "triangle", from: 620 * pitchJitter, to: 430 * pitchJitter, duration: 0.052 },
        { type: "sine", from: 880 * pitchJitter, to: 610 * pitchJitter, duration: 0.042 },
      ]
      : [
        { type: "triangle", from: 560 * pitchJitter, to: 390 * pitchJitter, duration: 0.056 },
        { type: "sine", from: 760 * pitchJitter, to: 520 * pitchJitter, duration: 0.044 },
      ],
    { attack: 0.004, peak: direction >= 0 ? peak : peak * 0.95, release: releaseJitter }
  );
}

export function emitScrollTicksForDelta(delta, speed, direction) {
  const travel = Math.abs(delta);
  if (!travel) {
    return;
  }

  state.scrollTickCarry += travel;
  const normalized = clamp(speed / 1800, 0, 1);
  const maxTicks = Math.max(1, Math.min(MAX_SCROLL_TICKS_PER_FRAME, 1 + Math.floor(normalized * MAX_SCROLL_TICKS_PER_FRAME)));
  const availableTicks = Math.floor(state.scrollTickCarry / SCROLL_TICK_SPACING_PX);
  if (!availableTicks) {
    return;
  }

  const ticksToPlay = Math.min(availableTicks, maxTicks);
  state.scrollTickCarry -= ticksToPlay * SCROLL_TICK_SPACING_PX;
  for (let index = 0; index < ticksToPlay; index += 1) {
    const tickIntensity = clamp(normalized * (0.88 + index * 0.035), 0.2, 1);
    playScrollTick(direction, tickIntensity);
    pulseScrollInstrument(tickIntensity);
  }
}

export function fadeDragSound() {
  if (state.dragGain && state.ctx) {
    state.dragGain.gain.setTargetAtTime(0.0001, state.ctx.currentTime, 0.08);
  }
}

export function fadeScrollSound() {
  if (!state.ctx) {
    return;
  }

  if (state.scrollGain) {
    state.scrollGain.gain.setTargetAtTime(0.0001, state.ctx.currentTime, 0.12);
  }
  if (state.scrollDetailGain) {
    state.scrollDetailGain.gain.setTargetAtTime(0.0001, state.ctx.currentTime, 0.14);
  }
}

export function updateDragSound(speed, clientX) {
  if (!state.dragGain || !state.dragFilter || !state.ctx) {
    return;
  }

  const normalized = clamp((speed - 80) / 1200, 0, 1);
  const xRatio = clamp(clientX / Math.max(window.innerWidth, 1), 0, 1);
  const now = state.ctx.currentTime;
  state.dragGain.gain.setTargetAtTime(0.0001 + normalized * 0.05, now, 0.06);
  state.dragFilter.frequency.setTargetAtTime(520 + normalized * 2350, now, 0.05);
  state.dragFilter.Q.setTargetAtTime(0.8 + normalized * 5.6, now, 0.05);

  if (state.dragPan) {
    state.dragPan.pan.setTargetAtTime((xRatio - 0.5) * 0.9, now, 0.08);
  }
}

export function updateScrollSound(speed, direction = 1) {
  if (!state.scrollGain || !state.scrollFilter || !state.scrollDetailGain || !state.scrollDetailFilter || !state.scrollSource || !state.scrollDetailSource || !state.ctx) {
    return;
  }

  const normalized = clamp((speed - 24) / 1650, 0, 1);
  const now = state.ctx.currentTime;
  const directionBias = direction >= 0 ? 1 : 0.96;
  state.scrollDrift = state.scrollDrift * 0.74 + (Math.random() * 2 - 1) * 0.26;
  const drift = state.scrollDrift;
  state.scrollGain.gain.setTargetAtTime(0.0024 + normalized * 0.014, now, 0.06);
  state.scrollDetailGain.gain.setTargetAtTime(0.00045 + normalized * normalized * 0.0095, now, 0.055);
  state.scrollFilter.frequency.setTargetAtTime(340 + normalized * 480 + drift * 30, now, 0.06);
  state.scrollFilter.Q.setTargetAtTime(0.7 + normalized * 1.05, now, 0.065);
  state.scrollDetailFilter.frequency.setTargetAtTime((860 + normalized * 980 + drift * 60) * directionBias, now, 0.058);
  state.scrollDetailFilter.Q.setTargetAtTime(2.1 + normalized * 3.1, now, 0.058);
  state.scrollSource.playbackRate.setTargetAtTime(0.7 + normalized * 0.12 + drift * 0.012, now, 0.085);
  state.scrollDetailSource.playbackRate.setTargetAtTime(0.82 + normalized * 0.16 - drift * 0.016, now, 0.075);
}
