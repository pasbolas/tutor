import {
  clamp,
  escapeHtml,
  escapeAttribute,
  slugify,
  rememberRecentNote,
} from "./shared.js";

function renderInline(text) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let html = "";
  let lastIndex = 0;
  let match = pattern.exec(text);

  while (match) {
    html += escapeHtml(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith("`")) {
      html += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
    } else if (token.startsWith("**")) {
      html += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
    } else {
      html += `<em>${escapeHtml(token.slice(1, -1))}</em>`;
    }

    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }

  html += escapeHtml(text.slice(lastIndex));
  return html;
}

function renderLabeledParagraph(text) {
  const labelMatch = text.match(/^(Question|Answer|Explanation):\s*([\s\S]*)$/i);
  if (!labelMatch) {
    return "";
  }

  const label = labelMatch[1];
  const body = labelMatch[2].trim();
  const kind = label.toLowerCase();
  const bodyHtml = body
    ? `<span class="study-qa__body">${renderInline(body)}</span>`
    : "";

  return `
    <p class="study-qa study-qa--${kind}${body ? "" : " study-qa--label-only"}">
      <span class="study-qa__label">${escapeHtml(label)}</span>
      ${bodyHtml}
    </p>
  `;
}

function prettifyImageName(filename) {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*-{3,}\s*$/.test(line)) {
      index += 1;
      continue;
    }

    const codeMatch = line.match(/^```([\w-]+)?\s*$/);
    if (codeMatch) {
      const language = codeMatch[1] || "";
      const codeLines = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const imageMatch = line.match(/^\s*\[\[IMAGE:\s*([^\]]+?)\s*\]\]\s*$/i);
    if (imageMatch) {
      const filename = imageMatch[1].trim();
      blocks.push({
        type: "image",
        filename,
        alt: prettifyImageName(filename),
      });
      index += 1;
      continue;
    }

    const isTableLine = (value) => /^\s*\|.+\|\s*$/.test(value);
    const isTableSeparator = (value) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(value);
    if (
      isTableLine(line)
      && index + 1 < lines.length
      && isTableSeparator(lines[index + 1])
    ) {
      const splitRow = (value) => value
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());
      const headers = splitRow(line);
      const rows = [];
      index += 2;

      while (index < lines.length && isTableLine(lines[index])) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }

      blocks.push({
        type: "table",
        headers,
        rows,
      });
      continue;
    }

    const unorderedMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (unorderedMatch) {
      const items = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*[-*]\s+(.*)$/);
        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1].trim());
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered: false,
        items,
      });
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (orderedMatch) {
      const items = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*\d+\.\s+(.*)$/);
        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1].trim());
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered: true,
        items,
      });
      continue;
    }

    const paragraphLines = [];

    while (index < lines.length) {
      const currentLine = lines[index];
      if (
        !currentLine.trim()
        || /^```/.test(currentLine)
        || /^(#{1,6})\s+/.test(currentLine)
        || /^\s*\[\[IMAGE:\s*([^\]]+?)\s*\]\]\s*$/i.test(currentLine)
        || /^\s*\|.+\|\s*$/.test(currentLine)
        || /^\s*[-*]\s+/.test(currentLine)
        || /^\s*\d+\.\s+/.test(currentLine)
      ) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      lines: paragraphLines,
      preserveBreaks: paragraphLines.some((paragraphLine) => /\s{2,}$/.test(paragraphLine)),
      text: paragraphLines.map((paragraphLine) => paragraphLine.trim()).join(" "),
    });
  }

  return blocks;
}

