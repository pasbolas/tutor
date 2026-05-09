import { rememberRecentNote } from "./shared.js";

const PDFJS_VERSION = "4.10.38";
const PDFJS_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs`;
const PDFJS_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getRequiredElement = (root, selector) => {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Missing PDF reader element: ${selector}`);
  }
  return element;
};

class SimplePDFReader {
  constructor(root) {
    this.root = root;
    this.defaultUrl = root.dataset.pdfUrl;
    this.sourceUrl = this.defaultUrl;
    this.sourceName = this.defaultUrl ? this.defaultUrl.split("/").pop() : "document.pdf";
    this.objectUrl = null;
    this.pdfjs = null;
    this.pdf = null;
    this.pages = [];
    this.currentPage = 1;
    this.pageCount = 0;
    this.zoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 2.6;
    this.fitMode = true;
    this.renderToken = 0;
    this.scrollTicking = false;
    this.progressTicking = false;
    this.progressPersistTimer = 0;
    this.lastProgressPersistAt = 0;
    this.lastProgressKey = "";

    this.loading = getRequiredElement(root, "[data-pdf-loading]");
    this.error = getRequiredElement(root, "[data-pdf-error]");
    this.retryButton = getRequiredElement(root, "[data-pdf-retry]");
    this.dock = getRequiredElement(root, ".pdf-reader__dock");
    this.toolsGroup = getRequiredElement(root, ".pdf-reader__dock-group--tools");
    this.navGroup = getRequiredElement(root, ".pdf-reader__dock-group--nav");
    this.zoomGroup = getRequiredElement(root, ".pdf-reader__dock-group--zoom");
    this.actionsGroup = getRequiredElement(root, ".pdf-reader__dock-group--actions");
    this.scrollRoot = getRequiredElement(root, "[data-pdf-scroll]");
    this.pagesRoot = getRequiredElement(root, "[data-pdf-pages]");
    this.backButton = getRequiredElement(root, "[data-pdf-back]");
    this.openLocalButtons = Array.from(root.querySelectorAll("[data-pdf-open-local]"));
    this.fileInput = root.querySelector("[data-pdf-file-input]");
    this.downloadLink = getRequiredElement(root, "[data-pdf-download]");
    this.printButton = getRequiredElement(root, "[data-pdf-print]");
    this.previousButton = getRequiredElement(root, "[data-pdf-prev]");
    this.nextButton = getRequiredElement(root, "[data-pdf-next]");
    this.pageInput = getRequiredElement(root, "[data-pdf-page-input]");
    this.totalPages = getRequiredElement(root, "[data-pdf-total-pages]");
    this.pageLabel = root.querySelector("[data-pdf-page-label]");
    this.pageBadge = root.querySelector("[data-pdf-page-badge]");
    this.zoomLabel = getRequiredElement(root, "[data-pdf-zoom-label]");
    this.zoomOutButton = getRequiredElement(root, "[data-pdf-zoom-out]");
    this.zoomInButton = getRequiredElement(root, "[data-pdf-zoom-in]");
    this.fitWidthButton = getRequiredElement(root, "[data-pdf-fit-width]");
    this.mobileControls = null;
    this.mobileControlsRow = null;
    this.actionsPlacementIsBottom = false;
  }

  async init() {
    this.bindEvents();
    this.updateActionsPlacement();
    this.setSource(this.sourceUrl, this.sourceName);
    await this.loadPdf(this.sourceUrl, this.sourceName);
  }

