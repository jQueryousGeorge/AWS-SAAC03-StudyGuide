export function setTitle(pageTitle, title) {
  pageTitle.textContent = title;
  document.title = `${title} | AWS SAA Study Console`;
}

export function link(path, text, className = "button") {
  return `<a class="${className}" href="${path}" data-link>${text}</a>`;
}
