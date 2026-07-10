const app = document.querySelector("#app");
const pageTitle = document.querySelector("#pageTitle");
const sectionNav = document.querySelector("#sectionNav");
const menuButton = document.querySelector("#menuButton");

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

const additionalFlashcards = {
  1: [
    ["What is the difference between a Region and an AZ?", "A Region is a geographic AWS area; an AZ is an isolated data center group inside that Region."],
    ["When should you choose multi-Region instead of only multi-AZ?", "Use multi-Region for disaster recovery beyond a Region, global latency needs, or strict geographic failover requirements."],
    ["Why can AZ names differ between AWS accounts?", "AWS maps names like us-east-1a independently per account; use AZ IDs when consistent physical AZ identity matters."],
    ["Which global infrastructure choice most directly affects data residency?", "The AWS Region where the data is stored and processed."],
    ["What exam phrase points toward edge services?", "Global users need lower latency, content delivery, or acceleration close to users."],
    ["Why are most AWS architectures designed across at least two AZs?", "To remove a single-AZ failure as a single point of failure."],
    ["What should you assume about a service if you do not know its scope?", "Assume it is Regional unless it is a known global service."]
  ],
  2: [
    ["What is the shared responsibility model trap for IAM?", "AWS secures the cloud infrastructure; you secure identities, policies, credentials, and access decisions in your account."],
    ["What is STS used for?", "AWS Security Token Service issues temporary credentials, usually through role assumption or federation."],
    ["What is role switching commonly used for?", "Cross-account access without creating long-lived users in every account."],
    ["What is the difference between identity-based and resource-based policies?", "Identity policies attach to IAM identities; resource policies attach to resources and can name principals."],
    ["What service is used for workforce single sign-on across AWS accounts?", "AWS IAM Identity Center."],
    ["When should Secrets Manager be preferred over hardcoded configuration?", "When applications need managed storage, retrieval, and rotation of secrets such as database passwords."],
    ["What is an SCP in AWS Organizations?", "A Service Control Policy sets maximum allowed permissions for accounts or organizational units."],
    ["What does an explicit Deny do in IAM policy evaluation?", "It overrides Allows."],
    ["What is the safest answer when a person or workload only needs one service action?", "Grant least privilege for only that required action and resource scope."]
  ],
  3: [
    ["Which EC2 instance family fits balanced web servers?", "General purpose families such as t and m."],
    ["Which instance family is usually best for high sequential local disk I/O?", "Storage optimized families such as i, d, and h."],
    ["Why should a security group reference another security group?", "It allows tier-to-tier access without hardcoding changing instance IPs."],
    ["What is the default outbound behavior of a security group?", "All outbound traffic is allowed by default."],
    ["What is a Launch Template used for?", "It defines instance configuration for launches, including AMI, type, user data, storage, security groups, and IAM role."],
    ["Which pricing option is best for short, unpredictable, uninterrupted workloads?", "On-Demand Instances."],
    ["Which purchasing option is strongest for BYOL and physical host visibility?", "Dedicated Hosts."],
    ["What is the 2-minute Spot interruption notice used for?", "Graceful shutdown, checkpointing, or draining work before interruption."]
  ],
  4: [
    ["Why does AWS recommend avoiding Elastic IPs when possible?", "They often indicate brittle architecture; DNS and load balancers are usually better abstractions."],
    ["What is the best public entry point for private EC2 instances in a web tier?", "A public load balancer with EC2 instances in private subnets."],
    ["Which placement group strategy spreads across separate racks but supports hundreds of instances?", "Partition placement groups."],
    ["What can move with an ENI during failover?", "Private IPs, associated Elastic IP mappings, MAC address, and security group associations."],
    ["Can an ENI move across Availability Zones?", "No. ENIs are bound to an AZ."],
    ["What happens to instance store data when the underlying host fails?", "The data is lost."],
    ["What workload benefits from EC2 hibernate?", "A long-running or slow-starting workload that benefits from preserving RAM state."]
  ],
  5: [
    ["Which storage type is object storage?", "Amazon S3."],
    ["Which storage type is block storage?", "Amazon EBS."],
    ["Which storage type is managed shared file storage for Linux?", "Amazon EFS."],
    ["What is the main cost risk with EBS?", "You pay for provisioned capacity and performance whether the app uses all of it or not."],
    ["Which EBS type should you avoid for boot volumes?", "HDD-backed st1 and sc1 cannot be boot volumes."],
    ["What does EFS lifecycle management do?", "Moves files to lower-cost storage classes after configured periods without access."],
    ["When is EFS Max I/O performance mode appropriate?", "Highly parallel workloads that need more aggregate throughput and can tolerate higher latency."],
    ["What is Fast Snapshot Restore for?", "Avoiding first-use latency when creating volumes from snapshots."],
    ["What is the exam trap with RDS and binary files?", "RDS is for relational data, not storing large files, uploads, or software packages."]
  ],
  6: [
    ["Which load balancer is Layer 7?", "Application Load Balancer."],
    ["Which load balancer is Layer 4?", "Network Load Balancer."],
    ["Which load balancer works at Layer 3 for appliance traffic?", "Gateway Load Balancer."],
    ["Which load balancer is best for WebSocket and HTTP/2 routing?", "Application Load Balancer."],
    ["Which load balancer should you choose for UDP traffic?", "Network Load Balancer."],
    ["What is the main downside of sticky sessions?", "They can create load imbalance and keep state tied to individual targets."],
    ["What ASG metric is often better than CPU for web workloads behind an ALB?", "RequestCountPerTarget."],
    ["What does an ASG do when an instance fails health checks?", "It can terminate and replace the unhealthy instance."],
    ["What deployment speed pattern helps ASG scale-out become useful faster?", "Use a Golden AMI so instances boot with dependencies already installed."]
  ],
  7: [
    ["What is the key replication difference between Multi-AZ and Read Replicas?", "Multi-AZ is synchronous standby replication; Read Replicas are asynchronous."],
    ["What is the purpose of an Aurora reader endpoint?", "Connection-level load balancing across Aurora replicas."],
    ["When is Aurora Serverless a strong answer?", "Infrequent, intermittent, or unpredictable database workloads with no capacity planning."],
    ["What does Aurora Global Database optimize for?", "Low-latency global reads and cross-Region disaster recovery with fast promotion."],
    ["What is Aurora cloning best for?", "Creating fast, low-cost staging or test copies through copy-on-write."],
    ["Which service stores database credentials for RDS Proxy?", "AWS Secrets Manager."],
    ["Why does ElastiCache require app changes?", "The application must implement cache reads, writes, invalidation, and fallback behavior."],
    ["Which ElastiCache engine supports Multi-AZ with auto failover?", "Redis."],
    ["Which ElastiCache engine is multi-threaded and sharded but not highly available by design?", "Memcached."],
    ["Which pattern makes the app tier stateless for login sessions?", "Store session data in ElastiCache or DynamoDB and keep only a session ID in the cookie."]
  ],
  8: [
    ["What does an Alias record cost in Route 53?", "Alias queries to AWS resources are free."],
    ["Who sets TTL for Alias records?", "AWS sets the TTL for the target; you do not configure it directly."],
    ["Which routing policy should you use for blue/green or canary DNS response splitting?", "Weighted routing."],
    ["Which routing policy chooses the lowest-latency AWS Region for the user?", "Latency-based routing."],
    ["Which routing policy should include a default record for unmatched users?", "Geolocation routing."],
    ["What percentage of Route 53 health checkers must report healthy?", "More than 18% of global health checkers."],
    ["What response codes are healthy for HTTP/HTTPS Route 53 endpoint checks?", "2xx and 3xx responses."],
    ["Why is Multi-Value routing not a load balancer replacement?", "It returns DNS answers only; it does not provide full load balancer health, routing, or connection behavior."]
  ],
  9: [
    ["What service provides loose coupling between producers and consumers?", "Amazon SQS for queues, or Amazon SNS/EventBridge for pub/sub and event routing patterns."],
    ["When is SQS better than direct synchronous calls?", "When components should buffer work and scale independently."],
    ["What is the classic fix for one slow synchronous workflow in a web app?", "Move the work to an asynchronous queue and process it with workers."],
    ["What Beanstalk tier scales based on queue depth?", "Worker Environment."],
    ["What is immutable infrastructure?", "Replacing instances or environments with newly built versions instead of patching them in place."],
    ["What is the pilot light DR strategy?", "Keep minimal core infrastructure running in another Region and scale it up during disaster."],
    ["What is warm standby DR?", "Keep a scaled-down functional environment running in another Region and scale it during failover."],
    ["What is active-active DR?", "Run production traffic in multiple locations at the same time."]
  ]
};

