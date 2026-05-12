import {
  escapeAttribute,
  escapeHtml,
  formatRelativeVisitTime,
  normalizeComparableHref,
} from "../shared.js";
import { renderDashboardCatalog } from "./dashboard.js";
import { getSubjectIcon } from "./icons.js";
import { initSidebarSearch } from "./search.js";
import { initTutorSidebar } from "./sidebar-accordion.js";
import {
  DEFAULT_CATALOG_URL,
  collectCatalogNotes,
  getCatalogNoteRows,
  loadNormalizedCatalogTree,
  slugifyHubId,
} from "./tree.js";

const FAVOURITES_PREVIEW_LIMIT = 3;
const DEFAULT_FAVOURITES_URL = "./favourites.json";
const FAVOURITES_STORAGE_KEY = "tutor-notes-favourite-overrides";
const FAVOURITES_SECTION_STORAGE_KEY = "tutor-notes-favourites-expanded";

function getSidebarPanelId(prefix, value, fallback) {
  return `${prefix}-${slugifyHubId(String(value || fallback).replace(/\//g, "-"))}`;
}

function getSidebarActiveHref() {
  const current = normalizeComparableHref(window.location.href);

  if (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html")) {
    return "";
  }

  return current;
}

function renderFolderIcon() {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.5 6.5h6.25l1.6 2H20.5v9.25A2.25 2.25 0 0 1 18.25 20H5.75A2.25 2.25 0 0 1 3.5 17.75Z"></path>
      <path d="M3.5 8.5h17"></path>
    </svg>
  `;
}

function renderStarIcon() {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3 2.7 5.55 6.13.88-4.44 4.32 1.05 6.1L12 16.98 6.56 19.85l1.05-6.1-4.44-4.32 6.13-.88Z"></path>
    </svg>
  `;
}

function renderFileIcon() {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 2h8l4 4v16H6Z"></path>
      <path d="M14 2v5h5"></path>
      <path d="M9 12h6M9 16h6M9 8h2"></path>
    </svg>
  `;
}

async function fetchFavourites(favouritesUrl) {
  const response = await fetch(favouritesUrl || DEFAULT_FAVOURITES_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load favourites (${response.status})`);
  }

  const config = await response.json();
  return Array.isArray(config) ? config : Array.isArray(config.items) ? config.items : [];
}

function getStoredFavouriteOverrides() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVOURITES_STORAGE_KEY) || "{}");
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
    };
  } catch {
    return { added: [], removed: [] };
  }
}

function setStoredFavouriteOverrides(overrides) {
  try {
    window.localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Favourites still work for the current render without storage.
  }
}

