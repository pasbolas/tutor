import {
  AudioContextClass,
  getSoundState,
  hideSoundToggleOnMobile,
  setMuted,
  setSoundUiSync,
  setVolume,
  state,
  supportsHover,
} from "./config.js";
import { ensureAudio, playToggleSound } from "./engine.js";

export function updateSoundToggleUI() {
  if (!state.soundToggle || !state.soundToggleLabel || !state.soundControl) {
    return;
  }

  const soundState = getSoundState();
  let label = "Sound off";

  if (soundState === "unsupported") {
    label = "Sound unavailable";
    state.soundToggle.disabled = true;
  } else if (soundState === "off" || soundState === "locked") {
    label = "Sound off";
    state.soundToggle.disabled = false;
  } else if (soundState === "on") {
    label = "Sound on";
    state.soundToggle.disabled = false;
  } else {
    state.soundToggle.disabled = false;
  }

  state.soundControl.dataset.state = soundState;
  state.soundToggle.dataset.state = soundState;
  state.soundToggle.setAttribute("aria-label", label);
  state.soundToggle.setAttribute("aria-pressed", soundState === "on" ? "true" : "false");
  state.soundToggleLabel.textContent = label;

  if (state.volumeSlider) {
    state.volumeSlider.value = String(Math.round(state.volume * 100));
    state.volumeSlider.disabled = soundState !== "on";
  }

  if (state.volumeValue) {
    state.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;
  }
}

setSoundUiSync(updateSoundToggleUI);

export function closeSoundPanel() {
  state.soundControl?.classList.remove("is-panel-open");
}

export function createSoundToggle() {
  if (hideSoundToggleOnMobile || state.soundControl) {
    return;
  }

  const control = document.createElement("div");
  control.className = "site-sound-control";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "site-sound-toggle";
  button.setAttribute("data-sound-toggle", "true");

  const dot = document.createElement("span");
  dot.className = "site-sound-toggle__dot";
  dot.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "site-sound-toggle__label";

  const panel = document.createElement("div");
  panel.className = "site-sound-panel";

  const panelRow = document.createElement("div");
  panelRow.className = "site-sound-panel__row";

  const panelLabel = document.createElement("span");
  panelLabel.className = "site-sound-panel__label";
  panelLabel.textContent = "Volume";

  const panelValue = document.createElement("span");
  panelValue.className = "site-sound-panel__value";

  const slider = document.createElement("input");
  slider.className = "site-sound-panel__slider";
  slider.type = "range";
  slider.min = "15";
  slider.max = "100";
  slider.step = "1";

  const hint = document.createElement("p");
  hint.className = "site-sound-panel__hint";
  hint.textContent = "Hover here to adjust sound level";

  panelRow.append(panelLabel, panelValue);
  panel.append(panelRow, slider, hint);
  button.append(dot, label);
  control.append(button, panel);

  const sidebarSoundHost = document.querySelector("[data-sidebar-sound-host]");
  const host = sidebarSoundHost
    || document.querySelector(".topbar__group--right")
    || document.querySelector(".study-topbar__nav")
    || document.querySelector(".project-topbar__links")
    || document.querySelector(".hackathon-topbar__nav");

  if (host) {
    if (sidebarSoundHost) {
      host.appendChild(control);
    } else {
      host.prepend(control);
    }
  } else {
    document.body.appendChild(control);
  }

  state.soundControl = control;
  state.soundToggle = button;
  state.soundToggleLabel = label;
  state.volumeSlider = slider;
  state.volumeValue = panelValue;
  updateSoundToggleUI();

  const openPanel = () => {
    if (getSoundState() !== "on") {
      closeSoundPanel();
      return;
    }

    control.classList.add("is-panel-open");
  };

  slider.addEventListener("input", () => {
    setVolume(Number(slider.value) / 100);
  });

  control.addEventListener("pointerenter", openPanel);
  control.addEventListener("pointerleave", closeSoundPanel);
  control.addEventListener("mouseleave", closeSoundPanel);
  control.addEventListener("focusin", openPanel);
  control.addEventListener("focusout", (event) => {
    if (!control.contains(event.relatedTarget)) {
      closeSoundPanel();
    }
  });
  control.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSoundPanel();
      button.focus();
    }
  });

  if (!supportsHover) {
    button.addEventListener("click", () => {
      if (getSoundState() === "on") {
        control.classList.toggle("is-panel-open");
      } else {
        closeSoundPanel();
      }
    });

    document.addEventListener("click", (event) => {
      if (!control.contains(event.target)) {
        closeSoundPanel();
      }
    });
  }

  window.addEventListener("blur", closeSoundPanel);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      closeSoundPanel();
    }
  });

  button.addEventListener("click", async () => {
    if (!AudioContextClass) {
      return;
    }

    const wasLocked = !state.unlocked;
    const wasMuted = state.muted;
    const context = await ensureAudio();
    updateSoundToggleUI();

    if (!context) {
      return;
    }

    if (wasLocked || wasMuted) {
      setMuted(false);
      playToggleSound();
      if (!supportsHover) {
        openPanel();
      }
      return;
    }

    setMuted(true);
    closeSoundPanel();
  });
}
