import {
  clamp,
  compactWhitespace,
  escapeAttribute,
  escapeHtml,
  escapeRegExp,
  formatRelativeVisitTime,
  getNoteAbsoluteUrl,
  getStoredRecentNotes,
  normalizeComparableHref,
  slugify,
} from "./shared.js";
import { parseMarkdown } from "./markdown.js";

function slugifyHubId(text) {
  return text
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function normalizeHubTree(items, parentId = "") {
  return items.map((item, index) => {
    const safeName = typeof item.name === "string" ? item.name : `Item ${index + 1}`;
    const id = item.id || [parentId, slugifyHubId(safeName)].filter(Boolean).join("/");
    const type = item.type === "file" ? "file" : "folder";

    if (type === "folder") {
      return {
        ...item,
        id,
        type,
        children: normalizeHubTree(Array.isArray(item.children) ? item.children : [], id),
      };
    }

    return {
      ...item,
      id,
      type,
      href: item.href || "#",
    };
  });
}

async function loadNotesCatalog(hub) {
  const catalogUrl = hub.dataset.notesCatalog;
  if (catalogUrl) {
    const response = await fetch(catalogUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${catalogUrl} (${response.status})`);
    }

    return response.json();
  }

  const dataNode = document.querySelector("[data-notes-tree]");
  if (!dataNode) {
    return { items: [] };
  }

  return JSON.parse(dataNode.textContent || "{}");
}

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

  const collectNotes = (items) => items.flatMap((item) => {
    if (item.type === "file") {
      return [item];
    }

    return collectNotes(item.children);
  });

  const renderSubjects = () => {
    subjectsRoot.innerHTML = tree
      .filter((item) => item.type === "folder")
      .map((subject, index) => {
        const notes = collectNotes(subject.children);
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

function initTutorSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!sidebar) {
    return;
  }

  const subjects = Array.from(sidebar.querySelectorAll(".tutor-sidebar__subject"));
  if (!subjects.length) {
    return;
  }

  const setSubjectOpen = (subject, isOpen) => {
    const toggle = subject.querySelector(".tutor-sidebar__subject-toggle");
    const panel = subject.querySelector("ul");

    if (toggle) {
      toggle.setAttribute("aria-expanded", String(isOpen));
    }
    if (panel) {
      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);

      if (isOpen) {
        panel.hidden = false;
        window.requestAnimationFrame(() => {
          panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
          subject.classList.add("is-open");
        });
        return;
      }

      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
      window.requestAnimationFrame(() => {
        subject.classList.remove("is-open");
        panel.style.setProperty("--sidebar-subject-panel-height", "0px");
      });

      const hidePanel = (event) => {
        if (event.target !== panel || event.propertyName !== "max-height") {
          return;
        }
        panel.hidden = true;
        panel.removeEventListener("transitionend", hidePanel);
      };

      panel.addEventListener("transitionend", hidePanel);
      window.setTimeout(() => {
        if (!subject.classList.contains("is-open")) {
          panel.hidden = true;
          panel.removeEventListener("transitionend", hidePanel);
        }
      }, 320);
      return;
    }

    subject.classList.toggle("is-open", isOpen);
  };

  subjects.forEach((subject) => {
    setSubjectOpen(subject, subject.classList.contains("is-open"));
  });

  sidebar.addEventListener("click", (event) => {
    const toggle = event.target.closest(".tutor-sidebar__subject-toggle");
    if (toggle) {
      const subject = toggle.closest(".tutor-sidebar__subject");
      if (!subject) {
        return;
      }

      const shouldOpen = !subject.classList.contains("is-open");
      subjects.forEach((candidate) => {
        setSubjectOpen(candidate, candidate === subject ? shouldOpen : false);
        candidate.classList.toggle("is-active", candidate === subject);
      });
      return;
    }

    const topic = event.target.closest(".tutor-sidebar li a");
    if (!topic) {
      return;
    }

    sidebar.querySelectorAll(".tutor-sidebar li a.is-active").forEach((link) => {
      link.classList.remove("is-active");
    });
    topic.classList.add("is-active");

    const activeSubject = topic.closest(".tutor-sidebar__subject");
    subjects.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === activeSubject);
    });
  });
}

function getSubjectIcon(subjectName) {
  const normalizedName = subjectName.toLowerCase();

  if (normalizedName.includes("law")) {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 4v16"></path>
        <path d="M5 8h14"></path>
        <path d="m7 8-3 6h6Z"></path>
        <path d="m17 8-3 6h6Z"></path>
      </svg>
    `;
  }

  if (normalizedName.includes("data")) {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 8h14"></path>
        <path d="M5 16h14"></path>
        <circle cx="7" cy="8" r="2"></circle>
        <circle cx="17" cy="16" r="2"></circle>
      </svg>
    `;
  }

  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 9h8"></path>
      <path d="M8 15h8"></path>
      <path d="M9 4 5 20"></path>
      <path d="m19 4-4 16"></path>
    </svg>
  `;
}

function collectCatalogNotes(items) {
  return items.flatMap((item) => {
    if (item.type === "file") {
      return [item];
    }

    return collectCatalogNotes(Array.isArray(item.children) ? item.children : []);
  });
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

function getCatalogNoteRows(tree) {
  return tree
    .filter((item) => item.type === "folder")
    .flatMap((subject) => collectCatalogNotes(subject.children).map((note) => ({
      ...note,
      subject: subject.name,
    })));
}

async function loadSearchableNote(note) {
  const noteUrl = getNoteAbsoluteUrl(note.href);
  const noteHtml = await fetch(noteUrl.href).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${noteUrl.href}`);
    }
    return response.text();
  });

  const sourceMatch = noteHtml.match(/data-markdown-source="([^"]+)"/i);
  if (!sourceMatch) {
    return {
      ...note,
      sections: [],
      searchText: compactWhitespace(`${note.subject} ${note.name} ${note.meta}`),
    };
  }

  const markdownUrl = new URL(sourceMatch[1], noteUrl.href);
  const markdown = await fetch(markdownUrl.href).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${markdownUrl.href}`);
    }
    return response.text();
  });

  const blocks = parseMarkdown(markdown);
  const sections = [];
  const usedSlugs = new Set();
  let activeSection = null;

  const ensureSection = (title = "Guide Overview") => {
    if (activeSection) {
      return activeSection;
    }

    const id = slugify(title, usedSlugs);
    activeSection = {
      id,
      title,
      body: [],
    };
    sections.push(activeSection);
    return activeSection;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 1) {
      return;
    }

    if (block.type === "heading" && block.level === 2) {
      const id = slugify(block.text, usedSlugs);
      activeSection = {
        id,
        title: block.text,
        body: [],
      };
      sections.push(activeSection);
      return;
    }

    const section = ensureSection();

    if (block.type === "paragraph") {
      section.body.push(block.text);
      return;
    }

    if (block.type === "list") {
      section.body.push(block.items.join(" "));
      return;
    }

    if (block.type === "heading") {
      section.body.push(block.text);
    }
  });

  return {
    ...note,
    sections: sections.map((section, index) => ({
      ...section,
      label: String(index + 1).padStart(2, "0"),
      bodyText: compactWhitespace(section.body.join(" ")),
      href: `${note.href.split("#")[0]}#${section.id}`,
    })),
    searchText: compactWhitespace([
      note.subject,
      note.name,
      note.meta,
      ...sections.flatMap((section) => [section.title, section.body.join(" ")]),
    ].join(" ")),
  };
}

