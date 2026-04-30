export const SCROLL_MEMORY_STORAGE_PREFIX = "tutor-notes-scroll:";

const CURSOR_STORAGE_KEY = "tutor-notes-cursor-mode";
const RECENT_NOTES_STORAGE_KEY = "tutor-notes-recent-history";
const RECENT_NOTES_LIMIT = 8;

export function getStoredCursorMode() {
  try {
    const value = window.localStorage.getItem(CURSOR_STORAGE_KEY);
    return value === "blob" || value === "native" ? value : "";
  } catch {
    return "";
  }
}

export function setStoredCursorMode(mode) {
  try {
    window.localStorage.setItem(CURSOR_STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}

export function getStoredRecentNotes() {
  try {
    const value = window.localStorage.getItem(RECENT_NOTES_STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        href: typeof item?.href === "string" ? item.href : "",
        title: typeof item?.title === "string" ? item.title : "",
        subject: typeof item?.subject === "string" ? item.subject : "",
        meta: typeof item?.meta === "string" ? item.meta : "",
        sectionId: typeof item?.sectionId === "string" ? item.sectionId : "",
        sectionLabel: typeof item?.sectionLabel === "string" ? item.sectionLabel : "",
        sectionTitle: typeof item?.sectionTitle === "string" ? item.sectionTitle : "",
        sectionIndex: Number(item?.sectionIndex) || 0,
        totalSections: Number(item?.totalSections) || 0,
        progressPercent: Number(item?.progressPercent) || 0,
        visitedAt: Number(item?.visitedAt) || 0,
      }))
      .filter((item) => item.href && item.title && item.visitedAt > 0)
      .sort((left, right) => right.visitedAt - left.visitedAt)
      .slice(0, RECENT_NOTES_LIMIT);
  } catch {
    return [];
  }
}

function setStoredRecentNotes(entries) {
  try {
    window.localStorage.setItem(
      RECENT_NOTES_STORAGE_KEY,
      JSON.stringify(entries.slice(0, RECENT_NOTES_LIMIT))
    );
  } catch {
    // Reading history is an enhancement, so unavailable storage is fine.
  }
}

export function rememberRecentNote(entry) {
  if (!entry || !entry.href || !entry.title) {
    return;
  }

  const normalizedHref = normalizeComparableHref(entry.href);
  const nextEntry = {
    href: normalizedHref,
    title: entry.title,
    subject: entry.subject || "",
    meta: entry.meta || "",
    sectionId: entry.sectionId || "",
    sectionLabel: entry.sectionLabel || "",
    sectionTitle: entry.sectionTitle || "",
    sectionIndex: Number(entry.sectionIndex) || 0,
    totalSections: Number(entry.totalSections) || 0,
    progressPercent: Number(entry.progressPercent) || 0,
    visitedAt: Date.now(),
  };

  const existing = getStoredRecentNotes().filter((item) => normalizeComparableHref(item.href) !== normalizedHref);
  existing.unshift(nextEntry);
  setStoredRecentNotes(existing);
}

export function formatRelativeVisitTime(timestamp) {
  const elapsed = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < hour) {
    const minutes = Math.max(1, Math.round(elapsed / minute));
    return `${minutes} min ago`;
  }

  if (elapsed < day) {
    const hours = Math.max(1, Math.round(elapsed / hour));
    return `${hours}h ago`;
  }

  if (elapsed < day * 2) {
    return "Yesterday";
  }

  const days = Math.max(2, Math.round(elapsed / day));
  return `${days} days ago`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttribute(value) {
  return escapeHtml(String(value));
}

export function slugify(text, usedSlugs) {
  const baseSlug = text
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

export function normalizeComparableHref(href) {
  try {
    const url = new URL(href, window.location.href);
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(href || "").split("?")[0];
  }
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function compactWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function getNoteAbsoluteUrl(href) {
  return new URL(href, window.location.href);
}
