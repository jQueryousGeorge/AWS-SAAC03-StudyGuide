import { exams } from "../data/exams.js";
import { link, setTitle } from "../lib/render.js";

export function examIntro({ app, pageTitle }) {
  setTitle(pageTitle, "Exam Center");
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Practice exams</h2>
        <p class="muted">Each exam has 93 questions, four choices, scoring, and explanations.</p>
      </div>
    </div>
    <div class="grid two">
      <article class="card">
        <h3>Exam A</h3>
        <p>Balanced review across Sections 1-13 with emphasis on core service selection and exam traps.</p>
        ${link("/exam/a", "Start Exam A")}
      </article>
      <article class="card">
        <h3>Exam B</h3>
        <p>Scenario-heavy second pass with similar coverage and different wording.</p>
        ${link("/exam/b", "Start Exam B")}
      </article>
    </div>
  `;
}

export function renderExam(context, which) {
  const { app, pageTitle, state } = context;
  const exam = exams[which];
  if (!exam) {
    examIntro(context);
    return;
  }
  state.answers = {};
  state.graded = false;
  setTitle(pageTitle, `Exam ${which.toUpperCase()}`);
  app.innerHTML = `
    <div class="exam-layout">
      <div>
        <div class="toolbar">
          <div>
            <h2>${exam.title}</h2>
            <p class="muted">Answer all questions, then grade to review explanations.</p>
          </div>
        </div>
        <div id="questions">
          ${exam.questions.map((question, index) => questionHtml(question, index)).join("")}
        </div>
      </div>
      <aside class="card exam-sidebar">
        <h3>Progress</h3>
        <div class="progress"><span id="progressBar" style="width:0%"></span></div>
        <p><strong id="answeredCount">0</strong> / ${exam.questions.length} answered</p>
        <div id="scoreBox"></div>
        <div class="button-row">
          <button class="button" id="gradeButton" type="button">Grade Exam</button>
          <button class="button secondary" id="resetButton" type="button">Reset</button>
        </div>
      </aside>
    </div>
  `;

  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.graded) return;
      const qid = button.dataset.qid;
      state.answers[qid] = Number(button.dataset.choice);
      document.querySelectorAll(`[data-qid="${qid}"]`).forEach((choice) => choice.classList.remove("selected"));
      button.classList.add("selected");
      updateProgress(state, exam);
    });
  });
  document.querySelector("#gradeButton").addEventListener("click", () => gradeExam(state, exam));
  document.querySelector("#resetButton").addEventListener("click", () => renderExam(context, which));
}

function questionHtml(question, index) {
  return `
    <article class="question-card" id="q${index + 1}">
      <h3>${index + 1}. ${question.q}</h3>
      <p class="muted">Section ${question.s}</p>
      ${question.c.map((choice, choiceIndex) => `
        <button class="choice" type="button" data-qid="${index}" data-choice="${choiceIndex}">
          <span class="choice-key">${String.fromCharCode(65 + choiceIndex)}</span>
          <span>${choice}</span>
        </button>
      `).join("")}
      <div class="explain" hidden data-explain="${index}"></div>
    </article>
  `;
}

function updateProgress(state, exam) {
  const answered = Object.keys(state.answers).length;
  document.querySelector("#answeredCount").textContent = answered;
  document.querySelector("#progressBar").style.width = `${Math.round((answered / exam.questions.length) * 100)}%`;
}

function gradeExam(state, exam) {
  state.graded = true;
  let correct = 0;
  exam.questions.forEach((question, index) => {
    const selected = state.answers[index];
    if (selected === question.a) correct += 1;
    document.querySelectorAll(`[data-qid="${index}"]`).forEach((choice) => {
      const choiceIndex = Number(choice.dataset.choice);
      choice.classList.toggle("correct", choiceIndex === question.a);
      choice.classList.toggle("wrong", selected === choiceIndex && selected !== question.a);
    });
    const explanation = document.querySelector(`[data-explain="${index}"]`);
    explanation.hidden = false;
    explanation.innerHTML = `<strong>${selected === question.a ? "Correct" : "Review"}:</strong> ${question.why}`;
  });
  const percent = Math.round((correct / exam.questions.length) * 100);
  document.querySelector("#scoreBox").innerHTML = `
    <div class="score">
      <div class="score-box"><span class="muted">Score</span><br><strong>${correct}/${exam.questions.length}</strong></div>
      <div class="score-box"><span class="muted">Percent</span><br><strong>${percent}%</strong></div>
    </div>
    <p class="muted">${percent >= 72 ? "Passing range for this practice set." : "Below target. Review incorrect explanations and drill cards."}</p>
  `;
}
