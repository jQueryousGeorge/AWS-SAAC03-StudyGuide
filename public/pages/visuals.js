import { link, setTitle } from "../lib/render.js";

function visualCard(visual) {
  return `
    <article class="card visual-card">
      <div>
        <span class="tag">Interactive diagram</span>
        <h3>${visual.title}</h3>
        <p>${visual.subtitle}</p>
      </div>
      <p class="muted">${visual.summary}</p>
      <div class="tags">
        ${visual.sections.map((id) => `<span class="tag">Section ${id}</span>`).join("")}
      </div>
      <div class="button-row">
        ${link(`/visuals/${visual.id}`, "Open Study View")}
        <a class="button secondary" href="${visual.asset}" target="_blank" rel="noopener">Open Standalone</a>
      </div>
    </article>
  `;
}

export function renderVisuals({ app, pageTitle, visualStudies }) {
  setTitle(pageTitle, "Visuals");
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Interactive AWS diagrams</h2>
        <p class="muted">Use these simulators to turn architecture tradeoffs into something you can watch happen.</p>
      </div>
      ${link("/summary", "Back to Summary", "button secondary")}
    </div>
    <div class="grid two">
      ${visualStudies.map(visualCard).join("")}
    </div>
  `;
}

export function renderVisualDetail({ app, pageTitle, visualStudies }, id) {
  const visual = visualStudies.find((item) => item.id === id) || visualStudies[0];
  setTitle(pageTitle, visual.title);
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${visual.title}</h2>
        <p class="muted">${visual.subtitle}</p>
      </div>
      <div class="button-row">
        ${link("/visuals", "All Visuals", "button secondary")}
        <a class="button secondary" href="${visual.asset}" target="_blank" rel="noopener">Open Standalone</a>
      </div>
    </div>
    <div class="visual-layout">
      <section class="visual-frame-panel">
        <iframe class="visual-frame" src="${visual.asset}" title="${visual.title}" sandbox="allow-scripts allow-same-origin"></iframe>
      </section>
      <aside class="visual-notes">
        <article class="study-panel">
          <h2>What This Shows</h2>
          <p>${visual.summary}</p>
        </article>
        <article class="study-panel">
          <h2>Important Takeaways</h2>
          <ul class="takeaway-list">
            ${visual.takeaways.map((takeaway) => `<li>${takeaway}</li>`).join("")}
          </ul>
        </article>
        <article class="study-panel">
          <h2>Try This</h2>
          <ul class="takeaway-list">
            ${visual.prompts.map((prompt) => `<li>${prompt}</li>`).join("")}
          </ul>
        </article>
        <article class="study-panel">
          <h2>Related Sections</h2>
          <div class="tags">
            ${visual.sections.map((sectionId) => `<a class="tag" href="/section/${sectionId}" data-link>Section ${sectionId}</a>`).join("")}
          </div>
        </article>
      </aside>
    </div>
  `;
}
