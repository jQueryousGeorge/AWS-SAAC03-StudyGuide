import { sectionMeta } from "./data/sections.js";
import { visualStudies } from "./data/visuals.js";
import { parseSections } from "./lib/markdown.js";
import { renderHome } from "./pages/home.js";
import { renderSummary } from "./pages/summary.js";
import { renderSection } from "./pages/sections.js";
import { renderVisualDetail, renderVisuals } from "./pages/visuals.js";
import { renderFlashcards } from "./pages/flashcards.js";
import { examIntro, renderExam } from "./pages/exams.js";

const app = document.querySelector("#app");
const pageTitle = document.querySelector("#pageTitle");
const sectionNav = document.querySelector("#sectionNav");
const menuButton = document.querySelector("#menuButton");
const sidebarToggle = document.querySelector("#sidebarToggle");
const sidebarReopen = document.querySelector("#sidebarReopen");
const collapsedPageTitle = document.querySelector("#collapsedPageTitle");

const contentPath = "/content/aws-saa-sections-1-9-master-summary.md";

const state = {
  markdown: "",
  sections: [],
  answers: {},
  graded: false,
  flashIndex: 0,
  flashFlipped: false,
  flashSection: 0,
  flashShuffled: false,
  flashOrderKey: "",
  flashOrder: []
};

const context = {
  app,
  pageTitle,
  sectionMeta,
  visualStudies,
  state,
  navigate
};

function syncActiveLinks() {
  const path = location.pathname;
  document.querySelectorAll("[data-link]").forEach((node) => {
    const href = node.getAttribute("href");
    node.classList.toggle("active", href === path || (href !== "/" && path.startsWith(href)));
  });
}

function buildNav() {
  sectionNav.innerHTML = `<p class="section-title">Sections</p>${sectionMeta
    .map((section) => `<a class="section-link" href="/section/${section.id}" data-link>${section.id}. ${section.title}</a>`)
    .join("")}`;
}

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute("aria-label", collapsed ? "Open sidebar" : "Collapse sidebar");
  sidebarToggle.title = collapsed ? "Open sidebar" : "Collapse sidebar";
  collapsedPageTitle.textContent = pageTitle.textContent;
  localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
}

function navigate(path) {
  history.pushState(null, "", path);
  renderRoute();
  document.body.classList.remove("nav-open");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderRoute() {
  const path = location.pathname;
  if (path === "/") renderHome(context);
  else if (path === "/summary") renderSummary(context);
  else if (path === "/visuals") renderVisuals(context);
  else if (path.startsWith("/visuals/")) renderVisualDetail(context, path.split("/").pop());
  else if (path.startsWith("/section/")) renderSection(context, Number(path.split("/").pop()));
  else if (path === "/flashcards") renderFlashcards(context);
  else if (path === "/exam") examIntro(context);
  else if (path === "/exam/a") renderExam(context, "a");
  else if (path === "/exam/b") renderExam(context, "b");
  else renderHome(context);
  collapsedPageTitle.textContent = pageTitle.textContent;
  syncActiveLinks();
}

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[data-link]");
  if (!anchor) return;
  const url = new URL(anchor.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  navigate(`${url.pathname}${url.search}`);
});

menuButton.addEventListener("click", () => document.body.classList.toggle("nav-open"));
sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed")));
sidebarReopen.addEventListener("click", () => setSidebarCollapsed(false));
window.addEventListener("popstate", renderRoute);

setSidebarCollapsed(localStorage.getItem("sidebarCollapsed") === "true");

fetch(contentPath)
  .then((response) => response.text())
  .then((markdown) => {
    state.markdown = markdown;
    state.sections = parseSections(markdown);
    buildNav();
    renderRoute();
  })
  .catch(() => {
    state.markdown = "";
    state.sections = [];
    buildNav();
    app.innerHTML = "<p>Could not load the study summary.</p>";
  });
