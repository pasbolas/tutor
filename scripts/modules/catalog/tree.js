import { slugifyId } from "../shared.js";

const normalizedTreeCache = new Map();

function slugifyHubId(text) {
  return slugifyId(text, "item");
}

export function normalizeHubTree(items, parentId = "") {
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

export const DEFAULT_CATALOG_URL = "/catalog.json";

export async function fetchCatalog(catalogUrl) {
  const response = await fetch(catalogUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${catalogUrl} (${response.status})`);
  }

  return response.json();
}

export async function loadNormalizedCatalogTree(catalogUrl = DEFAULT_CATALOG_URL) {
  if (!normalizedTreeCache.has(catalogUrl)) {
    normalizedTreeCache.set(
      catalogUrl,
      (async () => {
        const config = await fetchCatalog(catalogUrl);
        return normalizeHubTree(Array.isArray(config.items) ? config.items : []);
      })()
    );
  }

  return normalizedTreeCache.get(catalogUrl);
}

export async function loadNotesCatalog(hub) {
  const catalogUrl = hub.dataset.notesCatalog || DEFAULT_CATALOG_URL;
  if (catalogUrl) {
    return fetchCatalog(catalogUrl);
  }

  const dataNode = document.querySelector("[data-notes-tree]");
  if (!dataNode) {
    return { items: [] };
  }

  return JSON.parse(dataNode.textContent || "{}");
}

export function collectCatalogNotes(items, folderPath = []) {
  return items.flatMap((item) => {
    if (item.type === "file") {
      return [{
        ...item,
        folderPath,
      }];
    }

    return collectCatalogNotes(
      Array.isArray(item.children) ? item.children : [],
      [...folderPath, item.name]
    );
  });
}

export function getCatalogNoteRows(tree) {
  return tree
    .filter((item) => item.type === "folder")
    .flatMap((subject) => collectCatalogNotes(subject.children).map((note) => ({
      ...note,
      subject: subject.name,
    })));
}

export { slugifyHubId };