function getSearchSnippet(text, query) {
  const normalizedText = compactWhitespace(text);
  const lowerText = normalizedText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return normalizedText.slice(0, 120);
  }

  const start = Math.max(0, matchIndex - 38);
  const end = Math.min(normalizedText.length, matchIndex + lowerQuery.length + 58);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalizedText.length ? "..." : "";
  return `${prefix}${normalizedText.slice(start, end)}${suffix}`;
}

function scoreSearchCandidate(candidate, queryTerms) {
  const title = compactWhitespace(candidate.title || candidate.name || "").toLowerCase();
  const subject = compactWhitespace(candidate.subject || "").toLowerCase();
  const meta = compactWhitespace(candidate.meta || "").toLowerCase();
  const section = compactWhitespace(candidate.sectionTitle || "").toLowerCase();
  const snippet = compactWhitespace(candidate.snippet || "").toLowerCase();

  return queryTerms.reduce((score, term) => {
    let nextScore = score;
    if (title.includes(term)) nextScore += 18;
    if (subject.includes(term)) nextScore += 7;
    if (meta.includes(term)) nextScore += 5;
    if (section.includes(term)) nextScore += 10;
    if (snippet.includes(term)) nextScore += 4;
    if (title.startsWith(term)) nextScore += 8;
    if (section.startsWith(term)) nextScore += 6;
    return nextScore;
  }, 0);
}

