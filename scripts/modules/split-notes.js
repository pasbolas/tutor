import {
  escapeAttribute,
  escapeHtml,
  normalizeComparableHref,
} from "./shared.js";
import {
  fetchCatalog,
  getCatalogNoteRows,
  normalizeHubTree,
} from "./catalog/tree.js";

const SPLIT_NOTES_STORAGE_KEY = "tutor-notes-split-view";
const SPLIT_NOTES_MOBILE_QUERY = "(max-width: 780px)";
const ROOT_URL = new URL("../../", import.meta.url);
const CATALOG_URL = new URL("../../catalog.json", import.meta.url);
const EMPTY_STATE_CAT_URL = new URL("../../assets/loading/neon_cat.gif", import.meta.url);

function isInsideSplitFrame() {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
}

function getMobileSplitMediaQuery() {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(SPLIT_NOTES_MOBILE_QUERY)
    : null;
}

function isMobileSplitUi(mediaQuery = getMobileSplitMediaQuery()) {
  return mediaQuery?.matches || window.innerWidth <= 780;
}

function stripSplitParams(href) {
  const url = new URL(href, ROOT_URL);
  ["split", "left", "right", "splitChild"].forEach((param) => {
    url.searchParams.delete(param);
  });
  url.hash = "";
  return url.href;
}

function comparableHref(href) {
  return normalizeComparableHref(stripSplitParams(href));
}

function getNoteUrl(href) {
  return new URL(href || "#", ROOT_URL).href;
}

function getChildFrameUrl(href) {
  const url = new URL(href, ROOT_URL);
  url.searchParams.delete("split");
  url.searchParams.delete("left");
  url.searchParams.delete("right");
  url.searchParams.set("splitChild", "1");
  return url.href;
}

function flattenCatalogNotes(config) {
  const tree = normalizeHubTree(Array.isArray(config.items) ? config.items : []);
  return getCatalogNoteRows(tree)
    .map((note) => ({
      ...note,
      absoluteHref: getNoteUrl(note.href),
      label: `${note.subject || "Notes"} / ${note.name || "Untitled"}`,
    }))
    .filter((note) => note.href && note.href !== "#");
}

function findNoteByHref(notes, href) {
  if (!href) {
    return null;
  }

  const comparable = comparableHref(href);
  return notes.find((note) => comparableHref(note.absoluteHref) === comparable) || null;
}

function getStoredState(notes) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SPLIT_NOTES_STORAGE_KEY) || "{}");
    return {
      leftNote: findNoteByHref(notes, stored.leftHref),
      rightNote: findNoteByHref(notes, stored.rightHref),
      isLeftMinimized: stored.isLeftMinimized === true,
    };
  } catch {
    return {
      leftNote: null,
      rightNote: null,
      isLeftMinimized: false,
    };
  }
}

function saveStoredState(state) {
  try {
    window.localStorage.setItem(
      SPLIT_NOTES_STORAGE_KEY,
      JSON.stringify({
        leftHref: state.leftNote?.absoluteHref || "",
        rightHref: state.rightNote?.absoluteHref || "",
        isLeftMinimized: state.isLeftMinimized === true,
      })
    );
  } catch {
    // Split view is still useful without storage.
  }
}

function getLeadingNumber(note) {
  const match = String(note?.name || "").match(/^\s*(\d+)/);
  return match ? match[1] : "";
}

function isPdfNote(note) {
  return /\bpdf\b/i.test(`${note?.name || ""} ${note?.meta || ""}`);
}

function isQuestionNote(note) {
  return /\b(q\s*&\s*a|q\s*and\s*a|questions?|answers?)\b/i.test(`${note?.name || ""} ${note?.meta || ""}`);
}

function pickRelatedNote(notes, leftNote) {
  if (!leftNote) {
    return notes[1] || notes[0] || null;
  }

  const leftIndex = notes.indexOf(leftNote);
  const prefix = getLeadingNumber(leftNote);
  const sameSubject = notes.filter((note) => (
    note.subject === leftNote.subject
    && comparableHref(note.absoluteHref) !== comparableHref(leftNote.absoluteHref)
  ));
  const candidates = sameSubject.length
    ? sameSubject
    : notes.filter((note) => comparableHref(note.absoluteHref) !== comparableHref(leftNote.absoluteHref));

  if (!candidates.length) {
    return leftNote;
  }

  const activeIsPdf = isPdfNote(leftNote);
  const ranked = candidates
    .map((note) => {
      let score = Math.abs(notes.indexOf(note) - leftIndex);
      if (prefix && getLeadingNumber(note) === prefix) {
        score -= 40;
      }
      if (activeIsPdf && !isPdfNote(note)) {
        score -= 12;
      }
      if (!activeIsPdf && isPdfNote(note)) {
        score -= 12;
      }
      if (isQuestionNote(note)) {
        score += activeIsPdf ? 2 : 5;
      }
      return { note, score };
    })
    .sort((left, right) => left.score - right.score);

  return ranked[0]?.note || candidates[0] || null;
}