function renderBlock(block, options = {}) {
  if (block.type === "paragraph") {
    const labeledParagraph = renderLabeledParagraph(block.text || "");
    if (labeledParagraph) {
      return labeledParagraph;
    }

    if (block.preserveBreaks && Array.isArray(block.lines)) {
      return `<p>${block.lines.map((line) => renderInline(line.trim())).join("<br />")}</p>`;
    }

    return `<p>${renderInline(block.text)}</p>`;
  }

  if (block.type === "list") {
    const tag = block.ordered ? "ol" : "ul";
    const items = block.items
      .map((item) => `<li>${renderInline(item)}</li>`)
      .join("");
    return `<${tag}>${items}</${tag}>`;
  }

  if (block.type === "code") {
    const language = block.language || "text";
    return [
      '<figure class="study-code">',
      `  <figcaption class="study-markdown__caption"><span>Code Sample</span><span>${escapeHtml(language)}</span></figcaption>`,
      `  <pre data-language="${escapeHtml(language)}"><code>${escapeHtml(block.code)}</code></pre>`,
      "</figure>",
    ].join("");
  }

  if (block.type === "heading") {
    const level = Math.min(Math.max(block.level, 3), 4);
    return `<h${level}>${renderInline(block.text)}</h${level}>`;
  }

  if (block.type === "image") {
    const imageBase = options.imageBase || "";
    const src = `${imageBase}${block.filename}`;
    return [
      '<figure class="study-image">',
      `  <img src="${escapeAttribute(src)}" alt="${escapeAttribute(block.alt)}" loading="lazy" />`,
      `  <figcaption class="study-markdown__caption"><span>Figure</span><span>${escapeHtml(block.alt)}</span></figcaption>`,
      "</figure>",
    ].join("");
  }

  if (block.type === "table") {
    const headers = block.headers
      .map((cell) => `<th scope="col">${renderInline(cell)}</th>`)
      .join("");
    const rows = block.rows
      .map((row) => `
        <tr>
          ${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}
        </tr>
      `)
      .join("");

    return [
      '<div class="study-table-wrap">',
      '  <table class="study-table">',
      `    <thead><tr>${headers}</tr></thead>`,
      `    <tbody>${rows}</tbody>`,
      "  </table>",
      "</div>",
    ].join("");
  }

  return "";
}

function isMcqHeading(block) {
  return block.type === "heading" && /^MCQ\s+\d+/i.test(block.text);
}

function renderMcqOptions(block) {
  const text = (Array.isArray(block.lines) ? block.lines.join("\n") : block.text)
    .split(/\n\s*\*\*(?:Answer|Explanation):/i)[0]
    .trim();
  const optionMatches = [...text.matchAll(/(?:^|\n)\s*([A-D])\.\s+([\s\S]*?)(?=\n\s*[A-D]\.\s+|$)/g)];

  if (optionMatches.length < 2) {
    return renderBlock(block);
  }

  const items = optionMatches
    .map((match) => `
      <li class="study-mcq__option">
        <span class="study-mcq__option-letter">${escapeHtml(match[1])}</span>
        <span>${renderInline(match[2].replace(/\s+/g, " ").trim())}</span>
      </li>
    `)
    .join("");

  return `<ol class="study-mcq__options" aria-label="Answer options">${items}</ol>`;
}

function getMcqAnswer(block) {
  const text = Array.isArray(block.lines) ? block.lines.join("\n") : block.text;
  const answerMatch = text.match(/(?:^|\n)\s*\*\*Answer:\*\*\s*([^\n]*)/i)
    || text.match(/(?:^|\n)\s*\*\*Answer:\s*(.*?)\*\*/i);

  return answerMatch ? answerMatch[1].trim() : "";
}

function getMcqExplanation(block) {
  const text = Array.isArray(block.lines) ? block.lines.join("\n") : block.text;
  const explanationMatch = text.match(/(?:^|\n)\s*\*\*Explanation:\*\*\s*([\s\S]*)$/i);

  return explanationMatch ? explanationMatch[1].trim() : "";
}

function renderMcqFeedback(answer, explanation) {
  if (!answer && !explanation) {
    return "";
  }

  return `
    <div class="study-mcq__feedback">
      ${answer ? `
        <p class="study-mcq__feedback-row study-mcq__feedback-row--answer">
          <span>Answer</span>
          <strong>${renderInline(answer)}</strong>
        </p>
      ` : ""}
      ${explanation ? `
        <p class="study-mcq__feedback-row">
          <span>Explanation</span>
          <em>${renderInline(explanation)}</em>
        </p>
      ` : ""}
    </div>
  `;
}

function renderMcqCard(card, options = {}) {
  const question = card.blocks.find((block) => block.type === "paragraph");
  const optionsBlock = card.blocks.find((block) => (
    block.type === "paragraph"
    && /^A\.\s+/i.test(Array.isArray(block.lines) ? block.lines[0]?.trim() || "" : block.text)
  ));

  const answerBlock = card.blocks.find((block) => block.type === "paragraph" && getMcqAnswer(block));
  const explanationBlock = card.blocks.find((block) => block.type === "paragraph" && getMcqExplanation(block));
  const renderedBlocks = new Set([question, optionsBlock, answerBlock, explanationBlock].filter(Boolean));
  const detailBlocks = card.blocks.filter((block) => !renderedBlocks.has(block));

  return [
    '<article class="study-mcq">',
    `  <h3>${renderInline(card.title)}</h3>`,
    question ? `  <p class="study-mcq__question">${renderInline(question.text)}</p>` : "",
    optionsBlock ? renderMcqOptions(optionsBlock) : "",
    renderMcqFeedback(
      answerBlock ? getMcqAnswer(answerBlock) : "",
      explanationBlock ? getMcqExplanation(explanationBlock) : ""
    ),
    detailBlocks.map((block) => renderBlock(block, options)).join(""),
    "</article>",
  ].join("");
}

