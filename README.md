# Tutor Notes

A static, offline-friendly tutoring notes site. The site uses simple HTML, CSS, and JavaScript: no build step, no package manager, and no framework required.

## Project Structure

```text
.
+-- index.html
+-- manifest.webmanifest
+-- sw.js
+-- assets/
|   +-- decorative/       Shared decorative images used by lesson pages
|   +-- icons/            PWA icons, favicon, and UI icons
|   +-- loading/          Loader artwork
+-- content/
|   +-- data-communication/
|   |   +-- *.html        Lesson shell pages
|   |   +-- *.md          Lesson source notes
|   |   +-- *-images/     Lesson-specific diagrams
|   +-- programming/
|       +-- *.html
|       +-- *.md
+-- data/
|   +-- notes-catalog.json
+-- scripts/
|   +-- main.js           Theme, markdown rendering, outline, notes hub, PWA setup
|   +-- page-transitions.js
|   +-- interaction/
|       +-- audio.js
|       +-- trails.js
+-- styles/
    +-- main.css
    +-- feedback.css
```

## Naming Conventions

Use kebab-case for folders and files that are part of the public site URL:

```text
content/data-communication/ip-addressing.html
content/data-communication/ip-addressing-complete-notes.md
content/data-communication/ip-addressing-images/
```

Image filenames inside lesson image folders can keep their original descriptive names because markdown image references point to those exact filenames.

## How Pages Work

The lesson HTML files are reusable shells. Each page declares:

```html
data-markdown-source="./lesson-notes.md"
data-markdown-image-base="./lesson-images/"
```

`scripts/main.js` fetches the markdown file, parses supported markdown blocks, renders the study page, builds the section outline, and updates the page stats.

The home page does not hard-code the subject tree anymore. It reads `data/notes-catalog.json`, then renders the expandable subject list from that data.

## Adding A Lesson

1. Create a markdown file in the right subject folder, for example:
   `content/data-communication/new-topic-notes.md`
2. Create or copy a lesson HTML shell in the same folder, for example:
   `content/data-communication/new-topic.html`
3. In that HTML file, point `data-markdown-source` to the markdown file.
4. If the lesson has images, place them in a kebab-case image folder and set `data-markdown-image-base`.
5. Add the new lesson to `data/notes-catalog.json` so it appears on the home page.

## Local Preview

Because lessons fetch markdown and JSON files, open the project through a local server rather than directly from the filesystem.

```powershell
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/
```

## Refactor Notes

- Moved lesson content into `content/` and renamed subject folders with URL-safe kebab-case names.
- Moved styles into `styles/` and scripts into `scripts/`.
- Grouped shared assets into `assets/decorative/`, `assets/icons/`, and `assets/loading/`.
- Renamed lesson pages, markdown files, and image folders to a consistent kebab-case convention.
- Extracted the home page notes tree into `data/notes-catalog.json`.
- Updated PWA paths in `manifest.webmanifest`, `sw.js`, and `scripts/main.js`.
