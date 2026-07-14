export const visualStudies = [
  {
    id: "failover",
    title: "Route 53 vs Elastic Load Balancing Failover",
    subtitle: "Domain Name System answers compared with Elastic Load Balancing request proxying",
    asset: "/assets/route53-vs-elb-failover-simulator.html",
    sections: [6, 8, 9],
    summary:
      "This simulator contrasts DNS-based failover with load balancer failover. Route 53 can stop returning an unhealthy endpoint after health checks update DNS, but clients may keep using cached answers until the TTL, or Time To Live, expires. On the other hand, ELB, or Elastic Load Balancing, sits in the request path and can route new traffic away from unhealthy targets as soon as its health checks mark them out of service.",
    takeaways: [
      "Route 53 routing policies choose DNS answers; they do not proxy traffic.",
      "DNS failover is affected by health check timing and resolver/client Time To Live caching.",
      "Elastic Load Balancing health checks operate at the target group or load balancer layer and remove unhealthy targets from active routing.",
      "Use Route 53 for DNS-level decisions such as regional failover; use Elastic Load Balancing for application-tier target health and traffic distribution.",
      "Exam trigger: stale DNS cache or users still hitting a dead IP points to TTL, or Time To Live, behavior, not load balancer behavior."
    ],
    prompts: [
      "Lower the Route 53 TTL, or Time To Live, fail the primary, and watch how long failed traffic continues.",
      "Fail an Elastic Load Balancer node and compare how quickly new packets avoid the unhealthy backend."
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
  },
  {
    id: "s3-storage-class",
    title: "S3 Storage Class Picker",
    subtitle: "Access frequency and retrieval-wait tolerance compared across the S3 storage class waterfall",
    asset: "/assets/s3-storage-class-picker-simulator.html",
    sections: [10, 11],
    summary:
      "This simulator turns the Section 10 storage-class table into a live decision tool. Dial in how often the data is touched, how long you can wait for a retrieval, and whether the data is recreatable, and it recommends a storage class the way the exam expects you to reason: durability never changes, but availability, retrieval speed, resilience (One Zone vs multi-AZ), and minimum storage duration all trade against each other.",
    takeaways: [
      "Durability (11 nines) is identical across every S3 storage class shown here; only availability, cost, and retrieval speed differ.",
      "One Zone-IA trades multi-AZ resilience for a lower price — it is only a fit when the data can be recreated or is a secondary copy.",
      "Minimum storage durations (30 days for IA classes, 90 for Glacier Instant/Flexible, 180 for Deep Archive) create early-deletion charges if data doesn't stay that long.",
      "Intelligent-Tiering is the answer whenever the access pattern is unknown or keeps changing — it moves objects between tiers automatically with no retrieval fees.",
      "Exam trigger: 'cheapest,' 'millisecond retrieval,' 'can be recreated,' and 'compliance archive for years' are the four dials every storage-class question is built from."
    ],
    prompts: [
      "Set access frequency to 'very rare' and slide retrieval-wait tolerance from milliseconds up to two days to watch the recommendation move through the Glacier tiers.",
      "Toggle 'recreatable / secondary copy' on and off at the same frequency setting to see when One Zone-IA becomes the answer instead of Standard-IA.",
      "Set a short planned storage duration (e.g. 10 days) against a Glacier class to see the early-deletion minimum-duration trap fire."
    ]
  }
];