function buildSearchResults(query, index) {
  const trimmed = compactWhitespace(query);
  if (!trimmed) {
    return [];
  }

  const queryTerms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = [];

  index.forEach((note) => {
    const titleText = `${note.name} ${note.subject} ${note.meta}`.toLowerCase();
    const titleMatch = queryTerms.every((term) => titleText.includes(term));

    if (titleMatch) {
      matches.push({
        type: "note",
        href: note.href,
        title: note.name,
        subject: note.subject,
        meta: note.meta,
        sectionTitle: "",
        snippet: note.meta || note.subject,
      });
    }

    note.sections.forEach((section) => {
      const corpus = `${note.name} ${note.subject} ${section.title} ${section.bodyText}`.toLowerCase();
      if (!queryTerms.every((term) => corpus.includes(term))) {
        return;
      }

      matches.push({
        type: "section",
        href: section.href,
        title: note.name,
        subject: note.subject,
        meta: note.meta,
        sectionTitle: section.title,
        snippet: getSearchSnippet(section.bodyText || section.title, trimmed),
      });
    });
  });

  const deduped = [];
  const seen = new Set();
  matches
    .sort((left, right) => (
      scoreSearchCandidate(right, queryTerms) - scoreSearchCandidate(left, queryTerms)
    ))
    .forEach((match) => {
      const key = `${match.href}|${match.type}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      deduped.push(match);
    });

  return deduped.slice(0, 8);
}

function renderSidebarSearchResults(resultsRoot, query, results) {
  if (!resultsRoot) {
    return;
  }

  if (!compactWhitespace(query)) {
    resultsRoot.hidden = true;
    resultsRoot.innerHTML = "";
    return;
  }

  if (!results.length) {
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = `
      <div class="tutor-search-results__empty">
        <strong>No matches</strong>
        <span>Try a note title, subject, or a term from inside a note.</span>
      </div>
    `;
    return;
  }

  resultsRoot.hidden = false;
  resultsRoot.innerHTML = results.map((result) => `
    <a class="tutor-search-result" href="${escapeAttribute(result.href)}">
      <span class="tutor-search-result__kind">${result.type === "section" ? "Section" : "Note"}</span>
      <strong>${escapeHtml(result.title)}</strong>
      <small>${escapeHtml(result.subject)} <span>&rsaquo;</span> ${escapeHtml(result.sectionTitle || result.meta || "Note")}</small>
      <p>${escapeHtml(result.snippet || "")}</p>
    </a>
  `).join("");
}

function initSidebarSearch(tree) {
  const input = document.querySelector(".tutor-search__input");
  const resultsRoot = document.querySelector("[data-search-results]");
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!input || !resultsRoot) {
    return;
  }

  const notes = getCatalogNoteRows(tree);
  let searchIndexPromise = null;

  const loadIndex = async () => {
    if (!searchIndexPromise) {
      searchIndexPromise = Promise.all(notes.map(async (note) => {
        try {
          return await loadSearchableNote(note);
        } catch {
          return {
            ...note,
            sections: [],
            searchText: compactWhitespace(`${note.subject} ${note.name} ${note.meta}`),
          };
        }
      }));
    }

    return searchIndexPromise;
  };

  let activeToken = 0;

  const setSearchOpen = (isOpen) => {
    sidebar?.classList.toggle("is-searching", isOpen);
  };

  const runSearch = async () => {
    const query = input.value;
    const token = ++activeToken;
    if (!compactWhitespace(query)) {
      setSearchOpen(false);
      renderSidebarSearchResults(resultsRoot, "", []);
      return;
    }

    setSearchOpen(true);
    resultsRoot.hidden = false;
    resultsRoot.innerHTML = '<div class="tutor-search-results__empty"><strong>Searching...</strong><span>Scanning note titles and sections.</span></div>';

    const index = await loadIndex();
    if (token !== activeToken) {
      return;
    }

    renderSidebarSearchResults(resultsRoot, query, buildSearchResults(query, index));
  };

  input.addEventListener("input", runSearch);
  input.addEventListener("focus", () => {
    if (compactWhitespace(input.value)) {
      runSearch();
    }
  });

  document.addEventListener("click", (event) => {
    if (resultsRoot.contains(event.target) || input.contains(event.target)) {
      return;
    }
    setSearchOpen(false);
    resultsRoot.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      input.focus();
      input.select();
    }

    if (event.key === "Escape" && document.activeElement === input) {
      input.blur();
      setSearchOpen(false);
      resultsRoot.hidden = true;
    }
  });
}

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

function renderDashboardCatalog(tree, activeHref) {
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

export async function initCatalogSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar[data-sidebar-catalog]");
  const subjectsRoot = document.querySelector("[data-sidebar-subjects-root]");
  if (!sidebar || !subjectsRoot) {
    initTutorSidebar();
    return;
  }

  let config;
  try {
    const response = await fetch(sidebar.dataset.sidebarCatalog, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${sidebar.dataset.sidebarCatalog}`);
    }
    config = await response.json();
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
