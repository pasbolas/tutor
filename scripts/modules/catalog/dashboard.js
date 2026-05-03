import {
  clamp,
  escapeAttribute,
  escapeHtml,
  formatRelativeVisitTime,
  getStoredRecentNotes,
  normalizeComparableHref,
} from "../shared.js";
import { getCatalogNoteRows } from "./tree.js";

function getRecentDashboardNotes(notes) {
  const notesByHref = new Map(
    notes.map((note) => [normalizeComparableHref(note.href), note])
  );
  const history = getStoredRecentNotes();
  const recent = history
    .map((entry) => {
      const matchedNote = notesByHref.get(normalizeComparableHref(entry.href));
      return {
        href: matchedNote?.href || entry.href,
        name: matchedNote?.name || entry.title,
        subject: matchedNote?.subject || entry.subject || "Notes",
        meta: matchedNote?.meta || entry.meta || "Note",
        sectionId: entry.sectionId || "",
        sectionLabel: entry.sectionLabel || "",
        sectionTitle: entry.sectionTitle || "",
        sectionIndex: entry.sectionIndex || 0,
        totalSections: entry.totalSections || 0,
        progressPercent: entry.progressPercent || 0,
        visitedAt: entry.visitedAt,
      };
    })
    .filter((entry) => entry.href && entry.name);

  return recent;
}

export function renderDashboardCatalog(tree, activeHref) {
  const notes = getCatalogNoteRows(tree);
  const hasReadingHistory = getStoredRecentNotes().length > 0;
  const recentNotes = getRecentDashboardNotes(notes);
  const activeNote = recentNotes[0]
    || notes.find((note) => normalizeComparableHref(note.href) === activeHref)
    || notes[0];

  if (activeNote) {
    const hero = document.querySelector(".tutor-hero-note");
    if (hero) {
      const title = hero.querySelector("h1");
      const path = hero.querySelector(".tutor-note-path");
      const sectionMeta = hero.querySelector(".tutor-note-meta__section");
      const openedMeta = hero.querySelector(".tutor-note-meta__opened");
      const button = hero.querySelector(".tutor-button");
      const moreButton = hero.querySelector(".tutor-more");
      const progress = hero.querySelector(".tutor-progress span");
      const progressValue = hero.querySelector(".tutor-progress__value");
      const progressTrack = hero.querySelector(".tutor-progress");

      hero.classList.toggle("is-empty", !hasReadingHistory);

      if (title) {
        title.textContent = hasReadingHistory
          ? (activeNote.name || activeNote.title)
          : "Start reading your notes";
      }
      if (path) {
        path.innerHTML = hasReadingHistory
          ? `${escapeHtml(activeNote.subject)} <span>&rsaquo;</span> ${escapeHtml(activeNote.name || activeNote.title)}`
          : "Choose a subject <span>&rsaquo;</span> Open any note";
      }
      if (sectionMeta) {
        sectionMeta.textContent = hasReadingHistory
          ? `${activeNote.sectionTitle || activeNote.sectionLabel || "Slide 01"}`
          : "Open your first note";
      }
      if (openedMeta) {
        openedMeta.textContent = hasReadingHistory
          ? `Last opened ${formatRelativeVisitTime(activeNote.visitedAt)}`
          : "Ready when you are";
      }
      if (button) {
        button.setAttribute("href", activeNote.href || "#");
        button.textContent = hasReadingHistory ? "Continue" : "Start Reading";
      }
      if (moreButton) {
        moreButton.hidden = !hasReadingHistory;
      }
      if (progress) {
        progress.style.width = `${clamp(Number(activeNote.progressPercent) || 0, 0, 100)}%`;
      }
      if (progressValue) {
        progressValue.textContent = hasReadingHistory
          ? `${clamp(Number(activeNote.progressPercent) || 0, 0, 100)}%`
          : "0%";
      }
      if (progressTrack) {
        progressTrack.setAttribute(
          "aria-label",
          hasReadingHistory
            ? `${clamp(Number(activeNote.progressPercent) || 0, 0, 100)} percent through ${activeNote.name || activeNote.title}`
            : "No reading progress yet"
        );
      }
    }
  }

  const recentList = document.querySelector(".tutor-note-list");
  if (!recentList || !notes.length) {
    return;
  }

  if (!hasReadingHistory || !recentNotes.length) {
    recentList.innerHTML = "";
    return;
  }

  recentList.innerHTML = recentNotes.slice(0, 3).map((note) => `
    <a class="tutor-note-row" href="${escapeAttribute(note.href || "#")}">
      <span class="tutor-note-row__icon">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6 2h8l4 4v16H6Z"></path>
          <path d="M14 2v5h5"></path>
          <path d="M9 12h6M9 16h6M9 8h2"></path>
        </svg>
      </span>
      <span>
        <strong>${escapeHtml(note.name || note.title)}</strong>
        <small>${escapeHtml(note.subject)} <span>&rsaquo;</span> ${escapeHtml(note.meta || "Note")}</small>
      </span>
      <time>${escapeHtml(formatRelativeVisitTime(note.visitedAt))}</time>
      <span class="tutor-row-arrow">&rsaquo;</span>
    </a>
  `).join("");
}