function buildMcqGuide(blocks, options = {}) {
  const usedSlugs = new Set();
  const outline = [];
  const htmlParts = [];
  let sectionCount = 0;
  let codeCount = 0;
  let currentSectionOpen = false;
  let currentMcq = null;
  let hasSeenTitle = false;

  const openSection = (headingText) => {
    const id = slugify(headingText, usedSlugs);
    const label = String(sectionCount + 1).padStart(2, "0");
    outline.push({
      id,
      label,
      text: headingText,
    });

    htmlParts.push(
      `<section class="study-markdown__section study-markdown__section--mcq" id="${id}" data-study-section data-study-section-label="${escapeAttribute(label)}" data-study-section-title="${escapeAttribute(headingText)}" data-study-section-index="${sectionCount + 1}">`,
      '  <header class="study-markdown__section-header">',
      `    <span class="study-markdown__section-index">${label}</span>`,
      "    <div>",
      `      <p class="study-kicker">Question Set ${label}</p>`,
      `      <h2>${renderInline(headingText)}</h2>`,
      "    </div>",
      "  </header>",
      '  <div class="study-markdown__section-body study-markdown__section-body--mcq">'
    );

    currentSectionOpen = true;
    sectionCount += 1;
  };

  const closeMcq = () => {
    if (!currentMcq) {
      return;
    }

    htmlParts.push(renderMcqCard(currentMcq, options));
    currentMcq = null;
  };

  const closeSection = () => {
    closeMcq();
    if (!currentSectionOpen) {
      return;
    }

    htmlParts.push("  </div>", "</section>");
    currentSectionOpen = false;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 1) {
      if (!hasSeenTitle) {
        hasSeenTitle = true;
        return;
      }

      closeSection();
      openSection(block.text);
      return;
    }

    if (isMcqHeading(block)) {
      if (!currentSectionOpen) {
        openSection("Practice Questions");
      }

      closeMcq();
      codeCount += 1;
      currentMcq = {
        title: block.text,
        blocks: [],
      };
      return;
    }

    if (!currentSectionOpen) {
      openSection("Practice Questions");
    }

    if (block.type === "code" || block.type === "image") {
      codeCount += 1;
    }

    if (currentMcq) {
      currentMcq.blocks.push(block);
      return;
    }

    htmlParts.push(renderBlock(block, options));
  });

  closeSection();

  return {
    html: htmlParts.join(""),
    outline,
    sectionCount,
    codeCount,
  };
}

function buildGuide(blocks, options = {}) {
  const usedSlugs = new Set();
  const outline = [];
  const htmlParts = [];
  let sectionCount = 0;
  let codeCount = 0;
  let currentSectionOpen = false;
  let hasSeenTitle = false;

  const openSection = (headingText) => {
    const id = slugify(headingText, usedSlugs);
    const label = String(sectionCount + 1).padStart(2, "0");
    outline.push({
      id,
      label,
      text: headingText,
    });

    htmlParts.push(
      `<section class="study-markdown__section" id="${id}" data-study-section data-study-section-label="${escapeAttribute(label)}" data-study-section-title="${escapeAttribute(headingText)}" data-study-section-index="${sectionCount + 1}">`,
      '  <header class="study-markdown__section-header">',
      `    <span class="study-markdown__section-index">${label}</span>`,
      "    <div>",
      `      <p class="study-kicker">Section ${label}</p>`,
      `      <h2>${renderInline(headingText)}</h2>`,
      "    </div>",
      "  </header>",
      '  <div class="study-markdown__section-body">'
    );

    currentSectionOpen = true;
    sectionCount += 1;
  };

  const closeSection = () => {
    if (!currentSectionOpen) {
      return;
    }

    htmlParts.push("  </div>", "</section>");
    currentSectionOpen = false;
  };

  blocks.forEach((block) => {
    if (block.type === "heading" && block.level === 1) {
      if (!hasSeenTitle) {
        hasSeenTitle = true;
        return;
      }

      closeSection();
      openSection(block.text);
      return;
    }

    if (block.type === "heading" && block.level === 2) {
      closeSection();
      openSection(block.text);
      return;
    }

    if (!currentSectionOpen) {
      openSection("Guide Overview");
    }

    if (block.type === "code" || block.type === "image") {
      codeCount += 1;
    }

    htmlParts.push(renderBlock(block, options));
  });

  closeSection();

  return {
    html: htmlParts.join(""),
    outline,
    sectionCount,
    codeCount,
  };
}