function getStoredFavouritesExpanded() {
  try {
    return window.localStorage.getItem(FAVOURITES_SECTION_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setStoredFavouritesExpanded(isExpanded) {
  try {
    window.localStorage.setItem(FAVOURITES_SECTION_STORAGE_KEY, isExpanded ? "1" : "0");
  } catch {
    // The accordion can still work for this page even without storage.
  }
}

function getFavouriteItemKey(item, notes) {
  const favourite = typeof item === "string" ? { href: item } : item;
  if (favourite?.id) {
    const note = notes.find((entry) => entry.id === favourite.id);
    if (note?.href) {
      return normalizeComparableHref(note.href);
    }
  }

  return favourite?.href ? normalizeComparableHref(favourite.href) : "";
}

function getFavourites(notes, favouriteItems) {
  const byHref = new Map(notes.map((note) => [normalizeComparableHref(note.href), note]));
  const byId = new Map(notes.map((note) => [note.id, note]));
  const overrides = getStoredFavouriteOverrides();
  const removed = new Set(overrides.removed.map((href) => normalizeComparableHref(href)));
  const seen = new Set();
  const favourites = [];

  [...favouriteItems, ...overrides.added].forEach((item) => {
    const favourite = typeof item === "string" ? { href: item } : item;
    const favouriteKey = getFavouriteItemKey(favourite, notes);
    if (!favouriteKey || removed.has(favouriteKey)) {
      return;
    }

    const matchedNote = favourite?.id ? byId.get(favourite.id) : byHref.get(normalizeComparableHref(favourite?.href));
    const note = {
      ...(matchedNote || {}),
      href: matchedNote?.href || favourite?.href,
      name: favourite?.name || matchedNote?.name || "",
      subject: favourite?.subject || matchedNote?.subject || "Notes",
      meta: favourite?.meta || matchedNote?.meta || "Note",
      visitedAt: Number(favourite?.visitedAt) || 0,
    };

    if (note.href && note.name && !seen.has(favouriteKey)) {
      seen.add(favouriteKey);
      favourites.push(note);
    }
  });

  return favourites;
}

function getFavouriteKeys(notes, favouriteItems) {
  return new Set(getFavourites(notes, favouriteItems).map((note) => normalizeComparableHref(note.href)));
}

function toggleFavourite(href, notes, favouriteItems) {
  const key = normalizeComparableHref(href);
  const note = notes.find((entry) => normalizeComparableHref(entry.href) === key);
  const overrides = getStoredFavouriteOverrides();
  const removed = new Set(overrides.removed.map((entry) => normalizeComparableHref(entry)));
  const added = new Map(
    overrides.added
      .map((entry) => [getFavouriteItemKey(entry, notes), entry])
      .filter(([entryKey]) => entryKey)
  );
  const seedHasNote = favouriteItems.some((item) => getFavouriteItemKey(item, notes) === key);
  const isFavourite = getFavouriteKeys(notes, favouriteItems).has(key);

  if (isFavourite) {
    added.delete(key);
    if (seedHasNote) {
      removed.add(key);
    }
  } else {
    removed.delete(key);
    if (!seedHasNote && note) {
      added.set(key, { href: note.href });
    }
  }

  setStoredFavouriteOverrides({
    added: [...added.values()],
    removed: [...removed],
  });
}

function renderFavouritePreview(note, index) {
  return `
    <div class="tutor-favourite-preview-row" style="--favourite-row-index: ${index};">
      <a class="tutor-favourite-link" href="${escapeAttribute(note.href || "#")}" title="${escapeAttribute(note.name)}">
        ${renderStarIcon()}
        <strong>${escapeHtml(note.name)}</strong>
      </a>
      <button class="tutor-sidebar__favorite-toggle is-favourite" type="button" data-favourite-toggle data-favourite-href="${escapeAttribute(note.href || "#")}" aria-pressed="true" aria-label="Remove from favourites">
        ${renderStarIcon()}
      </button>
    </div>
  `;
}

function renderFavouriteCard(note) {
  const meta = [
    note.meta || "Note",
    note.visitedAt ? formatRelativeVisitTime(note.visitedAt) : note.subject,
  ].filter(Boolean);

  return `
    <div class="tutor-favourite-card-row">
      <a class="tutor-favourite-card" href="${escapeAttribute(note.href || "#")}">
        <span class="tutor-favourite-card__icon">${renderFileIcon()}</span>
        <span>
          <strong>${escapeHtml(note.name)}</strong>
          <small>${meta.map((part) => escapeHtml(part)).join(" &bull; ")}</small>
        </span>
      </a>
      <button class="tutor-sidebar__favorite-toggle tutor-favourite-card__toggle is-favourite" type="button" data-favourite-toggle data-favourite-href="${escapeAttribute(note.href || "#")}" aria-pressed="true" aria-label="Remove from favourites">
        ${renderStarIcon()}
      </button>
    </div>
  `;
}

function setFavouritesScrollLock(isLocked) {
  document.documentElement.classList.toggle("tutor-favourites-scroll-lock", isLocked);
  document.body.classList.toggle("tutor-favourites-scroll-lock", isLocked);
}

function openFavouritesPopover(popover, openButton) {
  popover.hidden = false;
  setFavouritesScrollLock(true);
  window.requestAnimationFrame(() => {
    popover.classList.add("is-open");
    openButton?.setAttribute("aria-expanded", "true");
  });
}

function closeFavouritesPopover(popover, openButton) {
  popover.classList.remove("is-open");
  setFavouritesScrollLock(false);
  openButton?.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    if (!popover.classList.contains("is-open")) {
      popover.hidden = true;
    }
  }, 220);
}

function initFavouritesPopover(root, favourites, notes, favouriteItems) {
  const openButton = root.querySelector("[data-favourites-open]");
  const popover = document.createElement("div");
  popover.className = "tutor-favourites-popover";
  popover.dataset.favouritesPopover = "";
  popover.hidden = true;
  popover.innerHTML = `
    <section class="tutor-favourites-popover__panel" role="dialog" aria-labelledby="tutor-favourites-title">
      <header class="tutor-favourites-popover__header">
        <h2 class="tutor-favourites-popover__title" id="tutor-favourites-title">Favourites</h2>
        <button class="tutor-favourites-close" type="button" aria-label="Close favourites" data-favourites-close>&times;</button>
      </header>
      <div class="tutor-favourites-list">
        ${favourites.length
          ? favourites.map((note) => renderFavouriteCard(note)).join("")
          : '<p class="tutor-favourites-empty tutor-favourites-empty--modal">soo..you don\'t like anything here? :(</p>'}
      </div>
    </section>
  `;
  document.body.append(popover);

  openButton?.addEventListener("click", () => {
    if (popover.hidden) {
      openFavouritesPopover(popover, openButton);
      return;
    }

    closeFavouritesPopover(popover, openButton);
  });

  popover.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-favourite-toggle]");
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      toggleFavourite(toggle.getAttribute("data-favourite-href") || "", notes, favouriteItems);
      closeFavouritesPopover(popover, openButton);
      renderSidebarFavourites(notes, favouriteItems);
      syncFavouriteToggleStates(notes, favouriteItems);
      return;
    }

    if (event.target === popover || event.target.closest("[data-favourites-close]")) {
      closeFavouritesPopover(popover, openButton);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popover.hidden) {
      closeFavouritesPopover(popover, openButton);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      !popover.hidden
      && !popover.contains(event.target)
      && !openButton?.contains(event.target)
    ) {
      closeFavouritesPopover(popover, openButton);
    }
  });
}

