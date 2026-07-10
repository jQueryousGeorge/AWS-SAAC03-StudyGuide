export const visualStudies = [
  {
    id: "failover",
    title: "Route 53 vs ELB Failover",
    subtitle: "DNS answers compared with active request proxying",
    asset: "/assets/route53-vs-elb-failover-simulator.html",
    sections: [6, 8, 9],
    summary:
      "This simulator contrasts DNS-based failover with load balancer failover. Route 53 can stop returning an unhealthy endpoint after health checks update DNS, but clients may keep using cached answers until TTL expires. On the other hand, an ELB sits in the request path and can route new traffic away from unhealthy targets as soon as its health checks mark them out of service.",
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
