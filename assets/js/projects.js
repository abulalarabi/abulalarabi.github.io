// Path to the projects JSON
const PROJECTS_JSON = "./assets/projects.json";

// Helper: create element with classes & attrs
function proj_el(tag, opts = {}) {
  const el = document.createElement(tag);
  if (opts.class) el.className = opts.class;
  if (opts.text) el.textContent = opts.text;
  if (opts.html) el.innerHTML = opts.html;
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// Helper: sanitize YouTube URL -> embed
function proj_toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

// Build a single project card
async function proj_buildCard(project, idx) {
  const card = proj_el("div", { class: "proj-card" });

  // Title
  const title = proj_el("h3", { class: "proj-title", text: project["project-name"] || "Untitled Project" });
  card.appendChild(title);

  // Videos (optional)
  if (Array.isArray(project.videos) && project.videos.length > 0) {
    const videosWrap = proj_el("div", { class: "proj-videos" });
    project.videos.forEach((v) => {
      const iframe = proj_el("iframe", {
        class: "proj-video-frame",
        attrs: {
          src: proj_toYouTubeEmbed(v),
          title: "Project video",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
          loading: "lazy"
        }
      });
      const vidCard = proj_el("div", { class: "proj-video-card" });
      vidCard.appendChild(iframe);
      videosWrap.appendChild(vidCard);
    });
    card.appendChild(videosWrap);
  }

  // Images (lightGallery)
  if (typeof project.images === "string" && project.images.trim() !== "") {
    const galleryWrap = proj_el("div", { class: "proj-gallery" });
    const strip = proj_el("div", {
      class: "proj-gallery-strip",
      attrs: { id: `proj-gallery-${idx}` }
    });
    galleryWrap.appendChild(strip);

    try {
      const base = project.images.replace(/\/+$/, "");
      const manifestResp = await fetch(`${base}/index.json`, { cache: "no-store" });
      if (!manifestResp.ok) throw new Error("No index.json");
      const files = await manifestResp.json();
      if (!Array.isArray(files) || files.length === 0) throw new Error("Empty manifest");

      files.forEach((file, i) => {
        const src = /^https?:\/\//.test(file) ? file : `${base}/${file}`;
        // Use <a> for lightGallery; data-sub-html shows caption
        const a = proj_el("a", {
          class: "proj-thumb",
          attrs: {
            href: src,
            "data-sub-html": `${project["project-name"] || "Project"} • ${i + 1} / ${files.length}`
            // Optionally: "data-lg-size": "1400-933"
          }
        });
        const img = proj_el("img", {
          attrs: {
            src,
            alt: `${project["project-name"] || "Project"} image ${i + 1}`,
            loading: "lazy"
          }
        });
        a.appendChild(img);
        strip.appendChild(a);
      });

      // Initialize lightGallery for this strip
      // NOTE: Replace licenseKey with your key if you have one.
      lightGallery(strip, {
        selector: ".proj-thumb",
        plugins: [lgThumbnail, lgZoom],
        thumbnail: true,
        zoom: true,
        download: false,
        speed: 300,
        licenseKey: "0000-0000-000-0000",
        mobileSettings: {
          controls: true,
          showCloseIcon: true,
          download: false
        }
      });
    } catch (e) {
      const empty = proj_el("div", {
        class: "proj-gallery-empty",
        text: "No image manifest found (add index.json to enable the gallery)."
      });
      galleryWrap.appendChild(empty);
    }

    card.appendChild(galleryWrap);
  }

  // Description
  if (project.descriptions) {
    const desc = proj_el("p", { class: "proj-desc" });
    desc.textContent = project.descriptions;
    card.appendChild(desc);
  }

  return card;
}

async function proj_render() {
  const root = document.getElementById("projects-section");
  if (!root) return;

  const list = proj_el("div", { class: "proj-list" });
  root.appendChild(list);

  let projects = [];
  try {
    const resp = await fetch(PROJECTS_JSON, { cache: "no-store" });
    projects = await resp.json();
    if (!Array.isArray(projects)) throw new Error("Invalid JSON structure");
  } catch (e) {
    const err = proj_el("div", { class: "proj-error", text: "Failed to load projects.json. Please check the file path and format." });
    root.appendChild(err);
    return;
  }

  let i = 0;
  for (const p of projects) {
    const card = await proj_buildCard(p, i++);
    list.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", proj_render);
