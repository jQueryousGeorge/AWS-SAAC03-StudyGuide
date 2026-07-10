export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function parseSections(markdown) {
  const matches = [...markdown.matchAll(/^## Section (\d+) [^\n]*$/gm)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? markdown.indexOf("\n## The Cross-Section Exam Traps");
    const raw = markdown.slice(start, end > start ? end : undefined).trim();
    const title = match[0].replace(/^##\s*/, "");
    const id = Number(match[1]);
    return { id, title, slug: slugify(title), raw };
  });
}

export function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = "";
  let listOpen = false;
  let quoteOpen = false;
  let table = [];

  const closeList = () => {
    if (listOpen) html += "</ul>";
    listOpen = false;
  };
  const closeQuote = () => {
    if (quoteOpen) html += "</blockquote>";
    quoteOpen = false;
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*-/.test(row))
      .map((row, index) => {
        const cells = row.slice(1, -1).split("|").map((cell) => inlineMarkdown(cell.trim()));
        const tag = index === 0 ? "th" : "td";
        return `<tr>${cells.map((cell) => `<${tag}>${cell}</${tag}>`).join("")}</tr>`;
      })
      .join("");
    html += `<table>${rows}</table>`;
    table = [];
  };

  for (const line of lines) {
    if (/^\|.*\|$/.test(line.trim())) {
      closeList();
      closeQuote();
      table.push(line.trim());
      continue;
    }
    flushTable();

    if (!line.trim()) {
      closeList();
      closeQuote();
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      closeQuote();
      html += `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      closeQuote();
      html += `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      closeQuote();
      html += `<h2>${inlineMarkdown(line.slice(2))}</h2>`;
      continue;
    }
    if (line.startsWith(">")) {
      closeList();
      if (!quoteOpen) {
        html += "<blockquote>";
        quoteOpen = true;
      }
      html += `<p>${inlineMarkdown(line.replace(/^>\s?/, ""))}</p>`;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      closeQuote();
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }
      html += `<li>${inlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      closeQuote();
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }
      html += `<li>${inlineMarkdown(line.replace(/^\s*\d+\.\s+/, ""))}</li>`;
      continue;
    }

    closeList();
    closeQuote();
    html += `<p>${inlineMarkdown(line)}</p>`;
  }

  flushTable();
  closeList();
  closeQuote();
  return html;
}