function countWords(blocks) {
  const text = blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return block.text;
      }

      if (block.type === "heading") {
        return block.text;
      }

      if (block.type === "list") {
        return block.items.join(" ");
      }

      if (block.type === "table") {
        return block.headers.concat(block.rows.flat()).join(" ");
      }

      return "";
    })
    .join(" ")
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).length;
}

function setText(selector, value) {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach((node) => {
    node.textContent = value;
  });
}

function renderOutline(outline) {
  const outlineRoot = document.querySelector("[data-study-outline]");
  if (!outlineRoot) {
    return;
  }

  outlineRoot.innerHTML = outline
    .map(
      (item) => `
        <a class="study-outline__link" href="#${item.id}" data-outline-link="${item.id}">
          <span>${item.label}</span>
          <span>${renderInline(item.text)}</span>
        </a>
      `
    )
    .join("");
}

function scrollToInitialHashTarget() {
  if (!window.location.hash) {
    return;
  }

  let targetId = "";
  try {
    targetId = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    targetId = window.location.hash.slice(1);
  }

  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) {
    return;
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: "auto",
    });
  });
}

export function initOutlineToggle() {
  const panel = document.querySelector("[data-study-outline-panel]");
  const toggle = document.querySelector("[data-study-outline-toggle]");
  const outlineRoot = document.querySelector("[data-study-outline]");
  const toggleLabel = toggle ? toggle.querySelector("span") : null;

  if (!panel || !toggle || !outlineRoot || !toggleLabel) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 1080px)");
  let scrollAnimationFrame = 0;
  let isProgrammaticScroll = false;

  const easeInOutCubic = (progress) => (
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - ((-2 * progress + 2) ** 3) / 2
  );

  const cancelSmoothScroll = () => {
    if (!scrollAnimationFrame) {
      return;
    }

    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = 0;
    isProgrammaticScroll = false;
  };

  const animateScrollTo = (targetTop) => {
    cancelSmoothScroll();

    const startTop = window.scrollY;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const endTop = Math.min(Math.max(0, targetTop), maxTop);
    const distance = endTop - startTop;
    const duration = Math.min(1150, Math.max(620, 520 + Math.abs(distance) * 0.18));
    const startTime = performance.now();

    if (Math.abs(distance) < 1) {
      window.scrollTo(0, endTop);
      return;
    }

    isProgrammaticScroll = true;

    const step = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startTop + distance * eased);

      if (progress < 1) {
        scrollAnimationFrame = window.requestAnimationFrame(step);
        return;
      }

      scrollAnimationFrame = 0;
      isProgrammaticScroll = false;
    };

    scrollAnimationFrame = window.requestAnimationFrame(step);
  };

  const closePanel = () => {
    panel.classList.remove("is-open");
    syncState();
  };

  const syncState = () => {
    if (mobileQuery.matches) {
      const isOpen = panel.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggleLabel.textContent = isOpen ? "Close map" : "Guide map";
      return;
    }

    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Guide map";
  };

  toggle.addEventListener("click", () => {
    if (!mobileQuery.matches) {
      return;
    }

    panel.classList.toggle("is-open");
    syncState();
  });

  outlineRoot.addEventListener("click", (event) => {
    if (!mobileQuery.matches) {
      return;
    }

    const link = event.target.closest("[data-outline-link]");
    if (!link) {
      return;
    }

    const href = link.getAttribute("href") || "";
    const targetId = href.startsWith("#") ? href.slice(1) : "";
    const target = targetId ? document.getElementById(decodeURIComponent(targetId)) : null;
    if (!target) {
      closePanel();
      return;
    }

    event.preventDefault();
    closePanel();

    window.requestAnimationFrame(() => {
      const header = panel.querySelector(".study-outline__header");
      const headerRect = header ? header.getBoundingClientRect() : panel.getBoundingClientRect();
      const panelStyles = window.getComputedStyle(panel);
      const panelPaddingBottom = parseFloat(panelStyles.paddingBottom) || 0;
      const sectionGap = 14;
      const landingY = headerRect.bottom + panelPaddingBottom + sectionGap;
      const targetY = target.getBoundingClientRect().top + window.scrollY - landingY;

      animateScrollTo(targetY);

      window.history.replaceState(null, "", `#${target.id}`);
    });
  });

  document.addEventListener("click", (event) => {
    if (!mobileQuery.matches || !panel.classList.contains("is-open")) {
      return;
    }

    if (panel.contains(event.target)) {
      return;
    }

    closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !mobileQuery.matches) {
      return;
    }

    closePanel();
  });

  window.addEventListener("wheel", () => {
    if (!isProgrammaticScroll) {
      return;
    }

    cancelSmoothScroll();
  }, { passive: true });

  window.addEventListener("touchstart", () => {
    if (!isProgrammaticScroll) {
      return;
    }

    cancelSmoothScroll();
  }, { passive: true });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncState);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(syncState);
  }

  window.addEventListener("pagehide", () => {
    cancelSmoothScroll();
  }, { once: true });

  syncState();
}

