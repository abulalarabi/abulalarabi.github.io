fetch('assets/publication.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('publication-container');
    data.forEach((pub, index) => {
      const card = document.createElement('div');
      card.className = 'publication-card';
      card.innerHTML = `
        <img src="${pub.image}" alt="${pub.title}">
        <div class="card-body">
          <h4>${pub.title}</h4>
          <div class="card-buttons">
            <a href="${pub.pdf}" target="_blank">PDF</a>
            <a href="${pub.video}" target="_blank">Video</a>
          </div>
          <p class="card-summary">${pub.summary}</p>
        </div>
      `;
      card.addEventListener('click', () => showModal(pub));
      container.appendChild(card);
    });
  });

  function showModal(pub) {
    document.getElementById('modal-img').src = pub.image;
    document.getElementById('modal-title').textContent = pub.title;
    document.getElementById('modal-pdf').href = pub.pdf;
    document.getElementById('modal-video').href = pub.video;
    document.getElementById('modal-summary').textContent = pub.summary;
  
    const embedContainer = document.getElementById('modal-embed');
    embedContainer.innerHTML = ''; // Clear any previous video
  
    // Detect YouTube video ID from full or shortened link
    let videoId = null;
  
    if (pub.video.includes('youtube.com/watch?v=')) {
      videoId = pub.video.split('v=')[1].split('&')[0];
    } else if (pub.video.includes('youtu.be/')) {
      videoId = pub.video.split('youtu.be/')[1].split('?')[0];
    }
  
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      embedContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
      embedContainer.style.display = 'block';
    } else {
      embedContainer.style.display = 'none';
    }
  
    document.getElementById('publication-modal').style.display = 'flex';
  }
  
  

document.querySelector('.modal-close').addEventListener('click', () => {
  document.getElementById('publication-modal').style.display = 'none';
});



/* ====== Config ====== */
const CITATIONS_URL = "assets/citations.txt"; // Adjust path if needed
const PUBLICATION_ROOT_ID = "publication-section";        // Container to render into

/* ====== Utils ====== */
const clean = (s = "") =>
  s
    .replace(/[\{\}]/g, "")       // remove BibTeX braces
    .replace(/\\&/g, "&")         // unescape
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\s+/g, " ")
    .trim();

const getField = (block, name) => {
  // capture {...} OR "..." non-greedily
  const re = new RegExp(`${name}\\s*=\\s*(\\{([\\s\\S]*?)\\}|\"([\\s\\S]*?)\")`, "i");
  const m = block.match(re);
  if (!m) return "";
  return clean(m[2] || m[3] || "");
};

const splitEntries = (txt) => {
  // Split on a closing brace followed by a blank line
  const chunks = txt.split(/\n}\s*\n/g).map(c => c.trim()).filter(Boolean);
  return chunks.map(c => c.endsWith("}") ? c : c + "\n}");
};

const parseAuthors = (s) => {
  if (!s) return [];
  return s.split(/\s+and\s+/i).map(a => {
    a = a.trim();
    if (!a) return "";
    // If "Last, First" keep; otherwise convert "First M Last" -> "Last, First M"
    if (a.includes(",")) return a.replace(/\s+/g, " ").trim();
    const parts = a.split(/\s+/);
    if (parts.length === 1) return parts[0];
    const last = parts.pop();
    return `${last}, ${parts.join(" ")}`;
  });
};

const formatAuthors = (arr) => {
  if (!arr.length) return "";
  if (arr.length <= 3) return arr.join(", ");
  // For 4+ authors, list all (you can change to "et al." if preferred)
  return arr.join(", ");
};

const pickVenueAndPublisher = (entry) => {
  // Journal articles: journal + publisher
  // Conferences: booktitle + organization
  const journal = getField(entry, "journal");
  const booktitle = getField(entry, "booktitle");
  const publisher = getField(entry, "publisher");
  const org = getField(entry, "organization");

  return {
    venue: journal || booktitle || "",
    publisher: publisher || org || ""
  };
};

