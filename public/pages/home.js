import { link, setTitle } from "../lib/render.js";

export function renderHome({ app, pageTitle, sectionMeta }) {
  setTitle(pageTitle, "Study Console");
  app.innerHTML = `
    <div class="hero">
      <div class="hero-copy">
        <h2>AWS architecture practice that feels like using a control room.</h2>
        <p>This site turns your Sections 1-13 master summaries into a navigable study system: quick review, section deep dives, flip cards, visual references, and two 93-question practice exams.</p>
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
          <div class="nodes"><div class="node accent">Route 53<small>Domain Name System answers, Alias records, health checks</small></div></div>
        </div>
        <div class="layer">
          <div class="layer-label">Public</div>
          <div class="nodes">
            <div class="node accent">ALB<small>Application Load Balancer: HTTP/S paths and hostnames</small></div>
            <div class="node accent">NLB<small>Network Load Balancer: static IP, TCP/UDP</small></div>
            <div class="node accent">CloudFront<small>Edge delivery</small></div>
          </div>
        </div>
        <div class="layer">
          <div class="layer-label">Private</div>
          <div class="nodes">
            <div class="node">ASG AZ-a<small>Auto Scaling Group in Availability Zone A</small></div>
            <div class="node">ASG AZ-b<small>Auto Scaling Group in Availability Zone B</small></div>
            <div class="node">ASG AZ-c<small>Auto Scaling Group in Availability Zone C</small></div>
          </div>
        </div>
        <div class="layer">
          <div class="layer-label">Data</div>
          <div class="nodes">
            <div class="node data">RDS/Aurora<small>Relational Database Service source of truth</small></div>
            <div class="node data">ElastiCache<small>Sessions and reads</small></div>
            <div class="node data">EFS<small>Elastic File System shared Linux files</small></div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid three">
      <div class="card stat"><span class="muted">Study sections</span><strong>13</strong><span>From global infrastructure through CloudFront and Global Accelerator.</span></div>
      <div class="card stat"><span class="muted">Visual simulators</span><strong>3</strong><span>Failover behavior, capacity cost planning, and S3 storage classes.</span></div>
      <div class="card stat"><span class="muted">Flashcards</span><strong>${sectionMeta.reduce((sum, s) => sum + s.cards.length, 0)}</strong><span>Focused on exam traps and decision triggers.</span></div>
      <div class="card stat"><span class="muted">Practice exams</span><strong>186</strong><span>Two 93-question exams with review mode.</span></div>
    </div>
  `;
}