function getInitialState(notes) {
  const params = new URLSearchParams(window.location.search);
  const stored = getStoredState(notes);
  const currentNote = findNoteByHref(notes, window.location.href);
  const leftNote = findNoteByHref(notes, params.get("left"))
    || currentNote
    || null;
  const rightNote = findNoteByHref(notes, params.get("right")) || null;

  return {
    leftNote,
    rightNote,
    isLeftMinimized: stored.isLeftMinimized,
    autoOpen: params.get("split") === "1",
  };
}

function renderIcon(paths) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}

function renderOptions(notes, selectedNote, { placeholder = "" } = {}) {
  const selectedHref = selectedNote?.absoluteHref || "";
  const placeholderOption = placeholder
    ? `<option value=""${selectedHref ? "" : " selected"}>${escapeHtml(placeholder)}</option>`
    : "";

  return placeholderOption + notes
    .map((note) => {
      const isSelected = selectedHref && comparableHref(note.absoluteHref) === comparableHref(selectedHref);
      return `
        <option value="${escapeAttribute(note.absoluteHref)}"${isSelected ? " selected" : ""}>
          ${escapeHtml(note.label)}
        </option>
      `;
    })
    .join("");
}

function buildSplitNotesUi(notes, state) {
  const root = document.createElement("div");
  root.className = "split-notes";
  root.dataset.splitNotes = "";
  root.innerHTML = `
    <button class="split-notes__launcher" type="button" data-split-notes-open aria-label="Open two notes side by side">
      ${renderIcon('<path d="M4 5h7v14H4z" /><path d="M13 5h7v14h-7z" />')}
      <span>Split</span>
    </button>

    <section class="split-notes__workspace" aria-label="Side-by-side notes" data-split-notes-workspace hidden>
      <header class="split-notes__bar">
        <div class="split-notes__toolbar-side split-notes__toolbar-side--left">
          <div class="split-notes__brand">
            <button class="split-notes__icon-button" type="button" data-split-notes-close aria-label="Close split notes">
              ${renderIcon('<path d="M18 6 6 18" /><path d="m6 6 12 12" />')}
            </button>
            <strong>Split notes</strong>
          </div>
          <label class="split-notes__select-field">
            <span>Left</span>
            <select data-split-notes-select="left" aria-label="Choose left note">
              ${renderOptions(notes, state.leftNote)}
            </select>
          </label>
        </div>

        <div class="split-notes__toolbar-side split-notes__toolbar-side--right">
          <label class="split-notes__select-field">
            <span>Right</span>
            <select data-split-notes-select="right" aria-label="Choose right note">
              ${renderOptions(notes, state.rightNote, { placeholder: "Select a right note..." })}
            </select>
          </label>
          <div class="split-notes__actions">
            <button class="split-notes__text-button" type="button" data-split-notes-swap>
              ${renderIcon('<path d="M7 7h10" /><path d="m14 4 3 3-3 3" /><path d="M17 17H7" /><path d="m10 14-3 3 3 3" />')}
              <span>Swap</span>
            </button>
            <button class="split-notes__text-button" type="button" data-split-notes-toggle-left aria-pressed="false">
              ${renderIcon('<path d="M4 5h6v14H4z" /><path d="M14 8h6" /><path d="M14 12h6" /><path d="M14 16h6" />')}
              <span data-split-notes-toggle-label>Minimise left</span>
            </button>
          </div>
        </div>
      </header>

      <div class="split-notes__panes">
        <article class="split-notes__pane split-notes__pane--left" data-split-notes-pane="left">
          <header class="split-notes__pane-bar">
            <span class="split-notes__pane-label">Left</span>
            <strong data-split-notes-title="left"></strong>
            <a class="split-notes__pane-action" data-split-notes-open-full="left" href="#" aria-label="Open left note full page">
              ${renderIcon('<path d="M14 5h5v5" /><path d="m10 14 9-9" /><path d="M19 14v5H5V5h5" />')}
            </a>
            <button class="split-notes__pane-restore" type="button" data-split-notes-toggle-left aria-label="Restore left note">
              ${renderIcon('<path d="M9 6 3 12l6 6" /><path d="M4 12h16" />')}
            </button>
          </header>
          <div class="split-notes__frame-wrap">
            <iframe data-split-notes-frame="left" title="Left note"></iframe>
          </div>
        </article>

        <article class="split-notes__pane split-notes__pane--right" data-split-notes-pane="right">
          <header class="split-notes__pane-bar">
            <span class="split-notes__pane-label">Right</span>
            <strong data-split-notes-title="right"></strong>
            <a class="split-notes__pane-action" data-split-notes-open-full="right" href="#" aria-label="Open right note full page">
              ${renderIcon('<path d="M14 5h5v5" /><path d="m10 14 9-9" /><path d="M19 14v5H5V5h5" />')}
            </a>
          </header>
          <div class="split-notes__frame-wrap">
            <iframe data-split-notes-frame="right" title="Right note"></iframe>
            <div class="split-notes__empty-state" data-split-notes-empty="right" aria-live="polite">
              <span class="split-notes__empty-arrow" aria-hidden="true"></span>
              <p>Select the right notes</p>
              <img src="${escapeAttribute(EMPTY_STATE_CAT_URL.href)}" alt="" loading="eager" decoding="async" />
            </div>
          </div>
        </article>
      </div>
    </section>
  `;
  document.body.appendChild(root);
  return root;
}