sectionMeta.forEach((section) => {
  section.cards.push(...(additionalFlashcards[section.id] || []));
});

const visualStudies = [
  {
    id: "failover",
    title: "Route 53 vs ELB Failover",
    subtitle: "DNS answers compared with active request proxying",
    asset: "/assets/route53-vs-elb-failover-simulator.html",
    sections: [6, 8, 9],
    summary:
      "This simulator contrasts DNS-based failover with load balancer failover. Route 53 can stop returning an unhealthy endpoint after health checks update DNS, but clients may keep using cached answers until TTL expires. An ELB sits in the request path and can route new traffic away from unhealthy targets as soon as its health checks mark them out of service.",
    takeaways: [
      "Route 53 routing policies choose DNS answers; they do not proxy traffic.",
      "DNS failover is affected by health check timing and resolver/client TTL caching.",
      "ELB health checks operate at the target group or load balancer layer and remove unhealthy targets from active routing.",
      "Use Route 53 for DNS-level decisions such as regional failover; use ELB for application-tier target health and traffic distribution.",
      "Exam trigger: stale DNS cache or users still hitting a dead IP points to TTL behavior, not ELB behavior."
    ],
    prompts: [
      "Lower the Route 53 TTL, fail the primary, and watch how long failed traffic continues.",
      "Fail an ELB node and compare how quickly new packets avoid the unhealthy backend."
    ]
  },
  {
    id: "cost",
    title: "Reserved vs On-Demand Capacity",
    subtitle: "Baseline commitments compared with burst capacity",
    asset: "/assets/aws_cost_optimization_simulator.html",
    sections: [3, 6, 9],
    summary:
      "This simulator models a 24-hour capacity curve and lets you choose how much baseline capacity to reserve. Reserved capacity is cheaper per hour but paid continuously, so it is strongest for predictable minimum usage. On-Demand capacity costs more per hour but fits variable spikes because you pay only when you need it.",
    takeaways: [
      "Reserve the steady baseline; avoid reserving the whole peak unless the peak is sustained and predictable.",
      "On-Demand is appropriate for unpredictable or short-lived capacity above the baseline.",
      "Over-reserving creates paid but unused capacity, which weakens the cost-optimization benefit.",
      "For fault-tolerant burst work, Spot may be better than On-Demand, but not for critical databases or non-interruptible workloads.",
      "Exam trigger: predictable steady-state usage points to Reserved Instances or Savings Plans; unpredictable spikes point to elastic capacity."
    ],
    prompts: [
      "Set reserved capacity below, at, and above the baseline to see when waste appears.",
      "Compare total daily cost when you reserve for baseline versus reserve for peak."
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
          ${link("/visuals", "Study Visuals", "button secondary")}
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
      <div class="card stat"><span class="muted">Visual simulators</span><strong>2</strong><span>Failover behavior and capacity cost planning.</span></div>
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

function renderVisuals() {
  setTitle("Visuals");
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

function renderVisualDetail(id) {
  const visual = visualStudies.find((item) => item.id === id) || visualStudies[0];
  setTitle(visual.title);
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

function flashcardsFor(sectionId) {
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

function orderedFlashcards(sectionId) {
  const cards = flashcardsFor(sectionId);
  const key = `${sectionId}:${cards.length}`;
  if (!state.flashShuffled || state.flashOrderKey !== key || state.flashOrder.length !== cards.length) {
    state.flashOrderKey = key;
    state.flashOrder = Array.from({ length: cards.length }, (_, index) => index);
    return cards;
  }
  return state.flashOrder.map((index) => cards[index]);
}

function renderFlashcards() {
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
  const cards = orderedFlashcards(selected);
  state.flashIndex = Math.min(state.flashIndex, Math.max(cards.length - 1, 0));
  const current = cards[state.flashIndex];
  setTitle("Flashcards");
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
    renderFlashcards();
  });
  document.querySelector("#focusCard").addEventListener("click", () => {
    state.flashFlipped = !state.flashFlipped;
    renderFlashcards();
  });
  document.querySelector("#flipCard").addEventListener("click", () => {
    state.flashFlipped = !state.flashFlipped;
    renderFlashcards();
  });
  document.querySelector("#prevCard").addEventListener("click", () => {
    state.flashIndex = (state.flashIndex - 1 + cards.length) % cards.length;
    state.flashFlipped = false;
    renderFlashcards();
  });
  document.querySelector("#nextCard").addEventListener("click", () => {
    state.flashIndex = (state.flashIndex + 1) % cards.length;
    state.flashFlipped = false;
    renderFlashcards();
  });
  document.querySelectorAll("[data-card-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.flashIndex = Number(button.dataset.cardIndex);
      state.flashFlipped = false;
      renderFlashcards();
    });
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
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderRoute() {
  const path = location.pathname;
  if (path === "/") renderHome();
  else if (path === "/summary") renderSummary();
  else if (path === "/visuals") renderVisuals();
  else if (path.startsWith("/visuals/")) renderVisualDetail(path.split("/").pop());
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
