import { rememberRecentNote } from "./shared.js";

const DEFAULT_THROTTLE_MS = 750;

export class StatusTracker {
  constructor({ getEntry, getKey, throttleMs = DEFAULT_THROTTLE_MS } = {}) {
    this.getEntry = typeof getEntry === "function" ? getEntry : null;
    this.getKey = typeof getKey === "function" ? getKey : null;
    this.throttleMs = throttleMs;
    this.lastPersistAt = 0;
    this.lastKey = "";
    this.persistTimer = 0;
  }

  persist(entry, { force = false } = {}) {
    const nextEntry = entry || this.getEntry?.();
    if (!nextEntry || !nextEntry.href || !nextEntry.title) {
      return;
    }

    const key = this.getKey ? this.getKey(nextEntry) : this.getDefaultKey(nextEntry);
    const now = Date.now();

    if (!force && key && key === this.lastKey) {
      return;
    }

    if (!force && now - this.lastPersistAt < this.throttleMs) {
      window.clearTimeout(this.persistTimer);
      this.persistTimer = window.setTimeout(() => {
        this.persist(nextEntry, { force: true });
      }, this.throttleMs);
      return;
    }

    this.lastKey = key;
    this.lastPersistAt = now;
    rememberRecentNote(nextEntry);
  }

  flush() {
    window.clearTimeout(this.persistTimer);
    this.persist(undefined, { force: true });
  }

  getDefaultKey(entry) {
    return [
      entry.href,
      entry.sectionId,
      entry.sectionIndex,
      entry.progressPercent,
    ].join(":");
  }
}
