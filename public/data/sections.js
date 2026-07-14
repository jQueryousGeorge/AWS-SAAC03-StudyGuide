export const sectionMeta = [
  {
    id: 1,
    title: "Global Infrastructure",
    short: "Regions, Availability Zones, edge, global services",
    tags: ["Region scope", "Multi-AZ", "Edge"],
    focus: "Blast radius thinking: Region > Availability Zone > data center, plus when to reach for edge services.",
    cards: [
      ["What are the four factors for choosing a Region?", "Compliance, proximity to customers, service availability, and pricing."],
      ["What does highly available usually mean on the exam?", "Run across at least two Availability Zones."],
      ["Which services are global in these notes?", "IAM (Identity and Access Management), Route 53, CloudFront, and WAF (Web Application Firewall)."],
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
      ["When should an EC2 instance use access keys?", "Almost never. Use an IAM role, meaning an Identity and Access Management role, for AWS permissions."],
      ["What can IAM groups contain?", "IAM, or Identity and Access Management, groups contain users only. No nested groups."],
      ["Credential Report vs Access Advisor?", "Credential Report is account-wide credential status. Access Advisor is per-principal service usage for IAM identities."],
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
    short: "IPs, Elastic Network Interfaces, placement groups, hibernate",
    tags: ["Elastic IP", "ENI", "Placement"],
    focus: "Where instances land, how traffic reaches them, and how failover can follow network identities.",
    cards: [
      ["When does an EC2 public IP change?", "On stop/start. Use an Elastic IP if the public IPv4 must stay fixed."],
      ["Cluster vs Spread placement?", "Cluster is low-latency same-Availability-Zone/rack placement. Spread isolates critical instances on distinct hardware."],
      ["What is Partition placement for?", "Partition-aware big data systems like HDFS, Cassandra, Kafka, and HBase."],
      ["What is the ENI failover pattern?", "Move the Elastic Network Interface, including its private IP, from a failed instance to a standby in the same Availability Zone."],
      ["What does hibernate preserve?", "RAM state, written to encrypted root EBS (Elastic Block Store), for faster resume."]
    ]
  },
  {
    id: 5,
    title: "Storage",
    short: "Elastic Block Store, snapshots, machine images, instance store, Elastic File System",
    tags: ["EBS", "EFS", "AMI"],
    focus: "Choosing block, ephemeral, and shared file storage based on persistence, Availability Zone scope, and sharing.",
    cards: [
      ["How do you move EBS data across Availability Zones?", "Snapshot the Elastic Block Store volume, then restore it in the target Availability Zone."],
      ["What is the Golden AMI pattern?", "Pre-bake dependencies and configuration into an Amazon Machine Image once so scale-out instances boot quickly."],
      ["EBS vs EFS in one line?", "EBS (Elastic Block Store) is one-instance block storage in one Availability Zone. EFS (Elastic File System) is shared Linux NFS across Availability Zones."],
      ["How do you encrypt an existing unencrypted EBS volume?", "Snapshot the Elastic Block Store volume, copy the snapshot with encryption, create a volume from the encrypted copy, then attach it."],
      ["When should instance store be used?", "Temporary scratch, buffers, and caches where data loss is acceptable."]
    ]
  },
  {
    id: 6,
    title: "Load Balancing and Auto Scaling",
    short: "Load balancers, health checks, scaling",
    tags: ["Application LB", "Network LB", "Auto Scaling"],
    focus: "Distributing traffic, replacing unhealthy nodes, and scaling horizontally across Availability Zones.",
    cards: [
      ["ALB vs NLB?", "ALB means Application Load Balancer: Layer 7 routing for HTTP/S. NLB means Network Load Balancer: Layer 4 routing for static IP, TCP/UDP/TLS, and extreme performance."],
      ["Which load balancer handles third-party appliances?", "GWLB, or Gateway Load Balancer, handles third-party appliances using GENEVE on port 6081."],
      ["What header carries the real client IP behind ALB?", "X-Forwarded-For carries the real client IP behind an Application Load Balancer."],
      ["What is Target Tracking?", "A policy for an ASG, or Auto Scaling Group, that keeps a metric near a target, such as average CPU around 40 percent."],
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
      ["Multi-AZ vs Read Replica?", "Multi-AZ means multiple Availability Zones with synchronous standby for availability. Read Replicas are asynchronous read scaling."],
      ["Can you SSH into RDS?", "No, except with RDS Custom, the Relational Database Service option for Oracle and SQL Server host/database access."],
      ["What are Aurora writer and reader endpoints?", "Writer tracks the primary. Reader load balances connections across replicas."],
      ["When is RDS Proxy a strong answer?", "Lambda or app fleets opening too many database connections, or when IAM, meaning Identity and Access Management, authentication enforcement is required."],
      ["Redis vs Memcached?", "Redis supports HA, replicas, persistence, and advanced structures. Memcached is simple sharded non-persistent cache."]
    ]
  },
  {
    id: 8,
    title: "Route 53",
    short: "Domain Name System records, routing policies, health checks",
    tags: ["Alias", "TTL", "Failover"],
    focus: "DNS, or Domain Name System, answers questions; routing policies decide which answer is returned.",
    cards: [
      ["CNAME vs Alias at the zone apex?", "CNAME cannot be used at the apex. Alias can, but only to supported AWS targets."],
      ["Does DNS route packets?", "No. DNS, or Domain Name System, returns answers that clients then use."],
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
      ["What is the typical 3-tier AWS web architecture?", "Route 53 to public ELB (Elastic Load Balancing), then private ASG/EC2 (Auto Scaling Group and instances) across Availability Zones, then RDS and ElastiCache in data subnets."],
      ["Why does DNS alone fail as instance failover?", "DNS resolvers cache records until the TTL, or Time To Live, expires, so users can keep hitting dead IPs."],
      ["How do you make cart/session state survive horizontal scaling?", "Store only a session ID in the cookie and keep session data in ElastiCache or DynamoDB."],
      ["Why does WordPress need EFS when scaled horizontally?", "Uploads on per-instance EBS (Elastic Block Store) disappear depending on which instance serves the request; EFS (Elastic File System) gives the fleet shared files."],
      ["What does Elastic Beanstalk wrap?", "EC2, ASG (Auto Scaling Groups), ELB (Elastic Load Balancing), optional RDS, deployment, health, and scaling workflows."]
    ]
  },
  {
    id: 10,
    title: "Amazon S3 (Fundamentals)",
    short: "Buckets, objects, storage classes, durability vs availability",
    tags: ["Storage classes", "Durability", "Versioning"],
    focus: "Key to object store fundamentals: buckets, the security model, versioning, replication, and the cost, retrieval, and resilience tradeoffs across storage classes.",
    cards: [
      ["What's identical across every S3 storage class?", "Durability: 11 nines (99.999999999 percent) for all classes. Availability, cost, and retrieval speed are what differ."],
      ["What is the S3 object key, really?", "The full path: prefix plus object name. There are no real directories; the console just fakes folders from slash-separated keys."],
      ["What causes a 403 Forbidden on a static S3 website?", "The bucket policy doesn't allow public reads."],
      ["What's required on both sides for Cross-Region or Same-Region Replication?", "Versioning enabled on both the source and destination buckets. Replication itself is asynchronous."],
      ["Which storage class lives in only 1 AZ and is lost if that AZ dies?", "One Zone-IA, or Infrequent Access. Still 11 nines durability within that one Availability Zone, but gone if the AZ is destroyed."]
    ]
  },
  {
    id: 11,
    title: "S3 Advanced",
    short: "Lifecycle rules, event notifications, performance, Batch Operations, Storage Lens",
    tags: ["Lifecycle", "EventBridge", "Performance"],
    focus: "S3 as a machine: automatically moving data down the class waterfall, reacting to events, and squeezing performance out of prefixes and parallelism.",
    cards: [
      ["What are the two lifecycle rule action types?", "Transition actions move objects to a cheaper class after N days. Expiration actions delete after N days, including old versions and incomplete multi-part uploads."],
      ["What does S3 Storage Class Analysis recommend transitions for?", "Standard and Standard-IA only, not One Zone-IA or Glacier. It's the good first step before writing lifecycle rules."],
      ["What is the S3 request-rate limit to memorize?", "3,500 PUT, COPY, POST, DELETE and 5,500 GET, HEAD requests per second PER PREFIX, with no limit on the number of prefixes."],
      ["When should you reach for EventBridge instead of plain S3 Event Notifications?", "When you need advanced JSON-rule filtering, many destinations (18-plus), or archive and replay. Plain notifications only go to SNS, SQS, or Lambda."],
      ["What is the S3 Batch Operations pipeline for bulk processing existing objects?", "S3 Inventory produces the object list, Athena filters it, then Batch Operations processes it: encrypt unencrypted objects, copy, or restore from Glacier."]
    ]
  },
  {
    id: 12,
    title: "S3 Security",
    short: "Encryption methods, CORS, MFA Delete, Object Lock, Access Points",
    tags: ["Encryption", "Object Lock", "Access Points"],
    focus: "Four encryption methods answering who holds the key and where encryption happens, plus a toolbox of guardrails: WORM locks, MFA delete, pre-signed URLs, and access points.",
    cards: [
      ["SSE-S3 vs SSE-KMS vs SSE-C vs Client-Side, what's the one-line distinguisher?", "Who manages the key and where encryption happens: SSE-S3 uses AWS keys server-side (default). SSE-KMS uses your KMS keys server-side with CloudTrail audit. SSE-C uses your keys, encrypted server-side but never stored. Client-Side means you encrypt before upload."],
      ["What is the SSE-KMS trap at high request rates?", "Every upload calls GenerateDataKey and every download calls Decrypt, both counting against KMS API quotas (5,500, 10,000, or 30,000 requests per second by region), so hot buckets can throttle."],
      ["Compliance mode vs Governance mode in S3 Object Lock?", "Compliance mode: no one, not even root, can overwrite, delete, or shorten retention. Governance mode: privileged users with special permissions can."],
      ["What do pre-signed URLs inherit?", "The permissions of the user who generated them, for GET or PUT. CLI max expiration is about 168 hours (604,800 seconds)."],
      ["What is the 3-policy chain for a VPC-origin S3 Access Point?", "Endpoint policy, then access point policy, then bucket policy. All three must allow the request."]
    ]
  },
  {
    id: 13,
    title: "CloudFront & Global Accelerator",
    short: "Edge caching vs edge proxying, origins, geo-restriction, invalidations",
    tags: ["CDN", "Anycast", "Edge network"],
    focus: "Both ride AWS's edge network but do opposite jobs: CloudFront caches content at the edge; Global Accelerator proxies packets to your app over AWS's private backbone.",
    cards: [
      ["CloudFront vs Global Accelerator, one-line distinguisher?", "CloudFront CACHES content at the edge, a CDN for reads. Global Accelerator PROXIES packets from the edge to your app, no caching, using 2 anycast IPs."],
      ["How do you secure an S3 origin so only CloudFront can read it?", "Origin Access Control (OAC) plus a bucket policy restricting reads to CloudFront."],
      ["What's the CloudFront vs S3 Cross-Region Replication distinguisher?", "CloudFront: global edge network, cached for a TTL, for static content needed everywhere. S3 CRR: per-region setup, near-real-time, read-only, for dynamic content at low latency in a few regions."],
      ["How does CloudFront learn the origin changed?", "It doesn't, until the TTL expires, unless you force a cache invalidation on /* or a specific path."],
      ["What does Global Accelerator give you, and what problem does it solve?", "2 anycast IPs; traffic enters the nearest edge location then rides AWS's internal network to your app, solving the many-public-internet-hops latency problem, with health-check failover under 1 minute."]
    ]
  }
];

const additionalFlashcards = {
  1: [
    ["What is the difference between a Region and an AZ?", "A Region is a geographic AWS area; an AZ, or Availability Zone, is an isolated data center group inside that Region."],
    ["When should you choose multi-Region instead of only multi-AZ?", "Use multi-Region for disaster recovery beyond a Region, global latency needs, or strict geographic failover requirements. Multi-AZ only protects across Availability Zones inside one Region."],
    ["Why can AZ names differ between AWS accounts?", "AWS maps Availability Zone names like us-east-1a independently per account; use AZ IDs when consistent physical AZ identity matters."],
    ["Which global infrastructure choice most directly affects data residency?", "The AWS Region where the data is stored and processed."],
    ["What exam phrase points toward edge services?", "Global users need lower latency, content delivery, or acceleration close to users."],
    ["Why are most AWS architectures designed across at least two AZs?", "To remove a single Availability Zone failure as a single point of failure."],
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
    ["What is a Launch Template used for?", "It defines instance configuration for launches, including AMI (Amazon Machine Image), type, user data, storage, security groups, and IAM role."],
    ["Which pricing option is best for short, unpredictable, uninterrupted workloads?", "On-Demand Instances."],
    ["Which purchasing option is strongest for BYOL and physical host visibility?", "Dedicated Hosts."],
    ["What is the 2-minute Spot interruption notice used for?", "Graceful shutdown, checkpointing, or draining work before interruption."]
  ],
  4: [
    ["Why does AWS recommend avoiding Elastic IPs when possible?", "They often indicate brittle architecture; DNS and load balancers are usually better abstractions."],
    ["What is the best public entry point for private EC2 instances in a web tier?", "A public load balancer with EC2 instances in private subnets."],
    ["Which placement group strategy spreads across separate racks but supports hundreds of instances?", "Partition placement groups."],
    ["What can move with an ENI during failover?", "An Elastic Network Interface can carry private IPs, associated Elastic IP mappings, MAC address, and security group associations."],
    ["Can an ENI move across Availability Zones?", "No. Elastic Network Interfaces are bound to one Availability Zone."],
    ["What happens to instance store data when the underlying host fails?", "The data is lost."],
    ["What workload benefits from EC2 hibernate?", "A long-running or slow-starting workload that benefits from preserving RAM state."]
  ],
  5: [
    ["Which storage type is object storage?", "Amazon S3."],
    ["Which storage type is block storage?", "Amazon EBS, or Elastic Block Store."],
    ["Which storage type is managed shared file storage for Linux?", "Amazon EFS, or Elastic File System."],
    ["What is the main cost risk with EBS?", "With Elastic Block Store, you pay for provisioned capacity and performance whether the app uses all of it or not."],
    ["Which EBS type should you avoid for boot volumes?", "HDD-backed Elastic Block Store types st1 and sc1 cannot be boot volumes."],
    ["What does EFS lifecycle management do?", "Elastic File System lifecycle management moves files to lower-cost storage classes after configured periods without access."],
    ["When is EFS Max I/O performance mode appropriate?", "Elastic File System Max I/O performance mode fits highly parallel workloads that need more aggregate throughput and can tolerate higher latency."],
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
    ["What ASG metric is often better than CPU for web workloads behind an ALB?", "RequestCountPerTarget, which measures requests per target behind an Application Load Balancer."],
    ["What does an ASG do when an instance fails health checks?", "An Auto Scaling Group can terminate and replace the unhealthy instance."],
    ["What deployment speed pattern helps ASG scale-out become useful faster?", "Use a Golden AMI, or prebuilt Amazon Machine Image, so Auto Scaling Group instances boot with dependencies already installed."]
  ],
  7: [
    ["What is the key replication difference between Multi-AZ and Read Replicas?", "Multi-AZ is synchronous standby replication; Read Replicas are asynchronous."],
    ["What is the purpose of an Aurora reader endpoint?", "Connection-level load balancing across Aurora replicas."],
    ["When is Aurora Serverless a strong answer?", "Infrequent, intermittent, or unpredictable database workloads with no capacity planning."],
    ["What does Aurora Global Database optimize for?", "Low-latency global reads and cross-Region disaster recovery with fast promotion."],
    ["What is Aurora cloning best for?", "Creating fast, low-cost staging or test copies through copy-on-write."],
    ["Which service stores database credentials for RDS Proxy?", "AWS Secrets Manager stores credentials for RDS Proxy, the Relational Database Service connection-pooling proxy."],
    ["Why does ElastiCache require app changes?", "The application must implement cache reads, writes, invalidation, and fallback behavior."],
    ["Which ElastiCache engine supports Multi-AZ with auto failover?", "Redis supports Multi-AZ, meaning replicas across multiple Availability Zones with automatic failover."],
    ["Which ElastiCache engine is multi-threaded and sharded but not highly available by design?", "Memcached."],
    ["Which pattern makes the app tier stateless for login sessions?", "Store session data in ElastiCache or DynamoDB and keep only a session ID in the cookie."]
  ],
  8: [
    ["What does an Alias record cost in Route 53?", "Alias queries to AWS resources are free."],
    ["Who sets TTL for Alias records?", "AWS sets the TTL, or Time To Live, for the target; you do not configure it directly."],
    ["Which routing policy should you use for blue/green or canary DNS response splitting?", "Weighted routing."],
    ["Which routing policy chooses the lowest-latency AWS Region for the user?", "Latency-based routing."],
    ["Which routing policy should include a default record for unmatched users?", "Geolocation routing."],
    ["What percentage of Route 53 health checkers must report healthy?", "More than 18% of global health checkers."],
    ["What response codes are healthy for HTTP/HTTPS Route 53 endpoint checks?", "2xx and 3xx responses."],
    ["Why is Multi-Value routing not a load balancer replacement?", "It returns DNS answers only; it does not provide full load balancer health, routing, or connection behavior."]
  ],
  9: [
    ["What service provides loose coupling between producers and consumers?", "Amazon SQS (Simple Queue Service) for queues, or Amazon SNS/EventBridge for pub/sub and event routing patterns."],
    ["When is SQS better than direct synchronous calls?", "Amazon SQS, or Simple Queue Service, is better when components should buffer work and scale independently."],
    ["What is the classic fix for one slow synchronous workflow in a web app?", "Move the work to an asynchronous queue and process it with workers."],
    ["What Beanstalk tier scales based on queue depth?", "Worker Environment."],
    ["What is immutable infrastructure?", "Replacing instances or environments with newly built versions instead of patching them in place."],
    ["What is the pilot light DR strategy?", "Keep minimal core infrastructure running in another Region and scale it up during disaster."],
    ["What is warm standby DR?", "Keep a scaled-down functional environment running in another Region and scale it during failover."],
    ["What is active-active DR?", "Run production traffic in multiple locations at the same time."]
  ],
  10: [
    ["What changed about S3's max object size at re:Invent Dec 2025?", "Raised 10x from 5 TB to 50 TB. Older practice material may still say 5 TB."],
    ["At what upload size is multi-part upload required?", "Uploads over 5 GB MUST use multi-part upload."],
    ["What's the rule for accessing an S3 object across IAM and bucket policy?", "IAM permissions allow it, or the resource (bucket) policy allows it, and there is no explicit Deny."],
    ["What happens to objects that existed before versioning was enabled?", "They get version ID 'null'."],
    ["Does suspending versioning delete old versions?", "No. Suspending versioning does not delete previously created versions."],
    ["Which objects replicate under CRR or SRR after you turn it on?", "Only new objects. Use S3 Batch Replication to backfill existing or failed objects."],
    ["Do versioned deletes replicate?", "Delete markers can optionally replicate, but deletes with a specific version ID never do. That's the anti-malicious-delete protection."],
    ["Can replication chain from bucket 1 to 2 to 3?", "No. Replicating 1 to 2 and 2 to 3 does not give you 1 to 3."],
    ["How many tags can an S3 object carry?", "Up to 10, used for security and lifecycle rules."]
  ],
  11: [
    ["Who pays for what under Requester Pays?", "The requester pays the networking and download; the owner still pays storage. The requester must be authenticated, never anonymous."],
    ["What's the thumbnail lifecycle scenario?", "Source images go Standard to Glacier after 60 days. Thumbnails, being recreatable, go to One Zone-IA and expire after 60 days."],
    ["What's the 30-day / 48-hour delete-recovery scenario?", "Enable Versioning so deletes become delete markers, then transition noncurrent versions to Standard-IA and then Glacier Deep Archive, where 48-hour retrieval means Deep Archive Bulk."],
    ["What's the multi-part upload guidance?", "Recommended over 100 MB, required over 5 GB. It parallelizes uploads."],
    ["What does S3 Transfer Acceleration do?", "Uploads go to the nearest edge location, then ride AWS's private network to the target-region bucket. Compatible with multi-part upload."],
    ["What are Byte-Range Fetches used for?", "Parallelizing GETs by byte range for faster downloads, failure resilience, or fetching just the head of a file."],
    ["What's the free vs paid split for S3 Storage Lens?", "Free gives about 28 usage metrics and 14-day queries. Advanced adds activity, status-code, and cost and protection metrics, CloudWatch publishing, prefix-level aggregation, and 15-month retention."],
    ["How can you scope a lifecycle rule?", "By prefix, such as s3://bucket/mp3/*, or by object tags, such as Department: Finance."]
  ],
  12: [
    ["What does forcing TLS on a bucket policy do?", "Denies requests where aws:SecureTransport equals false, forcing HTTPS."],
    ["When are bucket policies evaluated relative to default encryption?", "Bucket policies are evaluated BEFORE default encryption, so a policy can require encryption headers on PUT even with SSE-S3 as the default."],
    ["What's the CORS trigger phrase?", "A static site on bucket A pulling assets from bucket B needs CORS headers on bucket B allowing bucket A's origin."],
    ["What does MFA Delete require, and who can enable or disable it?", "Requires Versioning enabled. Only the bucket owner, the root account, can enable or disable it."],
    ["When is MFA required vs not required under MFA Delete?", "Required for permanently deleting an object version and for suspending versioning. Not required for enabling versioning or listing deleted versions."],
    ["Where must S3 access logs be delivered, and what's the classic mistake?", "Into another bucket in the SAME region. Never point a logging bucket at itself, since that creates an infinite logging loop."],
    ["Glacier Vault Lock vs S3 Object Lock?", "Vault Lock: attach and lock a Vault Lock Policy that can never be changed or deleted, for compliance archives. Object Lock, which needs Versioning, blocks version deletion for a time via Compliance or Governance mode."],
    ["What is a Legal Hold, and how does it differ from a retention period?", "It's indefinite and independent of the retention period, toggled via the s3:PutObjectLegalHold permission."],
    ["What does S3 Object Lambda do?", "Transforms an object on retrieval, in-flight, on top of an access point: redacting PII, converting XML to JSON, or resizing and watermarking per caller."]
  ],
  13: [
    ["What are the three CloudFront origin types?", "An S3 bucket secured with OAC plus a bucket policy, a VPC Origin for a private ALB, NLB, or EC2 with no internet exposure, and a Custom HTTP origin such as an S3 website endpoint or any public HTTP backend."],
    ["What's the pre-VPC-origins pattern for a public ALB behind CloudFront?", "Make the ALB or EC2 public but restrict its security group to CloudFront's published edge IP ranges."],
    ["What is Geo Restriction used for?", "An allowlist or blocklist of countries resolved by a 3rd-party Geo-IP database. Classic use case: copyright licensing."],
    ["Unicast IP vs Anycast IP?", "Unicast is one server, one IP. Anycast means many endpoints share the same IP, and clients route to the nearest one."],
    ["Which AWS resources can Global Accelerator front?", "Elastic IP, EC2, ALB, and NLB, public or private."],
    ["What's Global Accelerator's client-cache advantage over DNS-based failover?", "No client-cache problems, since the 2 anycast IPs never change, unlike DNS records that resolvers cache until TTL expires."],
    ["When is Global Accelerator the answer over CloudFront?", "For non-HTTP TCP/UDP apps like gaming, IoT/MQTT, or VoIP, or for HTTP needing static IPs or deterministic fast regional failover."],
    ["What do CloudFront and Global Accelerator share?", "Both ride the AWS global edge network and both integrate with Shield for DDoS protection."]
  ]
};

sectionMeta.forEach((section) => {
  section.cards.push(...(additionalFlashcards[section.id] || []));
});