const styleCitation = (e) => {
  // Your requested style:
  // [Author(s)]. "[Title]." [Journal/Booktitle], <i>[Publisher]</i>, Vol [Volume], pp. [Pages], ([Year]).
  const authors = formatAuthors(parseAuthors(getField(e, "author")));
  const title = getField(e, "title");
  const { venue, publisher } = pickVenueAndPublisher(e);
  const volume = getField(e, "volume");
  const number = getField(e, "number");
  const pages = getField(e, "pages");
  const year = getField(e, "year");

  const bits = [];
  if (authors) bits.push(`${authors}.`);
  if (title) bits.push(`“${title}.”`);
  if (venue) bits.push(`${venue},`);
  if (publisher) bits.push(`<i>${publisher}</i>,`);
  if (volume) bits.push(`Vol ${volume}${number ? `(${number})` : ""},`);
  if (pages) bits.push(`pp. ${pages},`);
  bits.push(`(${year || "Forthcoming"}).`);

  // Clean trailing commas before the period
  let out = bits.join(" ").replace(/\s+,/g, ",").replace(/,\s+\(\w|\)\./g, match => match.trim());
  out = out.replace(/\s+,/g, ",");
  return out;
};

const byYear = (entries) => {
  const map = new Map();
  for (const e of entries) {
    const y = getField(e, "year") || "Forthcoming";
    if (!map.has(y)) map.set(y, []);
    map.get(y).push(e);
  }
  // Sort years desc, with "Forthcoming" first
  const years = Array.from(map.keys()).sort((a, b) => {
    const ai = a === "Forthcoming" ? Infinity : parseInt(a, 10) || -1;
    const bi = b === "Forthcoming" ? Infinity : parseInt(b, 10) || -1;
    return bi - ai;
  });
  return { years, map };
};

const makeYearSummary = (year, count) => {
  const yearSpan = `<span class="year">${year}</span>`;
  const countSpan = `<span class="count">${count}</span>`;
  return `<summary>${yearSpan}${countSpan}</summary>`;
};

const render = (root, years, map) => {
  // Year nav
  const nav = document.createElement("nav");
  nav.className = "pubs-year-nav";
  nav.setAttribute("aria-label", "Jump to year");
  nav.innerHTML = years.map(y => `<a href="#y-${y}">${y}</a>`).join("");

  // Year-wise sections
  const fr = document.createDocumentFragment();
  fr.appendChild(nav);

  for (const y of years) {
    const items = map.get(y) || [];
    const det = document.createElement("details");
    det.className = "pubs-year";
    det.id = `y-${y}`;
    det.open = true;

    det.innerHTML = [
      makeYearSummary(y, items.length),
      `<ol class="pubs-list">`,
      items.map(e => {
        const html = styleCitation(e);
        return `<li class="pub">
                  <span class="citation">${html}</span>
                </li>`;
      }).join(""),
      `</ol>`
    ].join("\n");

    fr.appendChild(det);
  }

  root.innerHTML = ""; // clear
  root.appendChild(fr);
};

async function buildPublications() {
  const root = document.getElementById(PUBLICATION_ROOT_ID);
  if (!root) {
    console.warn(`[publications] Missing container #${PUBLICATION_ROOT_IDROOT_ID}`);
    return;
  }

  try {
    const res = await fetch(CITATIONS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${CITATIONS_URL}`);
    const txt = await res.text();

    const entries = splitEntries(txt).filter(e => /@\w+\s*\{/.test(e));
    const { years, map } = byYear(entries);
    // Render using the same classes as the CSS I shared earlier
    root.classList.add("pubs");
    render(root, years, map);
  } catch (err) {
    console.error(err);
    document.getElementById(PUBLICATION_ROOT_ID).innerHTML =
      `<p style="color:#b91c1c">Could not load publications. Check the path to <code>${CITATIONS_URL}</code>.</p>`;
  }
}

/* Auto-run on load */
document.addEventListener("DOMContentLoaded", buildPublications);