function hideSidebarFavourites(root) {
  document.querySelectorAll("[data-favourites-popover]").forEach((popover) => popover.remove());
  setFavouritesScrollLock(false);
}

function renderSidebarFavourites(notes, favouriteItems) {
  const root = document.querySelector("[data-sidebar-favourites-root]");
  if (!root) {
    return;
  }
  const shouldStayExpanded = root.classList.contains("is-expanded") || getStoredFavouritesExpanded();
  document.querySelectorAll("[data-favourites-popover]").forEach((popover) => popover.remove());
  setFavouritesScrollLock(false);

  const favourites = getFavourites(notes, favouriteItems);
  if (!favourites.length) {
    hideSidebarFavourites(root);
    root.hidden = false;
    root.classList.toggle("is-expanded", shouldStayExpanded);
    root.innerHTML = `
      <button class="tutor-favourites-toggle" type="button" aria-expanded="${shouldStayExpanded}" data-favourites-section-toggle>
        <span>Favourites (0)</span>
        <span class="tutor-favourites-toggle__chevron" aria-hidden="true"></span>
      </button>
      <div class="tutor-favourites-body">
        <p class="tutor-favourites-empty">soo..you don't like anything here? :(</p>
      </div>
    `;
    window.requestAnimationFrame(() => {
      root.classList.add("is-visible");
    });
    initFavouritesSectionToggle(root);
    return;
  }

  root.hidden = false;
  root.classList.toggle("is-expanded", shouldStayExpanded);
  root.innerHTML = `
    <button class="tutor-favourites-toggle" type="button" aria-expanded="${shouldStayExpanded}" data-favourites-section-toggle>
      <span>Favourites (${favourites.length})</span>
      <span class="tutor-favourites-toggle__chevron" aria-hidden="true"></span>
    </button>
    <div class="tutor-favourites-body">
      <div class="tutor-favourites-preview">
        ${favourites.slice(0, FAVOURITES_PREVIEW_LIMIT).map((note, index) => renderFavouritePreview(note, index)).join("")}
      </div>
      <button class="tutor-favourites-open${favourites.length <= FAVOURITES_PREVIEW_LIMIT ? " tutor-favourites-open--desktop-overflow-only" : ""}" type="button" aria-expanded="false" data-favourites-open>
        View all favourites <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  `;

  window.requestAnimationFrame(() => {
    root.classList.add("is-visible");
  });
  initFavouritesSectionToggle(root);
  initFavouritesPopover(root, favourites, notes, favouriteItems);
}

