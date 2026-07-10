import { setTitle } from "../lib/render.js";

function flashcardsFor(sectionMeta, sectionId) {
  return sectionMeta
    .filter((section) => !sectionId || section.id === sectionId)
    .flatMap((section) => section.cards.map((card) => ({ section, q: card[0], a: card[1] })));
}

function shuffledIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes;
}

function orderedFlashcards(state, sectionMeta, sectionId) {
  const cards = flashcardsFor(sectionMeta, sectionId);
  const key = `${sectionId}:${cards.length}`;
  if (!state.flashShuffled || state.flashOrderKey !== key || state.flashOrder.length !== cards.length) {
    state.flashOrderKey = key;
    state.flashOrder = Array.from({ length: cards.length }, (_, index) => index);
    return cards;
  }
  return state.flashOrder.map((index) => cards[index]);
}

export function renderFlashcards({ app, pageTitle, state, sectionMeta, navigate }) {
  const params = new URLSearchParams(location.search);
  const selected = Number(params.get("section") || 0);
  if (selected !== state.flashSection) {
    state.flashSection = selected;
    state.flashIndex = 0;
    state.flashFlipped = false;
    state.flashShuffled = false;
    state.flashOrderKey = "";
    state.flashOrder = [];
  }
  const cards = orderedFlashcards(state, sectionMeta, selected);
  state.flashIndex = Math.min(state.flashIndex, Math.max(cards.length - 1, 0));
  const current = cards[state.flashIndex];
  setTitle(pageTitle, "Flashcards");
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Flip-to-reveal review</h2>
        <p class="muted">Filter by section when you want focused reps. Shuffle randomizes the current set.</p>
      </div>
      <div class="flash-toolbar-actions">
        <select id="sectionFilter" aria-label="Choose section">
          <option value="0">All sections</option>
          ${sectionMeta.map((section) => `<option value="${section.id}" ${section.id === selected ? "selected" : ""}>${section.id}. ${section.title}</option>`).join("")}
        </select>
        <button class="button secondary" id="shuffleCards" type="button">${state.flashShuffled ? "Shuffle Again" : "Shuffle"}</button>
      </div>
    </div>
    <div class="flash-study">
      <section class="flash-stage" aria-live="polite">
        <div class="flash-counter">
          <span class="tag">Section ${current.section.id}</span>
          <strong>${state.flashIndex + 1} / ${cards.length}</strong>
        </div>
        <button class="flash-focus-card ${state.flashFlipped ? "flipped" : ""}" id="focusCard" type="button" aria-pressed="${state.flashFlipped}">
          <span class="flash-focus-inner">
            <span class="flash-focus-face">
              <span class="flash-label">Question</span>
              <strong>${current.q}</strong>
              <span class="muted">${current.section.title}</span>
            </span>
            <span class="flash-focus-face flash-focus-back">
              <span class="flash-label">Answer</span>
              <strong>${current.a}</strong>
              <span class="muted">${current.section.title}</span>
            </span>
          </span>
        </button>
        <div class="flash-controls">
          <button class="icon-button" id="prevCard" type="button" aria-label="Previous flashcard">‹</button>
          <button class="button" id="flipCard" type="button">${state.flashFlipped ? "Show Question" : "Reveal Answer"}</button>
          <button class="icon-button" id="nextCard" type="button" aria-label="Next flashcard">›</button>
        </div>
      </section>
      <aside class="flash-list" aria-label="Flashcard list">
        ${cards.map((card, index) => `
          <button class="flash-list-item ${index === state.flashIndex ? "active" : ""}" type="button" data-card-index="${index}">
            <span>${index + 1}</span>
            <strong>${card.q}</strong>
            <small>Section ${card.section.id}</small>
          </button>
        `).join("")}
      </aside>
    </div>
  `;

  document.querySelector("#sectionFilter").addEventListener("change", (event) => {
    const value = Number(event.target.value);
    navigate(value ? `/flashcards?section=${value}` : "/flashcards");
  });
  document.querySelector("#shuffleCards").addEventListener("click", () => {
    state.flashShuffled = true;
    state.flashOrderKey = `${selected}:${cards.length}`;
    state.flashOrder = shuffledIndexes(cards.length);
    state.flashIndex = 0;
    state.flashFlipped = false;
    renderFlashcards({ app, pageTitle, state, sectionMeta, navigate });
  });
  document.querySelector("#focusCard").addEventListener("click", () => {
    state.flashFlipped = !state.flashFlipped;
    renderFlashcards({ app, pageTitle, state, sectionMeta, navigate });
  });
  document.querySelector("#flipCard").addEventListener("click", () => {
    state.flashFlipped = !state.flashFlipped;
    renderFlashcards({ app, pageTitle, state, sectionMeta, navigate });
  });
  document.querySelector("#prevCard").addEventListener("click", () => {
    state.flashIndex = (state.flashIndex - 1 + cards.length) % cards.length;
    state.flashFlipped = false;
    renderFlashcards({ app, pageTitle, state, sectionMeta, navigate });
  });
  document.querySelector("#nextCard").addEventListener("click", () => {
    state.flashIndex = (state.flashIndex + 1) % cards.length;
    state.flashFlipped = false;
    renderFlashcards({ app, pageTitle, state, sectionMeta, navigate });
  });
  document.querySelectorAll("[data-card-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.flashIndex = Number(button.dataset.cardIndex);
      state.flashFlipped = false;
      renderFlashcards({ app, pageTitle, state, sectionMeta, navigate });
    });
  });
}