function initOutlineTracking() {
  const sectionNodes = document.querySelectorAll("[data-study-section]");
  const outlineLinks = document.querySelectorAll("[data-outline-link]");
  const outlinePanel = document.querySelector("[data-study-outline-panel]");

  if (!sectionNodes.length || !outlineLinks.length) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 1080px)");
  const linkMap = new Map(
    Array.from(outlineLinks).map((link) => [link.dataset.outlineLink, link])
  );
  let currentActiveId = "";
  let observer = null;

  const emitActiveSectionChange = (node) => {
    if (!node) {
      return;
    }

    const totalSections = sectionNodes.length;
    const sectionIndex = Number(node.dataset.studySectionIndex) || 1;
    const progressPercent = Math.round((sectionIndex / Math.max(1, totalSections)) * 100);

    window.dispatchEvent(new CustomEvent("tutor:active-section-change", {
      detail: {
        id: node.id,
        label: node.dataset.studySectionLabel || String(sectionIndex).padStart(2, "0"),
        title: node.dataset.studySectionTitle || "",
        index: sectionIndex,
        total: totalSections,
        progressPercent: clamp(progressPercent, 0, 100),
      },
    }));
  };

  const setActive = (id) => {
    if (id === currentActiveId) {
      return;
    }

    currentActiveId = id;
    const activeLink = linkMap.get(id);
    const activeNode = Array.from(sectionNodes).find((node) => node.id === id) || null;
    outlineLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.outlineLink === id);
    });

    emitActiveSectionChange(activeNode);

    const shouldScrollOutline =
      activeLink
      && (
        !mobileQuery.matches
        || !outlinePanel
        || outlinePanel.classList.contains("is-open")
      );

    if (shouldScrollOutline) {
      activeLink.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  };

  const updateActiveSectionFromScroll = () => {
    const viewportAnchor = Math.max(window.innerHeight * 0.26, 180);
    let activeId = sectionNodes[0].id;

    sectionNodes.forEach((node) => {
      const { top } = node.getBoundingClientRect();
      if (top <= viewportAnchor) {
        activeId = node.id;
      }
    });

    setActive(activeId);
  };

  if (typeof IntersectionObserver === "function") {
    observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (!visibleEntries.length) {
          return;
        }

        const leadingEntry = visibleEntries[0];
        setActive(leadingEntry.target.id);
      },
      {
        root: null,
        rootMargin: "-22% 0px -58% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionNodes.forEach((node) => observer.observe(node));
  }

  const requestUpdate = () => {
    window.requestAnimationFrame(updateActiveSectionFromScroll);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("pagehide", () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    if (observer) {
      observer.disconnect();
    }
  }, { once: true });

  setActive(sectionNodes[0].id);
  updateActiveSectionFromScroll();
}

