# Abul Al Arabi’s portfolio

A static portfolio served directly by GitHub Pages. No build step, package installation, or framework is required. JavaScript loads the content in the browser. Node.js runs the checks; Python serves the local preview.

## Update content

| Source | Purpose |
| --- | --- |
| `index.html` | Page structure, navigation, metadata, and dialogs. |
| `info/publication.json` | Selected publication cards: titles, thumbnails, PDFs, demo links, and summaries. |
| `info/citations.txt` | BibTeX records displayed in the Publications section. |
| `info/projects.json` | Project titles, descriptions, videos, and gallery folders. |
| `info/about.txt` | Homepage introduction; blank lines separate paragraphs. |
| `info/recents.txt` | News, newest first: `MM/YY | description`. |
| `info/cv.txt` | CV sections and entries. `HIDDEN: true` preserves a section without publishing it in the rendered CV. |
| `info/talks.json` | Talk titles, hosts, descriptions, and image folders. |
| `assets/*-images/*/index.json` | Ordered gallery image filenames. |
| `assets/css/glass.css` | Dark/light glass themes, compact layout, responsive rules, and accessibility fallbacks. |
| `papers/` | Locally hosted publication PDFs. |

Edit these files directly and run `npm test`. Commit and push the changes through your normal GitHub Pages workflow. The checks do not generate files or deploy the website. Preserve official author names, titles, and publication status; add only verified links.

`info/research.json` and `info/bib/` contain supplementary publication metadata. The current website reads its cards from `info/publication.json` and its full publication list from `info/citations.txt`. Keep those two displayed sources current when adding a paper.

## Images

Place publication thumbnails in `assets/publication-images/`. Project and talk galleries use their respective folders under `assets/`; each gallery's `index.json` lists image filenames in display order. The website uses these images directly, so resize and compress large images before adding them.

Project cards enlarge the gallery when no demos are present and enlarge the demos when no gallery is available. Cards with both keep the balanced media layout.

## Preview and verify

Run `npm run preview` and open `http://localhost:8765`.

Check desktop and mobile layouts, direct `#projects`/`#publications`/`#cv` links, publication-year links such as `#y-2026`, browser Back/Forward, page scroll restoration, and keyboard navigation. Check dialog Escape dismissal, focus return, and video cleanup as well. Automated interaction tests use a simulated DOM; visual layout and native browser behavior still need browser verification.

The right panel fits the active tab's content, up to 95% of the viewport height. Longer tabs scroll inside the panel. Its section heading and navigation share a fixed top row while the active tab scrolls inside it. On narrow screens, the navigation scrolls horizontally beside the heading. Navigation buttons open the selected tab at its beginning; browser Back/Forward restores that tab's inner reading position. The publication year selector stays fixed below the heading; selecting a year animates only the Publications pane. Locally hosted Lenis 1.3.27 smooths wheel scrolling inside the active tab, while touch and nested media scrollers stay native. Reduced-motion preferences disable the animation; native smooth scrolling handles year links if Lenis is unavailable.

`npm test` runs local asset/content checks and interaction regressions. To run only the interaction checks, use `npm run test:interactions`. GitHub Actions runs the same test command on pushes and pull requests. External links and production performance need separate verification.

## Appearance and background

The site defaults to dark mode. The sun/moon control attached to the profile photo switches appearance and saves the choice locally when browser storage is available. The interactive particle background follows the visitor's local time, becoming lighter during the day and darker at night. It updates every minute, pauses animation in hidden tabs, respects reduced motion, and limits particle growth.

The particle library and Lenis (with its MIT license) are hosted locally in `vendor/`. LightGallery, its plugins, and the icon fonts load from external CDNs. Standalone OscilloPlot has its own external plotting dependencies.

Project demos show local YouTube thumbnails from `assets/project-video-thumbnails/<video-id>.jpg`, without media-count badges. Thumbnails highlight on hover and keyboard focus; selecting one opens its player in an animated dialog. Closing the dialog stops playback and returns focus to the thumbnail. Add the matching thumbnail when adding a demo URL. If the video ID begins with an underscore, name the thumbnail `video-<video-id>.jpg` so Jekyll publishes it. Tabs fade into place, and both publication and project-video dialogs animate on opening and closing, respecting reduced motion. Publication dialogs wrap summary text around the preview on wider screens and stack it on mobile; “Play video” loads the embedded player. The publication list shows each citation's title, authors, and metadata once, grouped by year.

Unused template-build/PDF tooling, generated thumbnail caches, and the former maintenance documentation are preserved in `.scratchpad/retired-build/`. They are not part of the active website or CI workflow.