function getUiNodes(root) {
  return {
    workspace: root.querySelector("[data-split-notes-workspace]"),
    openButton: root.querySelector("[data-split-notes-open]"),
    closeButton: root.querySelector("[data-split-notes-close]"),
    swapButton: root.querySelector("[data-split-notes-swap]"),
    leftSelect: root.querySelector('[data-split-notes-select="left"]'),
    rightSelect: root.querySelector('[data-split-notes-select="right"]'),
    toggleButtons: Array.from(root.querySelectorAll("[data-split-notes-toggle-left]")),
    toggleLabel: root.querySelector("[data-split-notes-toggle-label]"),
    leftTitle: root.querySelector('[data-split-notes-title="left"]'),
    rightTitle: root.querySelector('[data-split-notes-title="right"]'),
    leftFrame: root.querySelector('[data-split-notes-frame="left"]'),
    rightFrame: root.querySelector('[data-split-notes-frame="right"]'),
    leftOpenFull: root.querySelector('[data-split-notes-open-full="left"]'),
    rightOpenFull: root.querySelector('[data-split-notes-open-full="right"]'),
  };
}

function setFrameSource(frame, note) {
  if (!frame || !note) {
    return;
  }

  const nextSrc = getChildFrameUrl(note.absoluteHref);
  if (frame.dataset.currentSrc === nextSrc) {
    return;
  }

  frame.dataset.currentSrc = nextSrc;
  frame.hidden = false;
  frame.src = nextSrc;
}

function clearFrameSource(frame) {
  if (!frame) {
    return;
  }

  frame.hidden = true;
  frame.removeAttribute("src");
  delete frame.dataset.currentSrc;
}