export async function initMarkdownPage() {
  const page = document.querySelector("[data-markdown-page]");
  const contentRoot = document.querySelector("[data-study-content]");
  const statusRoot = document.querySelector("[data-study-status]");
  if (!page || !contentRoot || !statusRoot) {
    return;
  }

  const source = page.dataset.markdownSource;
  if (!source) {
    return;
  }

  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to load ${source} (${response.status})`);
    }

    const markdown = await response.text();
    const blocks = parseMarkdown(markdown);
    const titleBlock = blocks.find((block) => block.type === "heading" && block.level === 1);
    const introBlock = blocks.find((block, index) => {
      if (block.type !== "paragraph") {
        return false;
      }

      const headingBefore = blocks
        .slice(0, index)
        .some((candidate) => candidate.type === "heading" && candidate.level === 1);

      return !headingBefore;
    });

    const guideBlocks = blocks.filter((block) => block !== introBlock);
    const guideOptions = {
      imageBase: page.dataset.markdownImageBase || "",
    };
    const guide = page.dataset.markdownMode === "mcq"
      ? buildMcqGuide(guideBlocks, guideOptions)
      : buildGuide(guideBlocks, guideOptions);
    const wordCount = countWords(blocks);
    const readTime = Math.max(1, Math.round(wordCount / 220));
    const heroKicker = document.querySelector(".study-hero .study-kicker");
    const subjectLabel = heroKicker ? heroKicker.textContent.split("/")[0].trim() : "";
    const pageTitle = titleBlock ? titleBlock.text : document.title.replace(/\s*\|\s*Tutor Notes\s*$/i, "").trim();
    let latestSectionProgress = null;

    contentRoot.innerHTML = guide.html;
    renderOutline(guide.outline);
    initOutlineTracking();
    window.dispatchEvent(new CustomEvent("tutor:page-content-ready"));

    const persistReadingProgress = () => {
      rememberRecentNote({
        href: window.location.href,
        title: pageTitle || "Untitled note",
        subject: subjectLabel || "Notes",
        meta: `${readTime} min read`,
        sectionId: latestSectionProgress?.id || "",
        sectionLabel: latestSectionProgress?.label || "",
        sectionTitle: latestSectionProgress?.title || "",
        sectionIndex: latestSectionProgress?.index || 0,
        totalSections: latestSectionProgress?.total || guide.sectionCount,
        progressPercent: latestSectionProgress?.progressPercent || 0,
      });
    };

    const getSectionProgressFromNode = (node) => {
      if (!node) {
        return null;
      }

      const sectionIndex = Number(node.dataset.studySectionIndex) || 1;
      const totalSections = guide.sectionCount || 1;
      return {
        id: node.id,
        label: node.dataset.studySectionLabel || String(sectionIndex).padStart(2, "0"),
        title: node.dataset.studySectionTitle || "",
        index: sectionIndex,
        total: totalSections,
        progressPercent: clamp(Math.round((sectionIndex / Math.max(1, totalSections)) * 100), 0, 100),
      };
    };

    const handleActiveSectionChange = (event) => {
      latestSectionProgress = event.detail || null;
      persistReadingProgress();
    };

    window.addEventListener("tutor:active-section-change", handleActiveSectionChange);
    window.addEventListener("pagehide", persistReadingProgress, { once: true });
    latestSectionProgress = getSectionProgressFromNode(contentRoot.querySelector("[data-study-section]"));
    persistReadingProgress();

    setText("[data-study-title]", titleBlock ? titleBlock.text : "Functions in C");
    setText(
      "[data-study-intro]",
      introBlock
        ? introBlock.text
        : page.dataset.markdownIntro || "These notes are laid out in a way that is easier to revise from and easier to teach from."
    );

    setText("[data-study-stat='sections']", String(guide.sectionCount));
    setText("[data-study-stat='samples']", String(guide.codeCount));
    setText("[data-study-stat='readTime']", `${readTime} min`);
    setText("[data-study-status-label]", "Ready");
    setText("[data-study-source-name]", source.replace("./", ""));
    statusRoot.textContent = `Pulled in ${guide.sectionCount} sections from ${source.replace("./", "")}.`;
    scrollToInitialHashTarget();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the markdown file.";
    const sourceName = escapeHtml(source.replace("./", ""));
    statusRoot.textContent = "Could not load the notes file.";
    setText("[data-study-status-label]", "Error");
    contentRoot.innerHTML = `
      <div class="study-markdown__error">
        <strong>I could not load the notes file.</strong>
        <p>${escapeHtml(message)}</p>
        <p>If this page is being opened as a file instead of through a local server, the browser will usually block the fetch for <code>${sourceName}</code>.</p>
      </div>
    `;
    window.dispatchEvent(new CustomEvent("tutor:page-content-ready"));
  }
}
