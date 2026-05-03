import {
  escapeAttribute,
  escapeHtml,
  getStoredRecentNotes,
  normalizeComparableHref,
} from "../shared.js";
import { renderDashboardCatalog } from "./dashboard.js";
import { getSubjectIcon } from "./icons.js";
import { initSidebarSearch } from "./search.js";
import { initTutorSidebar } from "./sidebar-accordion.js";
import {
  DEFAULT_CATALOG_URL,
  collectCatalogNotes,
  fetchCatalog,
  normalizeHubTree,
  slugifyHubId,
} from "./tree.js";

function getSidebarActiveHref() {
  const current = normalizeComparableHref(window.location.href);
  const hasReadingHistory = getStoredRecentNotes().length > 0;
  const continueLink = document.querySelector(".tutor-button[href]");
  const continueHref = continueLink ? normalizeComparableHref(continueLink.getAttribute("href")) : "";

  if (!hasReadingHistory && (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html"))) {
    return "";
  }

  return window.location.pathname.endsWith("/")
    || window.location.pathname.endsWith("/index.html")
    ? continueHref
    : current;
}

export async function initCatalogSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar");
  const subjectsRoot = document.querySelector("[data-sidebar-subjects-root]");
  if (!sidebar || !subjectsRoot) {
    initTutorSidebar();
    return;
  }

  let config;
  try {
    config = await fetchCatalog(sidebar.dataset.sidebarCatalog || DEFAULT_CATALOG_URL);
  } catch {
    initTutorSidebar();
    return;
  }

  const tree = normalizeHubTree(Array.isArray(config.items) ? config.items : []);
  const subjects = tree.filter((item) => item.type === "folder");
  const activeHref = getSidebarActiveHref();
  let openSubjectId = "";

  renderDashboardCatalog(tree, activeHref);

  const renderedSubjects = subjects.map((subject, index) => {
    const notes = collectCatalogNotes(subject.children);
    const hasActiveNote = notes.some((note) => normalizeComparableHref(note.href) === activeHref);
    const subjectId = subject.id || slugifyHubId(subject.name);
    const listId = `sidebar-subject-${subjectId || index + 1}`;

    if (hasActiveNote && !openSubjectId) {
      openSubjectId = listId;
    }

    return {
      html: `
        <section class="tutor-sidebar__subject${hasActiveNote ? " is-open is-active" : ""}">
          <button type="button" class="tutor-sidebar__subject-toggle" aria-expanded="${hasActiveNote}" aria-controls="${escapeAttribute(listId)}">
            <span class="tutor-sidebar__subject-icon">${getSubjectIcon(subject.name)}</span>
            <span class="tutor-sidebar__subject-name">${escapeHtml(subject.name)}</span>
            <span class="tutor-sidebar__badge">${notes.length}</span>
            <span class="tutor-sidebar__chevron" aria-hidden="true"></span>
          </button>
          <ul id="${escapeAttribute(listId)}"${hasActiveNote ? "" : " hidden"}>
            ${notes.length
              ? notes.map((note) => {
                const isActive = normalizeComparableHref(note.href) === activeHref;
                return `
                  <li>
                    <a${isActive ? ' class="is-active"' : ""} href="${escapeAttribute(note.href || "#")}" title="${escapeAttribute(note.name)}">
                      ${escapeHtml(note.name)}
                    </a>
                  </li>
                `;
              }).join("")
              : '<li><span class="tutor-sidebar__empty">No notes yet</span></li>'}
          </ul>
        </section>
      `,
      listId,
    };
  });

  subjectsRoot.innerHTML = renderedSubjects.map((subject) => subject.html).join("");

  if (!openSubjectId && getStoredRecentNotes().length > 0) {
    const firstSubject = subjectsRoot.querySelector(".tutor-sidebar__subject");
    if (firstSubject) {
      firstSubject.classList.add("is-open");
      const toggle = firstSubject.querySelector(".tutor-sidebar__subject-toggle");
      const panel = firstSubject.querySelector("ul");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "true");
      }
      if (panel) {
        panel.hidden = false;
      }
    }
  }

  initTutorSidebar();
  initSidebarSearch(tree);
}