  bindEvents() {
    this.backButton.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = "../../index.html";
    });

    if (this.fileInput) {
      this.openLocalButtons.forEach((button) => {
        button.addEventListener("click", () => this.fileInput.click());
      });
      this.fileInput.addEventListener("change", () => this.openSelectedFile());
    }
    this.printButton.addEventListener("click", () => this.printCurrentPdf());
    this.retryButton.addEventListener("click", () => this.loadPdf(this.sourceUrl, this.sourceName));
    this.previousButton.addEventListener("click", () => this.goToPage(this.currentPage - 1));
    this.nextButton.addEventListener("click", () => this.goToPage(this.currentPage + 1));
    this.zoomOutButton.addEventListener("click", () => this.setZoom(this.zoom - 0.1, { fitMode: false }));
    this.zoomInButton.addEventListener("click", () => this.setZoom(this.zoom + 0.1, { fitMode: false }));
    this.fitWidthButton.addEventListener("click", () => this.fitWidth());
    this.pageInput.addEventListener("change", () => this.goToPage(Number(this.pageInput.value)));
    this.pageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.goToPage(Number(this.pageInput.value));
        this.pageInput.blur();
      }
    });

    this.scrollRoot.addEventListener("scroll", () => this.queueCurrentPageSync(), { passive: true });
    this.scrollRoot.addEventListener("scroll", () => this.queueProgressPersist(), { passive: true });
    this.scrollRoot.addEventListener("wheel", (event) => this.handleWheel(event), { passive: false });
    window.addEventListener("resize", () => this.handleResize());
    document.addEventListener("keydown", (event) => this.handleKeydown(event));
    window.addEventListener("pagehide", () => this.persistReadingProgress({ force: true }), { once: true });
  }

  async loadPdf(sourceUrl, sourceName = "document.pdf") {
    const token = this.renderToken + 1;
    this.renderToken = token;
    this.sourceUrl = sourceUrl;
    this.sourceName = sourceName;
    this.setLoading(true);
    this.setError(false);
    this.clearPages();
    this.setSource(sourceUrl, sourceName);

    try {
      await this.ensurePdfjs();
      this.pdf = await this.pdfjs.getDocument(sourceUrl).promise;
      if (token !== this.renderToken) {
        return;
      }

      this.pageCount = this.pdf.numPages;
      this.currentPage = 1;
      this.syncControls();
      await this.preparePages(token);
      this.fitWidth({ rerender: false });
      await this.renderAllPages(token);
      this.setLoading(false);
      this.centerCurrentPage();
      this.queueCurrentPageSync();
      this.persistReadingProgress({ force: true });
    } catch (error) {
      console.error(error);
      if (token === this.renderToken) {
        this.setLoading(false);
        this.setError(true);
      }
    }
  }

  async ensurePdfjs() {
    if (this.pdfjs) {
      return;
    }

    this.pdfjs = await import(PDFJS_URL);
    this.pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  }

  clearPages() {
    this.pagesRoot.textContent = "";
    this.pages = [];
    this.pageCount = 0;
    this.currentPage = 1;
  }

  async preparePages(token) {
    const fragment = document.createDocumentFragment();
    this.pages = [];

    for (let pageNumber = 1; pageNumber <= this.pageCount; pageNumber += 1) {
      const page = await this.pdf.getPage(pageNumber);
      if (token !== this.renderToken) {
        return;
      }

      const wrapper = document.createElement("article");
      const canvas = document.createElement("canvas");

      wrapper.className = "pdf-reader__page";
      wrapper.dataset.pdfPage = String(pageNumber);
      wrapper.id = `pdf-page-${pageNumber}`;
      canvas.className = "pdf-reader__canvas";

      wrapper.appendChild(canvas);
      fragment.appendChild(wrapper);
      this.pages.push({ pageNumber, page, wrapper, canvas });
    }

    this.pagesRoot.appendChild(fragment);
  }

  async renderAllPages(token) {
    this.root.classList.add("is-rendering");
    for (const pageRecord of this.pages) {
      await this.renderPage(pageRecord, this.zoom, token);
      if (token !== this.renderToken) {
        return;
      }
    }
    this.root.classList.remove("is-rendering");
  }

  async renderPage(pageRecord, scale, token) {
    const viewport = pageRecord.page.getViewport({ scale });
    const canvas = pageRecord.canvas;
    const context = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    pageRecord.wrapper.style.width = `${viewport.width}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    await pageRecord.page.render({ canvasContext: context, viewport }).promise;

    if (token === this.renderToken) {
      pageRecord.renderedScale = scale;
    }
  }

  async rerenderPages() {
    if (!this.pdf) {
      return;
    }

    const token = this.renderToken + 1;
    this.renderToken = token;
    const currentPage = this.currentPage;
    const currentElement = this.getPageElement(currentPage);
    const offset = currentElement ? currentElement.getBoundingClientRect().top - this.scrollRoot.getBoundingClientRect().top : 0;

    await this.renderAllPages(token);
    if (token !== this.renderToken) {
      return;
    }

    this.syncControls();
    this.syncHorizontalOverflowState();
    const nextElement = this.getPageElement(currentPage);
    if (nextElement) {
      this.scrollRoot.scrollTo({
        top: this.scrollRoot.scrollTop + nextElement.getBoundingClientRect().top - this.scrollRoot.getBoundingClientRect().top - offset,
        left: Math.max(0, (this.scrollRoot.scrollWidth - this.scrollRoot.clientWidth) / 2),
        behavior: "instant",
      });
    }
    this.queueCurrentPageSync();
  }

  setSource(sourceUrl, sourceName) {
    this.downloadLink.href = sourceUrl;
    this.downloadLink.download = sourceName || "document.pdf";
  }

  setLoading(isLoading) {
    this.loading.hidden = !isLoading;
    this.scrollRoot.hidden = false;
    this.root.classList.toggle("is-loading", isLoading);
  }

  setError(hasError) {
    this.error.hidden = !hasError;
    this.scrollRoot.hidden = hasError;
    this.root.classList.toggle("has-error", hasError);
  }

  syncControls() {
    this.pageInput.max = String(this.pageCount || 1);
    this.pageInput.value = String(this.currentPage || 1);
    this.totalPages.textContent = this.pageCount ? String(this.pageCount) : "...";
    const totalLabel = this.pageCount ? String(this.pageCount) : "--";
    const pageLabel = `${this.currentPage || 1} / ${totalLabel}`;
    if (this.pageLabel) {
      this.pageLabel.textContent = pageLabel;
    }
    if (this.pageBadge) {
      this.pageBadge.textContent = pageLabel;
    }
    this.previousButton.disabled = !this.pageCount || this.currentPage <= 1;
    this.nextButton.disabled = !this.pageCount || this.currentPage >= this.pageCount;
    this.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
    this.zoomOutButton.disabled = this.zoom <= this.minZoom + 0.001;
    this.zoomInButton.disabled = this.zoom >= this.maxZoom - 0.001;
    this.fitWidthButton.classList.toggle("is-active", this.fitMode);
  }

  syncHorizontalOverflowState() {
    const widestPage = this.pages.reduce((width, pageRecord) => (
      Math.max(width, pageRecord.wrapper.getBoundingClientRect().width)
    ), 0);
    const availableWidth = this.getScrollAvailableWidth();
    const isWiderThanViewport = widestPage > availableWidth + 1;
    this.pagesRoot.classList.toggle("is-wider-than-viewport", isWiderThanViewport);
    return isWiderThanViewport;
  }

  updateActionsPlacement() {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;

    if (isMobile) {
      if (!this.mobileControls) {
        this.mobileControls = document.createElement("div");
        this.mobileControls.className = "pdf-reader__mobile-controls";
      }
      if (!this.mobileControlsRow) {
        this.mobileControlsRow = document.createElement("div");
        this.mobileControlsRow.className = "pdf-reader__mobile-controls-row";
      }
      if (!this.mobileControls.isConnected) {
        this.root.appendChild(this.mobileControls);
      }

      this.navGroup.classList.add("is-floating");
      this.zoomGroup.classList.add("is-floating");
      this.actionsGroup.classList.add("is-floating");
      this.mobileControlsRow.append(this.navGroup, this.zoomGroup);
      this.mobileControls.replaceChildren(this.mobileControlsRow, this.actionsGroup);
      this.actionsPlacementIsBottom = true;
      return;
    }

    if (!isMobile && this.actionsPlacementIsBottom) {
      this.navGroup.classList.remove("is-floating");
      this.zoomGroup.classList.remove("is-floating");
      this.actionsGroup.classList.remove("is-floating");
      this.dock.append(this.navGroup, this.zoomGroup, this.actionsGroup);
      if (this.mobileControls && this.mobileControls.isConnected) {
        this.mobileControls.remove();
      }
      if (this.mobileControlsRow) {
        this.mobileControlsRow.remove();
      }
      this.actionsPlacementIsBottom = false;
    }
  }

  getScrollAvailableWidth() {
    const styles = window.getComputedStyle(this.scrollRoot);
    const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
    return Math.max(0, this.scrollRoot.clientWidth - paddingLeft - paddingRight);
  }

  getPageTitle() {
    const title = this.root.querySelector(".pdf-reader__name")?.textContent?.trim();
    return title || document.title.replace(/\s*\|\s*Tutor Notes\s*$/i, "").trim() || "PDF";
  }

  getSubjectLabel() {
    const code = this.root.querySelector(".pdf-reader__code")?.textContent?.trim();
    return code || "PDF";
  }

  getProgressPercent() {
    if (!this.pageCount) {
      return 0;
    }

    const pageProgress = Math.round((this.currentPage / Math.max(1, this.pageCount)) * 100);
    const maxScrollable = Math.max(0, this.scrollRoot.scrollHeight - this.scrollRoot.clientHeight);
    if (!maxScrollable) {
      return clamp(pageProgress, 0, 100);
    }

    const scrollProgress = Math.round((this.scrollRoot.scrollTop / maxScrollable) * 100);
    return clamp(Math.max(pageProgress, scrollProgress), 0, 100);
  }

  persistReadingProgress({ force = false } = {}) {
    if (!this.pageCount) {
      return;
    }

    const progressPercent = this.getProgressPercent();
    const progressKey = `${this.sourceName}:${this.currentPage}:${progressPercent}`;
    const now = Date.now();

    if (!force && progressKey === this.lastProgressKey) {
      return;
    }

    if (!force && now - this.lastProgressPersistAt < 750) {
      window.clearTimeout(this.progressPersistTimer);
      this.progressPersistTimer = window.setTimeout(() => {
        this.persistReadingProgress({ force: true });
      }, 750);
      return;
    }

    this.lastProgressKey = progressKey;
    this.lastProgressPersistAt = now;

    rememberRecentNote({
      href: window.location.href,
      title: this.getPageTitle(),
      subject: this.getSubjectLabel(),
      meta: this.sourceName || "PDF",
      sectionId: `pdf-page-${this.currentPage}`,
      sectionLabel: `Page ${String(this.currentPage).padStart(2, "0")}`,
      sectionTitle: `Page ${this.currentPage} of ${this.pageCount}`,
      sectionIndex: this.currentPage,
      totalSections: this.pageCount,
      progressPercent,
    });
  }

  getPageElement(pageNumber) {
    return this.pagesRoot.querySelector(`[data-pdf-page="${pageNumber}"]`);
  }

  goToPage(pageNumber) {
    const targetPage = clamp(Math.round(pageNumber || 1), 1, this.pageCount || 1);
    const pageElement = this.getPageElement(targetPage);
    if (!pageElement) {
      return;
    }

    this.currentPage = targetPage;
    this.syncControls();
    this.persistReadingProgress({ force: true });
    pageElement.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  queueCurrentPageSync() {
    if (this.scrollTicking) {
      return;
    }

    this.scrollTicking = true;
    window.requestAnimationFrame(() => {
      this.scrollTicking = false;
      this.updateCurrentPageFromScroll();
    });
  }

  updateCurrentPageFromScroll() {
    const scrollRect = this.scrollRoot.getBoundingClientRect();
    const viewportAnchor = scrollRect.top + scrollRect.height * 0.34;
    let bestPage = this.currentPage;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.pages.forEach(({ pageNumber, wrapper }) => {
      const rect = wrapper.getBoundingClientRect();
      const distance = Math.abs(rect.top - viewportAnchor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPage = pageNumber;
      }
    });

    if (bestPage !== this.currentPage) {
      this.currentPage = bestPage;
      this.syncControls();
      this.persistReadingProgress({ force: true });
    }
  }

  queueProgressPersist() {
    if (this.progressTicking) {
      return;
    }

    this.progressTicking = true;
    window.requestAnimationFrame(() => {
      this.progressTicking = false;
      this.persistReadingProgress();
    });
  }

  setZoom(nextZoom, { fitMode = this.fitMode, rerender = true } = {}) {
    const clampedZoom = clamp(nextZoom, this.minZoom, this.maxZoom);
    if (Math.abs(clampedZoom - this.zoom) < 0.001 && fitMode === this.fitMode) {
      return Promise.resolve();
    }

    this.zoom = clampedZoom;
    this.fitMode = fitMode;
    this.syncControls();
    return rerender ? this.rerenderPages() : Promise.resolve();
  }

  fitWidth({ rerender = true } = {}) {
    const firstPage = this.pages[0];
    if (!firstPage) {
      return Promise.resolve();
    }

    const viewport = firstPage.page.getViewport({ scale: 1 });
    const availableWidth = Math.max(300, this.getScrollAvailableWidth());
    const fitZoom = clamp(availableWidth / viewport.width, this.minZoom, this.maxZoom);
    return this.setZoom(fitZoom, { fitMode: true, rerender });
  }

  centerCurrentPage() {
    window.requestAnimationFrame(() => {
      const hasHorizontalOverflow = this.syncHorizontalOverflowState();
      this.scrollRoot.scrollTo({
        left: hasHorizontalOverflow
          ? Math.max(0, (this.scrollRoot.scrollWidth - this.scrollRoot.clientWidth) / 2)
          : 0,
        top: this.scrollRoot.scrollTop,
        behavior: "instant",
      });
    });
  }

  handleResize() {
    this.updateActionsPlacement();
    if (this.fitMode) {
      this.fitWidth();
      return;
    }
    this.centerCurrentPage();
  }

  handleWheel(event) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    this.setZoom(this.zoom + (event.deltaY < 0 ? 0.1 : -0.1), { fitMode: false });
  }

  handleKeydown(event) {
    const activeElement = document.activeElement;
    const isTyping = activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);

    if ((event.ctrlKey || event.metaKey) && (event.key === "+" || event.key === "=")) {
      event.preventDefault();
      this.setZoom(this.zoom + 0.1, { fitMode: false });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "-") {
      event.preventDefault();
      this.setZoom(this.zoom - 0.1, { fitMode: false });
      return;
    }

    if (isTyping) {
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      this.goToPage(this.currentPage - 1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      this.goToPage(this.currentPage + 1);
    }
  }

  openSelectedFile() {
    const [file] = this.fileInput.files || [];
    if (!file) {
      return;
    }

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = URL.createObjectURL(file);
    this.loadPdf(this.objectUrl, file.name || "document.pdf");
    this.fileInput.value = "";
  }

  printCurrentPdf() {
    const frame = document.createElement("iframe");
    frame.className = "pdf-reader__print-frame";
    frame.src = this.sourceUrl;
    frame.onload = () => {
      setTimeout(() => {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch {
          window.open(this.sourceUrl, "_blank", "noopener");
        }
      }, 100);
    };
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 60000);
  }
}

export function initPDFReader() {
  const root = document.querySelector("[data-pdf-reader]");
  if (!root) {
    return;
  }

  const reader = new SimplePDFReader(root);
  reader.init();
}
