import { getNow, state, supportsHover } from "./config.js";
import {
  emitScrollTicksForDelta,
  fadeDragSound,
  fadeScrollSound,
  updateDragSound,
  updateScrollSound,
} from "./engine.js";

function scheduleDragSoundUpdate() {
  if (state.dragSoundRaf) {
    return;
  }

  state.dragSoundRaf = window.requestAnimationFrame(() => {
    state.dragSoundRaf = 0;
    updateDragSound(state.pendingDragSpeed, state.pendingDragX);
  });
}

function scheduleScrollTextureUpdate(delta, speed, direction = 1) {
  state.pendingScrollDelta += delta;
  state.scrollPendingSpeed = Math.max(state.scrollPendingSpeed, speed);
  state.scrollPendingDirection = direction || state.scrollPendingDirection;

  if (state.scrollRaf) {
    return;
  }

  state.scrollRaf = window.requestAnimationFrame(() => {
    const pendingDelta = state.pendingScrollDelta;
    const pendingSpeed = state.scrollPendingSpeed;
    const pendingDirection = state.scrollPendingDirection;

    state.scrollRaf = 0;
    state.pendingScrollDelta = 0;
    state.scrollPendingSpeed = 0;

    updateScrollSound(pendingSpeed, pendingDirection);
    emitScrollTicksForDelta(pendingDelta, pendingSpeed, pendingDirection);
  });
}

export function bindContinuousInteractionListeners() {
  if (state.continuousListenersBound) {
    return;
  }

  if (supportsHover) {
    state.handleMouseMove = (event) => {
      const now = getNow();

      if (!state.lastMoveAt) {
        state.lastMoveX = event.clientX;
        state.lastMoveY = event.clientY;
        state.lastMoveAt = now;
        return;
      }

      const elapsed = now - state.lastMoveAt;
      const distance = Math.hypot(event.clientX - state.lastMoveX, event.clientY - state.lastMoveY);

      state.lastMoveX = event.clientX;
      state.lastMoveY = event.clientY;
      state.lastMoveAt = now;

      if (!state.unlocked || state.muted || !state.dragStarted || elapsed <= 8 || elapsed > 140) {
        return;
      }

      const instantaneousSpeed = distance / elapsed * 1000;
      state.smoothedSpeed = state.smoothedSpeed * 0.72 + instantaneousSpeed * 0.28;
      state.pendingDragSpeed = state.smoothedSpeed;
      state.pendingDragX = event.clientX;
      scheduleDragSoundUpdate();

      window.clearTimeout(state.idleTimer);
      state.idleTimer = window.setTimeout(() => {
        fadeDragSound();
      }, 90);
    };

    state.handleMouseLeave = () => {
      fadeDragSound();
    };

    window.addEventListener("mousemove", state.handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", state.handleMouseLeave);
  }

  state.handleScroll = () => {
    const now = getNow();
    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (!state.lastScrollAt) {
      state.lastScrollY = scrollY;
      state.lastScrollAt = now;
      return;
    }

    const elapsed = now - state.lastScrollAt;
    const delta = scrollY - state.lastScrollY;
    state.lastScrollY = scrollY;
    state.lastScrollAt = now;

    if (!state.unlocked || state.muted || !state.scrollStarted || elapsed <= 10 || elapsed > 220 || delta === 0) {
      return;
    }

    const speed = Math.abs(delta) / elapsed * 1000;
    const direction = Math.sign(delta) || state.scrollPendingDirection;
    scheduleScrollTextureUpdate(delta, speed, direction);

    window.clearTimeout(state.scrollIdleTimer);
    state.scrollIdleTimer = window.setTimeout(() => {
      fadeScrollSound();
    }, 140);
  };

  window.addEventListener("scroll", state.handleScroll, { passive: true });
  state.continuousListenersBound = true;
}

export function cleanupContinuousInteractionListeners() {
  window.clearTimeout(state.idleTimer);
  window.clearTimeout(state.scrollIdleTimer);
  window.cancelAnimationFrame(state.dragSoundRaf);
  window.cancelAnimationFrame(state.scrollRaf);
  window.cancelAnimationFrame(state.scrollInstrumentRaf);

  if (state.handleMouseMove) {
    window.removeEventListener("mousemove", state.handleMouseMove);
  }
  if (state.handleMouseLeave) {
    window.removeEventListener("mouseleave", state.handleMouseLeave);
  }
  if (state.handleScroll) {
    window.removeEventListener("scroll", state.handleScroll);
  }

  if (state.dragSource) {
    state.dragSource.stop();
  }
  if (state.scrollSource) {
    state.scrollSource.stop();
  }
  if (state.scrollDetailSource) {
    state.scrollDetailSource.stop();
  }
}
