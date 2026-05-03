import { escapeAttribute, escapeHtml } from "../shared.js";
import { collectCatalogNotes, loadNotesCatalog, normalizeHubTree } from "./tree.js";

export async function initNotesHub() {
  const hub = document.querySelector("[data-notes-hub]");
  if (!hub) {
    return;
  }

  let config;
  try {
    config = await loadNotesCatalog(hub);
  } catch {
    return;
  }

  const tree = normalizeHubTree(Array.isArray(config.items) ? config.items : []);
  const subjectsRoot = document.querySelector("[data-notes-subjects-root]");
  if (!subjectsRoot) {
    return;
  }

  const renderSubjects = () => {
    subjectsRoot.innerHTML = tree
      .filter((item) => item.type === "folder")
      .map((subject, index) => {
        const notes = collectCatalogNotes(subject.children);
        const listId = `subject-list-${index + 1}`;

        return `
          <section class="notes-subject">
            <button
              class="notes-subject__toggle"
              type="button"
              aria-expanded="false"
              aria-controls="${listId}"
            >
              <span class="notes-subject__title">${escapeHtml(subject.name)}</span>
              <span class="notes-subject__count">${notes.length}</span>
            </button>
            <div class="notes-subject__panel" id="${listId}">
              <div class="notes-subject__notes">
                ${notes.length
                  ? notes
                    .map(
                      (note) => `
                        <a class="notes-subject__note" href="${escapeAttribute(note.href || "#")}">
                          <span class="notes-subject__note-title">${escapeHtml(note.name)}</span>
                          ${note.meta ? `<span class="notes-subject__note-meta">${escapeHtml(note.meta)}</span>` : ""}
                        </a>
                      `
                    )
                    .join("")
                  : '<p class="notes-subject__empty">No notes here yet.</p>'}
              </div>
            </div>
          </section>
        `;
      })
      .join("");

    window.dispatchEvent(new CustomEvent("tutor:page-content-ready"));
  };

  subjectsRoot.addEventListener("click", (event) => {
    const toggle = event.target.closest(".notes-subject__toggle");
    if (!toggle) {
      return;
    }

    const subject = toggle.closest(".notes-subject");
    if (!subject) {
      return;
    }

    const isOpen = subject.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  renderSubjects();
}
