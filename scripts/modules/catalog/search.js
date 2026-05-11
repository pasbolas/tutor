import {
  compactWhitespace,
  escapeAttribute,
  escapeHtml,
  getNoteAbsoluteUrl,
  slugify,
} from "../shared.js";
import { parseMarkdown } from "../markdown.js";
import {
  DEFAULT_CATALOG_URL,
  fetchCatalog,
  getCatalogNoteRows,
  normalizeHubTree,
} from "./tree.js";

function getMetadataSearchText(note) {
  return compactWhitespace([
    note.subject,
    ...(note.folderPath || []),
    note.name,
    note.meta,
  ].filter(Boolean).join(" "));
}

function getNotePageDocument(noteHtml) {
  if (typeof window === "undefined" || typeof window.DOMParser !== "function") {
    return null;
  }

  return new window.DOMParser().parseFromString(noteHtml, "text/html");
}

function getMarkdownSource(noteHtml) {
  const parsedDocument = getNotePageDocument(noteHtml);
  const source = parsedDocument
    ?.querySelector("[data-markdown-source]")
    ?.getAttribute("data-markdown-source");

  if (source) {
    return source;
  }

  return noteHtml.match(/data-markdown-source="([^"]+)"/i)?.[1] || "";
}

function getNotePageText(noteHtml) {
  const parsedDocument = getNotePageDocument(noteHtml);
  if (!parsedDocument?.body) {
    return "";
  }

  parsedDocument
    .querySelectorAll("script, style, svg, canvas")
    .forEach((node) => node.remove());

  return compactWhitespace(parsedDocument.body.textContent || "");
}

async function loadSearchableNote(note) {
  const noteUrl = getNoteAbsoluteUrl(note.href);
  const noteHtml = await fetch(noteUrl.href).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${noteUrl.href}`);
    }
    return response.text();
  });

  const markdownSource = getMarkdownSource(noteHtml);
  if (!markdownSource) {
    const pageText = getNotePageText(noteHtml);
    return {
      ...note,
      sections: [],
      searchText: compactWhitespace(`${getMetadataSearchText(note)} ${pageText}`),
    };
  }

  const markdownUrl = new URL(markdownSource, noteUrl.href);
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
    activeSection = { id, title, body: [] };
    sections.push(activeSection);
    return activeSection;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 1) {
      return;
    }

    if (block.type === "heading" && block.level === 2) {
      const id = slugify(block.text, usedSlugs);
      activeSection = { id, title: block.text, body: [] };
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

    if (block.type === "quote") {
      section.body.push(block.text);
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
      ...(note.folderPath || []),
      note.name,
      note.meta,
      ...sections.flatMap((section) => [section.title, section.body.join(" ")]),
    ].join(" ")),
  };
}

async function loadNotesFromCatalog(catalogUrl) {
  const config = await fetchCatalog(catalogUrl);
  const tree = normalizeHubTree(Array.isArray(config.items) ? config.items : []);
  return getCatalogNoteRows(tree);
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
  const folderPath = compactWhitespace((candidate.folderPath || []).join(" ")).toLowerCase();
  const section = compactWhitespace(candidate.sectionTitle || "").toLowerCase();
  const snippet = compactWhitespace(candidate.snippet || "").toLowerCase();

  return queryTerms.reduce((score, term) => {
    let nextScore = score;
    if (title.includes(term)) nextScore += 18;
    if (subject.includes(term)) nextScore += 7;
    if (folderPath.includes(term)) nextScore += 7;
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
    const noteCorpus = compactWhitespace([
      note.name,
      note.subject,
      note.meta,
      ...(note.folderPath || []),
      note.searchText,
    ].join(" ")).toLowerCase();
    const titleAndFolderMatch = queryTerms.every((term) => noteCorpus.includes(term));

    if (titleAndFolderMatch) {
      matches.push({
        type: "note",
        href: note.href,
        title: note.name,
        subject: note.subject,
        folderPath: note.folderPath || [],
        meta: note.meta,
        sectionTitle: "",
        snippet: getSearchSnippet(note.searchText || note.meta || note.subject, trimmed),
      });
    }

    (note.sections || []).forEach((section) => {
      const corpus = `${note.name} ${note.subject} ${(note.folderPath || []).join(" ")} ${section.title} ${section.bodyText}`.toLowerCase();
      if (!queryTerms.every((term) => corpus.includes(term))) {
        return;
      }

      matches.push({
        type: "section",
        href: section.href,
        title: note.name,
        subject: note.subject,
        folderPath: note.folderPath || [],
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
      <small>${[
        result.subject,
        ...(result.folderPath || []),
        result.sectionTitle || result.meta || "Note",
      ].filter(Boolean).map((part) => escapeHtml(part)).join(" <span>&rsaquo;</span> ")}</small>
      <p>${escapeHtml(result.snippet || "")}</p>
    </a>
  `).join("");
}

export function initSidebarSearch(tree) {
  const input = document.querySelector(".tutor-search__input");
  const resultsRoot = document.querySelector("[data-search-results]");
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!input || !resultsRoot) {
    return;
  }

  const fallbackNotes = getCatalogNoteRows(Array.isArray(tree) ? tree : []);
  const catalogUrl = sidebar?.dataset.sidebarCatalog || DEFAULT_CATALOG_URL;
  let searchIndexPromise = null;

  const loadIndex = async () => {
    if (!searchIndexPromise) {
      searchIndexPromise = (async () => {
        let notes = fallbackNotes;

        try {
          notes = await loadNotesFromCatalog(catalogUrl);
        } catch {
          notes = fallbackNotes;
        }

        return Promise.all(notes.map(async (note) => {
          try {
            return await loadSearchableNote(note);
          } catch {
            return {
              ...note,
              sections: [],
              searchText: getMetadataSearchText(note),
            };
          }
        }));
      })();
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
