# Tutor Notes

A static, offline-friendly tutoring notes site. The site uses plain HTML, CSS, and JavaScript, plus a tiny Node build step that assembles shared HTML templates into the final pages.

The app is intentionally lightweight. Lesson pages fetch markdown at runtime, render it into study-friendly sections, and share a common visual system across the notes index and individual lessons.

## Project Structure

```text
.
+-- index.html
+-- catalog.json
+-- package.json
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
+-- scripts/
|   +-- build-pages.js    Generates HTML pages from shared templates
|   +-- main.js           Module entrypoint for app features
|   +-- modules/
|   |   +-- catalog.js
|   |   +-- markdown.js
|   |   +-- shared.js
|   |   +-- ui.js
|   +-- page-transitions.js
|   +-- interaction/
|       +-- audio.js
|       +-- trails.js
+-- styles/
    +-- main.css
    +-- feedback.css
+-- templates/
   +-- layout.html
   +-- pages.json
   +-- partials/
   |   +-- loader.html
   +-- pages/
      +-- index.html
      +-- content/
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

The lesson HTML files are generated from shared templates. Each page declares:

```html
data-markdown-source="./lesson-notes.md"
data-markdown-image-base="./lesson-images/"
```

`scripts/main.js` fetches the markdown file, parses supported markdown blocks, renders the study page, builds the section outline, and updates the page stats.

The home page does not hard-code the subject tree anymore. It reads the root `catalog.json`, then renders the expandable subject list from that data.

## Adding A Lesson

1. Create a markdown file in the right subject folder, for example:
   `content/data-communication/new-topic-notes.md`
2. Create a lesson body partial under `templates/pages/` that mirrors the content markup you want.
3. Add a page entry to `templates/pages.json` with the metadata and body path.
4. If the lesson has images, place them in a kebab-case image folder and set `data-markdown-image-base` in the body partial.
5. Add the new lesson to `catalog.json` so it appears anywhere the shared catalog is rendered.
6. Run the build to regenerate HTML pages.

## Build

```powershell
npm run build
```

## Local Preview

Because lessons fetch markdown and JSON files, open the project through a local server rather than directly from the filesystem.

```powershell
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/
```

## Vercel Deployment

Set the Vercel project settings to:

- Build Command: `npm run build`
- Output Directory: `.`

## Architecture Notes / TODO

This project uses a tiny static build step to keep the HTML templates centralized:

- Lesson HTML files share the same shell by convention rather than through a template system.
- `scripts/main.js` contains several independent features in one file.
- A small amount of cross-script state still lives on `window`, especially for cursor and audio interaction controls.

Recommended next refactor, after the public cleanup:

1. Replace remaining `window.__tutor...` state with explicit module APIs once scripts are loaded through a module entrypoint.
2. Keep `catalog.json` as the source of truth for the home page and generated navigation.

## Refactor History

- Moved lesson content into `content/` and renamed subject folders with URL-safe kebab-case names.
- Moved styles into `styles/` and scripts into `scripts/`.
- Grouped shared assets into `assets/decorative/`, `assets/icons/`, and `assets/loading/`.
- Renamed lesson pages, markdown files, and image folders to a consistent kebab-case convention.
- Extracted the notes tree into root-level `catalog.json`.
- Updated PWA paths in `manifest.webmanifest`, `sw.js`, and `scripts/main.js`.
- Removed the light-mode toggle path; the public UI is now dark-only.