function createSplitNotesController(notes, initialState) {
  const state = {
    leftNote: initialState.leftNote,
    rightNote: initialState.rightNote,
    isLeftMinimized: initialState.isLeftMinimized,
    isOpen: false,
  };
  const root = buildSplitNotesUi(notes, state);
  const ui = getUiNodes(root);
  const cleanups = [];
  let leftToggleAnimationTimer = 0;

  const on = (target, eventName, handler) => {
    if (!target) {
      return;
    }
    target.addEventListener(eventName, handler);
    cleanups.push(() => target.removeEventListener(eventName, handler));
  };

  const animateLeftToggle = () => {
    window.clearTimeout(leftToggleAnimationTimer);
    root.classList.remove("is-left-toggle-animating");
    void root.offsetWidth;
    root.classList.add("is-left-toggle-animating");
    leftToggleAnimationTimer = window.setTimeout(() => {
      root.classList.remove("is-left-toggle-animating");
    }, 420);
  };

  const updateSelectedOption = (select, note) => {
    if (!select) {
      return;
    }
    select.value = note?.absoluteHref || "";
  };

  const updatePane = (side) => {
    const note = side === "left" ? state.leftNote : state.rightNote;
    const title = side === "left" ? ui.leftTitle : ui.rightTitle;
    const frame = side === "left" ? ui.leftFrame : ui.rightFrame;
    const openFull = side === "left" ? ui.leftOpenFull : ui.rightOpenFull;
    const pane = root.querySelector(`[data-split-notes-pane="${side}"]`);

    if (!note) {
      if (title) {
        title.textContent = "";
      }
      if (openFull) {
        openFull.href = "#";
      }
      if (frame) {
        frame.title = `${side === "left" ? "Left" : "Right"} note`;
        clearFrameSource(frame);
      }
      if (pane) {
        pane.classList.add("is-empty");
      }
      return;
    }

    if (pane) {
      pane.classList.remove("is-empty");
    }
    if (title) {
      title.textContent = note.name || "Untitled note";
    }
    if (openFull) {
      openFull.href = note.absoluteHref;
    }
    if (frame) {
      frame.title = `${side === "left" ? "Left" : "Right"} note: ${note.name || "Untitled note"}`;
    }

    if (state.isOpen) {
      setFrameSource(frame, note);
    }
  };

  const sync = ({ persist = true } = {}) => {
    root.classList.toggle("is-open", state.isOpen);
    root.classList.toggle("is-left-minimized", state.isLeftMinimized);
    document.body.classList.toggle("has-split-notes", state.isOpen);

    if (ui.workspace) {
      ui.workspace.hidden = !state.isOpen;
    }
    ui.toggleButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(state.isLeftMinimized));
    });
    if (ui.toggleLabel) {
      ui.toggleLabel.textContent = state.isLeftMinimized ? "Restore left" : "Minimise left";
    }

    updateSelectedOption(ui.leftSelect, state.leftNote);
    updateSelectedOption(ui.rightSelect, state.rightNote);
    updatePane("left");
    updatePane("right");

    if (persist) {
      saveStoredState(state);
    }
  };

  const open = () => {
    state.isOpen = true;
    sync();
  };

  const close = () => {
    state.isOpen = false;
    sync({ persist: false });
  };

  const setNote = (side, href) => {
    const nextNote = findNoteByHref(notes, href);
    if (!nextNote) {
      if (side === "right" && !href) {
        state.rightNote = null;
        sync();
      }
      return;
    }
    if (side === "left") {
      state.leftNote = nextNote;
    } else {
      state.rightNote = nextNote;
    }
    sync();
  };

  on(ui.openButton, "click", open);
  on(ui.closeButton, "click", close);
  on(ui.leftSelect, "change", () => setNote("left", ui.leftSelect.value));
  on(ui.rightSelect, "change", () => setNote("right", ui.rightSelect.value));
  on(ui.swapButton, "click", () => {
    const previousLeft = state.leftNote;
    state.leftNote = state.rightNote;
    state.rightNote = previousLeft;
    sync();
  });
  ui.toggleButtons.forEach((button) => {
    on(button, "click", () => {
      state.isLeftMinimized = !state.isLeftMinimized;
      animateLeftToggle();
      sync();
    });
  });
  on(document, "keydown", (event) => {
    if (!state.isOpen || event.key !== "Escape") {
      return;
    }
    close();
  });

  sync({ persist: false });

  if (initialState.autoOpen) {
    open();
  }

  return {
    destroy() {
      state.isOpen = false;
      window.clearTimeout(leftToggleAnimationTimer);
      document.body.classList.remove("has-split-notes");
      cleanups.forEach((cleanup) => cleanup());
      root.remove();
    },
  };
}

export async function initSplitNotes() {
  if (isInsideSplitFrame()) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("splitChild") === "1") {
    return;
  }

  const mobileSplitMedia = getMobileSplitMediaQuery();
  if (isMobileSplitUi(mobileSplitMedia)) {
    return;
  }

  let notes = [];
  try {
    notes = flattenCatalogNotes(await fetchCatalog(CATALOG_URL.href));
  } catch {
    return;
  }

  if (notes.length < 2) {
    return;
  }

  if (!findNoteByHref(notes, window.location.href)) {
    return;
  }

  const controller = createSplitNotesController(notes, getInitialState(notes));

  const handleMobileChange = (event) => {
    if (event.matches) {
      controller.destroy();
      mobileSplitMedia?.removeEventListener("change", handleMobileChange);
    }
  };

  mobileSplitMedia?.addEventListener("change", handleMobileChange);
}
