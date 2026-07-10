import { markdownToHtml } from "../lib/markdown.js";
import { link, setTitle } from "../lib/render.js";

export function renderSection({ app, pageTitle, state, sectionMeta }, id) {
  const meta = sectionMeta.find((section) => section.id === id) || sectionMeta[0];
  const section = state.sections.find((item) => item.id === meta.id);
  setTitle(pageTitle, `${meta.id}. ${meta.title}`);
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${meta.title}</h2>
        <p class="muted">${meta.focus}</p>
        <div class="tags">${meta.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
      <div class="button-row">
        <button class="icon-button study-expand-button" id="studyExpandButton" type="button" aria-label="Expand study section" aria-pressed="false" title="Expand study section">⛶</button>
        ${link(`/flashcards?section=${meta.id}`, "Cards", "button secondary")}
        ${link("/exam", "Exam Center", "button secondary")}
      </div>
    </div>
    <div class="grid two section-study-layout" id="sectionStudyLayout">
      <article class="study-panel markdown">${markdownToHtml(section?.raw || "")}</article>
      <aside class="study-panel lock-panel">
        <h2>Lock It In</h2>
        <p class="muted">These cards are pulled from the highest-yield facts in this section.</p>
        <div class="grid">
          ${meta.cards.map((card, index) => `
            <button class="choice" type="button" data-flip-inline="${index}">
              <span class="choice-key">${index + 1}</span>
              <span><strong>${card[0]}</strong><br><span class="muted">${card[1]}</span></span>
            </button>
          `).join("")}
        </div>
      </aside>
    </div>
  `;

  const studyLayout = document.querySelector("#sectionStudyLayout");
  const studyExpandButton = document.querySelector("#studyExpandButton");
  studyExpandButton.addEventListener("click", () => {
    const expanded = studyLayout.classList.toggle("study-expanded");
    studyExpandButton.setAttribute("aria-pressed", String(expanded));
    studyExpandButton.setAttribute("aria-label", expanded ? "Show Lock It In panel" : "Expand study section");
    studyExpandButton.title = expanded ? "Show Lock It In panel" : "Expand study section";
    studyExpandButton.textContent = expanded ? "×" : "⛶";
  });
}