function initFavouritesSectionToggle(root) {
  const toggle = root.querySelector("[data-favourites-section-toggle]");
  const body = root.querySelector(".tutor-favourites-body");
  if (!toggle || !body) {
    return;
  }

  const syncHeight = () => {
    root.style.setProperty("--favourites-body-height", `${body.scrollHeight}px`);
  };

  syncHeight();
  toggle.addEventListener("click", () => {
    syncHeight();
    const shouldExpand = !root.classList.contains("is-expanded");
    root.classList.toggle("is-expanded", shouldExpand);
    toggle.setAttribute("aria-expanded", String(shouldExpand));
    setStoredFavouritesExpanded(shouldExpand);
  });
}

function syncFavouriteToggleStates(notes, favouriteItems) {
  const favouriteKeys = getFavouriteKeys(notes, favouriteItems);
  document.querySelectorAll("[data-favourite-toggle]").forEach((button) => {
    const href = button.getAttribute("data-favourite-href") || "";
    const isFavourite = favouriteKeys.has(normalizeComparableHref(href));
    button.classList.toggle("is-favourite", isFavourite);
    button.setAttribute("aria-pressed", String(isFavourite));
    button.setAttribute("aria-label", `${isFavourite ? "Remove from" : "Add to"} favourites`);
  });
}

function initFavouriteToggles(root, notes, favouriteItems) {
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favourite-toggle]");
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggleFavourite(button.getAttribute("data-favourite-href") || "", notes, favouriteItems);
    renderSidebarFavourites(notes, favouriteItems);
    syncFavouriteToggleStates(notes, favouriteItems);
  });
}

function hasActiveNote(items, activeHref) {
  return collectCatalogNotes(items)
    .some((note) => normalizeComparableHref(note.href) === activeHref);
}

function renderSidebarItems(items, activeHref, parentId, favouriteKeys) {
  if (!items.length) {
    return '<li><span class="tutor-sidebar__empty">No notes yet</span></li>';
  }

  return items.map((item, index) => {
    if (item.type === "file") {
      const isActive = normalizeComparableHref(item.href) === activeHref;
      const isFavourite = favouriteKeys.has(normalizeComparableHref(item.href));

      return `
        <li class="tutor-sidebar__note-item">
          <a${isActive ? ' class="tutor-sidebar__note-link is-active"' : ' class="tutor-sidebar__note-link"'} href="${escapeAttribute(item.href || "#")}" title="${escapeAttribute(item.name)}">
            ${escapeHtml(item.name)}
          </a>
          <button class="tutor-sidebar__favorite-toggle${isFavourite ? " is-favourite" : ""}" type="button" data-favourite-toggle data-favourite-href="${escapeAttribute(item.href || "#")}" aria-pressed="${isFavourite}" aria-label="${isFavourite ? "Remove from" : "Add to"} favourites">
            ${renderStarIcon()}
          </button>
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
          ${renderSidebarItems(children, activeHref, folderId, favouriteKeys)}
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
    config = await loadNormalizedCatalogTree(sidebar.dataset.sidebarCatalog || DEFAULT_CATALOG_URL);
  } catch {
    initTutorSidebar();
    return;
  }
  const tree = config;
  const subjects = tree.filter((item) => item.type === "folder");
  const activeHref = getSidebarActiveHref();
  const notes = getCatalogNoteRows(tree);
  let favouriteItems = [];
  try {
    favouriteItems = await fetchFavourites(sidebar.dataset.sidebarFavourites || DEFAULT_FAVOURITES_URL);
  } catch {
    favouriteItems = [];
  }
  const favouriteKeys = getFavouriteKeys(notes, favouriteItems);
  let openSubjectId = "";

  renderDashboardCatalog(tree, activeHref);
  renderSidebarFavourites(notes, favouriteItems);

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
            ${renderSidebarItems(subject.children, activeHref, listId, favouriteKeys)}
          </ul>
        </section>
      `,
      listId,
    };
  });

  subjectsRoot.innerHTML = renderedSubjects.map((subject) => subject.html).join("");

  initTutorSidebar();
  initFavouriteToggles(sidebar, notes, favouriteItems);
  initSidebarSearch(tree);
}
