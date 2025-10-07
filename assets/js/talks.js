// Path to the projects JSON
const TALK_JSON = "./assets/talks.json";


async function talk_render() {
  const root = document.getElementById("talk-section");
  if (!root) return;

  const list = proj_el("div", { class: "proj-list" });
  root.appendChild(list);

  let projects = [];
  try {
    const resp = await fetch(TALK_JSON, { cache: "no-store" });
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

document.addEventListener("DOMContentLoaded", talk_render);
