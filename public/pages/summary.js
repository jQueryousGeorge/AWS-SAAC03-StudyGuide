import { link, setTitle } from "../lib/render.js";
import { markdownToHtml } from "../lib/markdown.js";

export function renderSummary({ app, pageTitle, state, sectionMeta }) {
  setTitle(pageTitle, "Master Summary");
  const trapsStart = state.markdown.indexOf("## The Cross-Section Exam Traps");
  const traps = trapsStart >= 0 ? state.markdown.slice(trapsStart).trim() : "";
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Sections 1-9 at a glance</h2>
        <p class="muted">Use this page to choose a weak area, then jump into a section page for details and cards.</p>
      </div>
      ${link("/exam", "Practice Exam", "button secondary")}
    </div>
    <div class="grid three">
      ${sectionMeta.map((section) => `
        <article class="card section-card">
          <div>
            <h3>${section.id}. ${section.title}</h3>
            <p>${section.short}</p>
          </div>
          <div class="tags">${section.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
          ${link(`/section/${section.id}`, "Study Section", "button secondary")}
        </article>
      `).join("")}
    </div>
    <div class="study-panel" style="margin-top:18px">
      <div class="markdown">${markdownToHtml(traps)}</div>
    </div>
    <div class="asset-strip" aria-label="Reference images">
      <a class="asset-card" href="/assets/iam-roles-entity-types.png" target="_blank" rel="noopener">
        <img src="/assets/iam-roles-entity-types.png" alt="IAM roles and entity types diagram">
        <span><strong>IAM entity map</strong><small>Open full-size diagram</small></span>
      </a>
      <a class="asset-card" href="/assets/ebs_vs_instanceStore.png" target="_blank" rel="noopener">
        <img src="/assets/ebs_vs_instanceStore.png" alt="EBS versus instance store comparison">
        <span><strong>EBS vs Instance Store</strong><small>Open full-size diagram</small></span>
      </a>
    </div>
  `;
}
