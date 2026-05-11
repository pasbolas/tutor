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

function getSidebarPanelId(prefix, value, fallback) {
  return `${prefix}-${slugifyHubId(String(value || fallback).replace(/\//g, "-"))}`;
}

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

function renderFolderIcon() {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.5 6.5h6.25l1.6 2H20.5v9.25A2.25 2.25 0 0 1 18.25 20H5.75A2.25 2.25 0 0 1 3.5 17.75Z"></path>
      <path d="M3.5 8.5h17"></path>
    </svg>
  `;
}

function hasActiveNote(items, activeHref) {
  return collectCatalogNotes(items)
    .some((note) => normalizeComparableHref(note.href) === activeHref);
}

function renderSidebarItems(items, activeHref, parentId) {
  if (!items.length) {
    return '<li><span class="tutor-sidebar__empty">No notes yet</span></li>';
  }

  return items.map((item, index) => {
    if (item.type === "file") {
      const isActive = normalizeComparableHref(item.href) === activeHref;

      return `
        <li class="tutor-sidebar__note-item">
          <a${isActive ? ' class="tutor-sidebar__note-link is-active"' : ' class="tutor-sidebar__note-link"'} href="${escapeAttribute(item.href || "#")}" title="${escapeAttribute(item.name)}">
            ${escapeHtml(item.name)}
          </a>
        </li>
      `;
    }

    const children = Array.isArray(item.children) ? item.children : [];
    const notes = collectCatalogNotes(children);
    const isOpen = hasActiveNote(children, activeHref);
    const folderId = getSidebarPanelId("sidebar-folder", item.id, `${parentId}-${index + 1}`);

    return `
      <li class="tutor-sidebar__subfolder${isOpen ? " is-open is-active" : ""}">
        <button type="button" class="tutor-sidebar__folder-toggle" aria-expanded="${isOpen}" aria-controls="${escapeAttribute(folderId)}">
          <span class="tutor-sidebar__folder-icon">${renderFolderIcon()}</span>
          <span class="tutor-sidebar__folder-name">${escapeHtml(item.name)}</span>
          <span class="tutor-sidebar__folder-count">${notes.length}</span>
          <span class="tutor-sidebar__folder-chevron" aria-hidden="true"></span>
        </button>
        <ul class="tutor-sidebar__folder-list" id="${escapeAttribute(folderId)}"${isOpen ? "" : " hidden"}>
          ${renderSidebarItems(children, activeHref, folderId)}
        </ul>
      </li>
    `;
  }).join("");
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
    const listId = getSidebarPanelId("sidebar-subject", subjectId, index + 1);

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
          <ul class="tutor-sidebar__subject-list" id="${escapeAttribute(listId)}"${hasActiveNote ? "" : " hidden"}>
            ${renderSidebarItems(subject.children, activeHref, listId)}
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
      const panel = firstSubject.querySelector(".tutor-sidebar__subject-list");
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
