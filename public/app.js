const app = document.querySelector("#app");
const pageTitle = document.querySelector("#pageTitle");
const sectionNav = document.querySelector("#sectionNav");
const menuButton = document.querySelector("#menuButton");

const contentPath = "/content/aws-saa-sections-1-9-master-summary.md";
const state = {
  markdown: "",
  sections: [],
  answers: {},
  graded: false
};

const sectionMeta = [
  {
    id: 1,
    title: "Global Infrastructure",
    short: "Regions, AZs, edge, global services",
    tags: ["Region scope", "Multi-AZ", "Edge"],
    focus: "Blast radius thinking: Region > AZ > data center, plus when to reach for edge services.",
    cards: [
      ["What are the four factors for choosing a Region?", "Compliance, proximity to customers, service availability, and pricing."],
      ["What does highly available usually mean on the exam?", "Run across at least two Availability Zones."],
      ["Which services are global in these notes?", "IAM, Route 53, CloudFront, and WAF."],
      ["What are edge locations for?", "Delivering content close to users with services like CloudFront and Global Accelerator."],
      ["Does AWS move data between Regions automatically?", "No. Data leaves a Region only when you explicitly configure that movement."]
    ]
  },
  {
    id: 2,
    title: "IAM",
    short: "Users, groups, roles, policies, MFA",
    tags: ["Least privilege", "Roles", "MFA"],
    focus: "Who can do what, on which resource, under which conditions.",
    cards: [
      ["When should an EC2 instance use access keys?", "Almost never. Use an IAM role for AWS permissions."],
      ["What can IAM groups contain?", "Users only. No nested groups."],
      ["Credential Report vs Access Advisor?", "Credential Report is account-wide credential status. Access Advisor is per-principal service usage."],
      ["What policy field decides allow or deny?", "Effect."],
      ["What should the root account be used for?", "Initial account setup and rare account-level tasks only."]
    ]
  },
  {
    id: 3,
    title: "EC2 Basics",
    short: "Instance families, security groups, pricing, Spot",
    tags: ["Security groups", "Purchasing", "Spot"],
    focus: "EC2 as the baseline building block: compute, firewalling, bootstrapping, and cost models.",
    cards: [
      ["Timeout vs connection refused?", "Timeout usually points to a security group or network path. Refused means the app was reached but is not accepting."],
      ["What does EC2 User Data do?", "Runs once on first boot as root, typically for bootstrap automation."],
      ["RI vs Savings Plan?", "RI commits to instance attributes. Savings Plan commits to dollars per hour of usage."],
      ["What workloads fit Spot?", "Fault-tolerant, interruptible work like batch, analytics, image processing, and flexible jobs."],
      ["How do you avoid a persistent Spot request relaunch loop?", "Cancel the Spot request first, then terminate the instances."]
    ]
  },
  {
    id: 4,
    title: "EC2 Associate",
    short: "IPs, ENIs, placement groups, hibernate",
    tags: ["EIP", "ENI", "Placement"],
    focus: "Where instances land, how traffic reaches them, and how failover can follow network identities.",
    cards: [
      ["When does an EC2 public IP change?", "On stop/start. Use an Elastic IP if the public IPv4 must stay fixed."],
      ["Cluster vs Spread placement?", "Cluster is low-latency same-AZ/rack. Spread isolates critical instances on distinct hardware."],
      ["What is Partition placement for?", "Partition-aware big data systems like HDFS, Cassandra, Kafka, and HBase."],
      ["What is the ENI failover pattern?", "Move the ENI with its private IP from a failed instance to a standby in the same AZ."],
      ["What does hibernate preserve?", "RAM state, written to encrypted root EBS, for faster resume."]
    ]
  },
  {
    id: 5,
    title: "Storage",
    short: "EBS, snapshots, AMIs, instance store, EFS",
    tags: ["EBS", "EFS", "AMI"],
    focus: "Choosing block, ephemeral, and shared file storage based on persistence, AZ scope, and sharing.",
    cards: [
      ["How do you move EBS data across AZs?", "Snapshot the volume, then restore it in the target AZ."],
      ["What is the Golden AMI pattern?", "Pre-bake dependencies and configuration once so scale-out instances boot quickly."],
      ["EBS vs EFS in one line?", "EBS is one-instance block storage in one AZ. EFS is shared Linux NFS across AZs."],
      ["How do you encrypt an existing unencrypted EBS volume?", "Snapshot it, copy the snapshot with encryption, create a volume from the encrypted copy, then attach it."],
      ["When should instance store be used?", "Temporary scratch, buffers, and caches where data loss is acceptable."]
    ]
  },
  {
    id: 6,
    title: "ELB and ASG",
    short: "Load balancers, health checks, scaling",
    tags: ["ALB", "NLB", "ASG"],
    focus: "Distributing traffic, replacing unhealthy nodes, and scaling horizontally across AZs.",
    cards: [
      ["ALB vs NLB?", "ALB is Layer 7 routing for HTTP/S. NLB is Layer 4 for static IP, TCP/UDP/TLS, and extreme performance."],
      ["Which LB handles third-party appliances?", "Gateway Load Balancer using GENEVE on port 6081."],
      ["What header carries the real client IP behind ALB?", "X-Forwarded-For."],
      ["What is Target Tracking?", "An ASG policy that keeps a metric near a target, such as average CPU around 40 percent."],
      ["What is deregistration delay?", "Time for in-flight requests to finish while a target is removed from service."]
    ]
  },
  {
    id: 7,
    title: "RDS, Aurora, ElastiCache",
    short: "Relational databases and caching",
    tags: ["Multi-AZ", "Read replicas", "Cache"],
    focus: "Separating availability, read scaling, connection pooling, and in-memory state.",
    cards: [
      ["Multi-AZ vs Read Replica?", "Multi-AZ is synchronous standby for availability. Read Replicas are asynchronous read scaling."],
      ["Can you SSH into RDS?", "No, except with RDS Custom for Oracle and SQL Server."],
      ["What are Aurora writer and reader endpoints?", "Writer tracks the primary. Reader load balances connections across replicas."],
      ["When is RDS Proxy a strong answer?", "Lambda or app fleets opening too many DB connections, or when IAM auth enforcement is required."],
      ["Redis vs Memcached?", "Redis supports HA, replicas, persistence, and advanced structures. Memcached is simple sharded non-persistent cache."]
    ]
  },
  {
    id: 8,
    title: "Route 53",
    short: "DNS records, routing policies, health checks",
    tags: ["Alias", "TTL", "Failover"],
    focus: "DNS answers questions; routing policies decide which answer is returned.",
    cards: [
      ["CNAME vs Alias at the zone apex?", "CNAME cannot be used at the apex. Alias can, but only to supported AWS targets."],
      ["Does DNS route packets?", "No. It returns answers that clients then use."],
      ["Which policy is active-passive?", "Failover routing, with a mandatory health check on the primary."],
      ["What does latency routing measure?", "User-to-AWS-region latency, not geography."],
      ["How can Route 53 check private resources?", "Use a CloudWatch metric and alarm, then have the health check monitor the alarm."]
    ]
  },
  {
    id: 9,
    title: "Classic Architecture",
    short: "3-tier design and exam reasoning",
    tags: ["3-tier", "Beanstalk", "Stateless"],
    focus: "The common architecture path: public entry, private compute, shared data, managed scaling.",
    cards: [
      ["What is the typical 3-tier AWS web architecture?", "Route 53 to public ELB to private ASG/EC2 across AZs to RDS and ElastiCache in data subnets."],
      ["Why does DNS alone fail as instance failover?", "Resolvers cache records until TTL expires, so users can keep hitting dead IPs."],
      ["How do you make cart/session state survive horizontal scaling?", "Store only a session ID in the cookie and keep session data in ElastiCache or DynamoDB."],
      ["Why does WordPress need EFS when scaled horizontally?", "Uploads on per-instance EBS disappear depending on which instance serves the request."],
      ["What does Elastic Beanstalk wrap?", "EC2, ASG, ELB, optional RDS, deployment, health, and scaling workflows."]
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseSections(markdown) {
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

function markdownToHtml(markdown) {
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

function setTitle(title) {
  pageTitle.textContent = title;
  document.title = `${title} | AWS SAA Study Console`;
}

function link(path, text, className = "button") {
  return `<a class="${className}" href="${path}" data-link>${text}</a>`;
}

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

function renderHome() {
  setTitle("Study Console");
  app.innerHTML = `
    <div class="hero">
      <div class="hero-copy">
        <h2>AWS architecture practice that feels like using a control room.</h2>
        <p>This site turns your Sections 1-9 master summary into a navigable study system: quick review, section deep dives, flip cards, visual references, and two 65-question practice exams.</p>
        <div class="hero-actions">
          ${link("/summary", "Open Summary")}
          ${link("/flashcards", "Drill Flashcards", "button secondary")}
          ${link("/exam", "Go to Exams", "button secondary")}
        </div>
      </div>
      <div class="architecture-board" aria-label="AWS 3-tier architecture visual">
        <div class="layer">
          <div class="layer-label">DNS</div>
          <div class="nodes"><div class="node accent">Route 53<small>Alias, health checks, routing policy</small></div></div>
        </div>
        <div class="layer">
          <div class="layer-label">Public</div>
          <div class="nodes">
            <div class="node accent">ALB<small>HTTP/S, paths, hostnames</small></div>
            <div class="node accent">NLB<small>Static IP, TCP/UDP</small></div>
            <div class="node accent">CloudFront<small>Edge delivery</small></div>
          </div>
        </div>
        <div class="layer">
          <div class="layer-label">Private</div>
          <div class="nodes">
            <div class="node">ASG AZ-a<small>EC2 app tier</small></div>
            <div class="node">ASG AZ-b<small>EC2 app tier</small></div>
            <div class="node">ASG AZ-c<small>EC2 app tier</small></div>
          </div>
        </div>
        <div class="layer">
          <div class="layer-label">Data</div>
          <div class="nodes">
            <div class="node data">RDS/Aurora<small>Source of truth</small></div>
            <div class="node data">ElastiCache<small>Sessions and reads</small></div>
            <div class="node data">EFS<small>Shared Linux files</small></div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid three">
      <div class="card stat"><span class="muted">Study sections</span><strong>9</strong><span>From global infrastructure through Beanstalk.</span></div>
      <div class="card stat"><span class="muted">Flashcards</span><strong>${sectionMeta.reduce((sum, s) => sum + s.cards.length, 0)}</strong><span>Focused on exam traps and decision triggers.</span></div>
      <div class="card stat"><span class="muted">Practice exams</span><strong>130</strong><span>Two 65-question exams with review mode.</span></div>
    </div>
  `;
}

function renderSummary() {
  setTitle("Master Summary");
  const traps = state.markdown.slice(state.markdown.indexOf("## The Cross-Section Exam Traps")).trim();
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
    <div class="asset-strip">
      <img src="/assets/iam-roles-entity-types.png" alt="IAM roles and entity types diagram">
      <img src="/assets/ebs_vs_instanceStore.png" alt="EBS versus instance store comparison">
    </div>
  `;
}

function renderSection(id) {
  const meta = sectionMeta.find((section) => section.id === id) || sectionMeta[0];
  const section = state.sections.find((item) => item.id === meta.id);
  setTitle(`${meta.id}. ${meta.title}`);
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${meta.title}</h2>
        <p class="muted">${meta.focus}</p>
        <div class="tags">${meta.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
      <div class="button-row">
        ${link(`/flashcards?section=${meta.id}`, "Cards", "button secondary")}
        ${link("/exam", "Exam Center", "button secondary")}
      </div>
    </div>
    <div class="grid two">
      <article class="study-panel markdown">${markdownToHtml(section?.raw || "")}</article>
      <aside class="study-panel">
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
}

function flashcardsFor(sectionId) {
  return sectionMeta
    .filter((section) => !sectionId || section.id === sectionId)
    .flatMap((section) => section.cards.map((card) => ({ section, q: card[0], a: card[1] })));
}

function renderFlashcards() {
  const params = new URLSearchParams(location.search);
  const selected = Number(params.get("section") || 0);
  const cards = flashcardsFor(selected);
  setTitle("Flashcards");
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Flip-to-reveal review</h2>
        <p class="muted">Filter by section when you want focused reps.</p>
      </div>
      <select id="sectionFilter" aria-label="Choose section">
        <option value="0">All sections</option>
        ${sectionMeta.map((section) => `<option value="${section.id}" ${section.id === selected ? "selected" : ""}>${section.id}. ${section.title}</option>`).join("")}
      </select>
    </div>
    <div class="flash-grid">
      ${cards.map((card) => `
        <button class="flashcard" type="button">
          <span class="flash-inner">
            <span class="flash-face">
              <span class="flash-label">Section ${card.section.id} question</span>
              <strong>${card.q}</strong>
              <span class="muted">Click to reveal</span>
            </span>
            <span class="flash-face flash-back">
              <span class="flash-label">Answer</span>
              <strong>${card.a}</strong>
              <span class="muted">${card.section.title}</span>
            </span>
          </span>
        </button>
      `).join("")}
    </div>
  `;

  document.querySelector("#sectionFilter").addEventListener("change", (event) => {
    const value = Number(event.target.value);
    navigate(value ? `/flashcards?section=${value}` : "/flashcards");
  });
  document.querySelectorAll(".flashcard").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
}

function examIntro() {
  setTitle("Exam Center");
  app.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Practice exams</h2>
        <p class="muted">Each exam has 65 questions, four choices, scoring, and explanations.</p>
      </div>
    </div>
    <div class="grid two">
      <article class="card">
        <h3>Exam A</h3>
        <p>Balanced review across Sections 1-9 with emphasis on core service selection and exam traps.</p>
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

function renderExam(which) {
  const exam = window.EXAMS?.[which];
  if (!exam) {
    examIntro();
    return;
  }
  state.answers = {};
  state.graded = false;
  setTitle(`Exam ${which.toUpperCase()}`);
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
      updateProgress(exam);
    });
  });
  document.querySelector("#gradeButton").addEventListener("click", () => gradeExam(exam));
  document.querySelector("#resetButton").addEventListener("click", () => renderExam(which));
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

function updateProgress(exam) {
  const answered = Object.keys(state.answers).length;
  document.querySelector("#answeredCount").textContent = answered;
  document.querySelector("#progressBar").style.width = `${Math.round((answered / exam.questions.length) * 100)}%`;
}

function gradeExam(exam) {
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

function navigate(path) {
  history.pushState(null, "", path);
  renderRoute();
  document.body.classList.remove("nav-open");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderRoute() {
  const path = location.pathname;
  if (path === "/") renderHome();
  else if (path === "/summary") renderSummary();
  else if (path.startsWith("/section/")) renderSection(Number(path.split("/").pop()));
  else if (path === "/flashcards") renderFlashcards();
  else if (path === "/exam") examIntro();
  else if (path === "/exam/a") renderExam("a");
  else if (path === "/exam/b") renderExam("b");
  else renderHome();
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
window.addEventListener("popstate", renderRoute);

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
