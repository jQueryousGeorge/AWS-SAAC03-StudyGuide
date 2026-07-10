# AWS SAA-C03 — Sections 1–9 Master Summary
### Getting Started with AWS → Classic Solutions Architecture
*The exam psychology, the must-know terms, and the traps — nothing skipped, nothing padded.*

---

## Section 1 — Getting Started with AWS (Global Infrastructure)

**The mental model:** AWS is a hierarchy of blast radiuses. Region > Availability Zone (AZ) > Data Center. The exam constantly tests whether you know *what scope a resource lives at* — because that determines how you achieve high availability and how you move things around.

- **Region** = a cluster of data centers (e.g., `us-east-1`, `eu-west-3`). Most AWS services are **region-scoped**.
- **Choosing a Region — 4 factors (know all 4):**
  1. **Compliance / data governance** — data never leaves a region without your explicit permission. (If a question mentions legal/regulatory data residency, this factor wins.)
  2. **Proximity to customers** — reduced latency.
  3. **Available services** — new services/features don't launch in every region.
  4. **Pricing** — varies region to region.
- **Availability Zone (AZ)** = one or more discrete data centers with redundant power, networking, connectivity. Usually 3 per region (min 3, max 6). Isolated from each other's disasters, but connected with **high-bandwidth, ultra-low-latency networking**. Named like `ap-southeast-2a`.
- **Edge Locations / Points of Presence** = 400+ locations in 90+ cities. Not for running compute — for **delivering content close to users** (CloudFront, Global Accelerator).
- **Global services** (not region-scoped): **IAM (Identity and Access Management), Route 53, CloudFront, WAF (Web Application Firewall)**. Everything else you should assume is regional (EC2, Beanstalk, Lambda, Rekognition...).

> **Why it matters:** "Highly available" on the exam almost always means **multi-AZ**. "Disaster recovery / lowest latency for global users" means **multi-Region** or **edge**.

---

## Section 2 — IAM (Identity & Access Management)

**The mental model:** IAM answers one question — *who can do what, on which resource, under which conditions.* It's a **global** service.

- **Root account** — created by default. Don't use it, don't share it. Only for account setup.
- **Users** = physical people (one physical user = one IAM user). **Groups** contain **users only — no nested groups**. Users can belong to zero or multiple groups.
- **Policies** = JSON documents defining permissions. Apply **least privilege**.
- **Policy structure (memorize the anatomy):**
  - `Version` ("2012-10-17" — always), `Id` (optional), `Statement` (required)
  - Each Statement: `Sid` (optional), `Effect` (Allow/Deny), `Principal` (who it applies to), `Action` (what), `Resource` (on what), `Condition` (when — optional)
- **Roles** = identities assumed by **AWS services** (or users/other accounts) to act on your behalf. Common: **EC2 Instance Roles, Lambda Function Roles, CloudFormation Roles**.
  > **Trap:** anything running *on* AWS that needs AWS permissions gets a **Role**, never hardcoded access keys. "EC2 needs to read S3" → instance role. Always.
- **Three ways to access AWS:**
  1. **Management Console** — password + MFA
  2. **CLI** — access keys
  3. **SDK** (programmatic, in your code) — access keys
  - Access Key ID ≈ username, Secret Access Key ≈ password. Never share.
- **MFA options:** Virtual MFA device (Google Authenticator, Authy — multiple tokens per device), **U2F security key** (YubiKey — multiple users per key), hardware key fobs (incl. GovCloud variant).
- **Password policy:** min length, character requirements, allow self-change, expiration, prevent reuse.
- **Audit tools (know which is which):**
  - **IAM Credentials Report** = **account-level** — all users + status of their credentials.
  - **IAM Access Advisor** = **user-level** — which service permissions a user has and when last used → use it to trim permissions (least privilege in practice).

---

## Section 3 — Amazon EC2 (Basics)

**The mental model:** EC2 = IaaS = the LEGO baseline of AWS: rent virtual machines (EC2) + virtual drives (EBS, Elastic Block Store) + load distribution (ELB, Elastic Load Balancing) + auto scaling (ASG, Auto Scaling Groups). Everything in Section 9 is built from these four.

### Configuration & bootstrapping
- You choose: OS (Linux/Windows/macOS), CPU, RAM, storage (**network-attached**: EBS & EFS / **hardware**: Instance Store), network card speed, public IP, firewall rules (**security group**), bootstrap script (**EC2 User Data**).
- **EC2 User Data:** runs **once, at first start only**, as the **root** user. Used to automate boot tasks (updates, software installs, downloads). Dynamic setup = User Data; pre-baked setup = AMI (see Section 5 — and the Golden AMI pattern in Section 9).

### Instance types — naming & families
- `m5.2xlarge` → **m** = instance class, **5** = generation, **2xlarge** = size.
- **General Purpose (t, m)** — balanced compute/memory/network. Web servers, code repos.
- **Compute Optimized (c)** — batch processing, media transcoding, HPC, scientific modeling/ML, dedicated gaming servers.
- **Memory Optimized (r, x, z)** — in-memory datasets: high-perf databases, distributed web caches, in-memory BI, real-time big data.
- **Storage Optimized (i, d, h)** — high sequential read/write to **local** storage: high-frequency OLTP, relational & NoSQL DBs, Redis-style cache backing, data warehousing, distributed file systems.

### Security Groups — the #1 practical topic
- A **stateful firewall living outside the instance** — blocked traffic never reaches the EC2. Contain **allow rules only** (implicit deny for everything else inbound).
- **Defaults: all inbound BLOCKED, all outbound ALLOWED.** Stateful = return traffic is automatically allowed both ways.
- Locked to a **region/VPC combination**. One SG (security group) can attach to many instances; one instance can have many SGs.
- **Rules can reference other security groups** — not just IPs. This is how tiers talk to each other cleanly (load balancer SG → EC2 SG → database SG). Huge in Section 9.
- **Troubleshooting heuristics (exam loves these):**
  - Connection **timeout** → security group issue.
  - **Connection refused** → app error / app not running (traffic got through).
- Best practice: keep a separate SG just for SSH.
- **Classic ports:** 22 = SSH, 21 = FTP, 22 = SFTP (FTP over SSH), 80 = HTTP, 443 = HTTPS, 3389 = RDP (Windows).

### Purchasing options — the cost-optimization decision tree
| Option | Discount | Commit | Use when |
|---|---|---|---|
| **On-Demand** | none (highest cost) | none | short-term, **unpredictable, uninterrupted** workloads. Per-second billing (Linux/Windows, after 1st min); per-hour otherwise |
| **Reserved Instances** | up to ~72% | 1yr / 3yr to a **specific instance type + region + tenancy + OS** | **steady-state** apps (databases). Regional or Zonal scope (zonal also reserves AZ capacity). Buy/sell on RI Marketplace |
| **Convertible RI** | up to ~66% | 1/3yr, but can change type/family/OS/scope/tenancy | steady-state with flexibility needs |
| **Savings Plans** | up to ~72% | commit to **$/hour of usage** for 1/3yr | locked to instance **family + region**; flexible across size, OS, tenancy. Beyond commitment → On-Demand rates |
| **Spot** | up to ~90% | none — can be reclaimed | **fault-tolerant** work: batch, data analysis, image processing, distributed/flexible-time jobs. **NEVER critical jobs or databases** |
| **Dedicated Hosts** | most expensive | on-demand or reserved | **physical server** for you: compliance + **BYOL** (per-socket/per-core licenses). You control instance placement |
| **Dedicated Instances** | — | — | hardware dedicated to you, but may share with instances from *your own* account; **no placement control** |
| **Capacity Reservations** | **no discount** | none (create/cancel anytime) | guarantee capacity in a **specific AZ**; billed On-Demand whether you run instances or not. Combine with Regional RIs/Savings Plans for discounts |

- **Hotel analogy:** On-Demand = pay full price whenever; Reserved = book long-term for a discount; Savings Plan = pay $X/hr, any room type; Spot = bid on empty rooms, can be kicked out; Dedicated Host = book the whole building; Capacity Reservation = pay for the room even if you don't sleep in it.
- **Key distinction (your annotation nailed it):** RI = commit to an *instance type*; Savings Plan = commit to an *amount of usage ($/hr)*. And "reserved capacity" ≠ a physical machine held for you — it's the *right* to run at a discount (regional RIs) — unless it's zonal/Capacity Reservation, which *does* hold AZ capacity.

### Spot deep-dive
- You set a **max price**; you keep instances while current spot price < your max. If spot price exceeds it: **2-minute grace period** to stop or terminate.
- **Spot Request termination trap:** cancelling a Spot Request does **not** terminate instances. Order matters: **(1) cancel the Spot Request first** (open/active/disabled states only), **(2) then terminate the instances** — otherwise a persistent request just relaunches them (never-ending loop).
- **Spot Fleets** = Spot + (optional) On-Demand, meeting a target capacity under price constraints across multiple launch pools. Allocation strategies:
  - `lowestPrice` — cheapest pool (short jobs, pure cost)
  - `diversified` — spread across pools (availability, long workloads)
  - `capacityOptimized` — pool with optimal capacity
  - `priceCapacityOptimized` — **(recommended)** highest capacity pools, then cheapest = best default

---

## Section 4 — EC2 Associate (Networking & Placement)

### IPs
- **Public IP**: internet-identifiable, unique across the web, geo-locatable. **Private IP**: unique only within its network; two companies can reuse the same ranges; reaches the internet via **NAT + Internet Gateway**.
- Default EC2: one private IP (internal AWS network) + one public IP. **You SSH via the public IP** (you're not inside the VPC).
- **Public IP changes when you stop/start an instance.** Need it fixed? → **Elastic IP**.
- **Elastic IP:** a public IPv4 you own until you release it; attaches to one instance at a time; **5 per account** (soft limit). Use case: **mask instance failure by remapping the IP to a standby instance**. But AWS's own advice: **avoid EIPs** — they signal poor architecture. Prefer random public IP + DNS name, or better, a Load Balancer with no public IP on instances.

### Placement Groups — control *where* instances land
| Strategy | Layout | Pro | Con | Use case |
|---|---|---|---|---|
| **Cluster** | same rack/AZ | 10 Gbps low-latency network (with Enhanced Networking) | AZ fails → everything fails | Big Data jobs that must finish fast; HPC; extreme network throughput |
| **Spread** | each instance on distinct hardware, can span AZs | max isolation from hardware failure | **limit: 7 instances per AZ per group** | small sets of critical instances that must fail independently |
| **Partition** | groups of instances in partitions; **each partition = separate racks** | up to **7 partitions/AZ**, spans AZs, **100s of instances**; partition failure doesn't cross partitions; partition info exposed via instance metadata | — | **partition-aware** big data: HDFS, HBase, Cassandra, Kafka |

> **Exam psychology:** "lowest latency between instances" → Cluster. "Maximize availability, critical instances isolated" → Spread. "Hadoop/Cassandra/Kafka" → Partition. Memorize the trigger words.

### ENI — Elastic Network Interface
- A logical **virtual network card** in a VPC. Attributes: primary private IPv4 (+ secondaries), one Elastic IP per private IPv4, one public IPv4, security groups, MAC address.
- Created independently, attached/detached **on the fly** → **failover pattern:** move the ENI (with its private IP) from a failed instance to a standby, and traffic follows.
- **Bound to an Availability Zone (AZ).** Free while unattached.

### EC2 Hibernate
- Stop = EBS data kept. Terminate = root EBS (by default) destroyed. Normal starts still pay OS-boot + app warm-up time.
- **Hibernate = RAM state written to the root EBS volume → much faster boot** (OS never fully stops).
- Requirements/limits: **root volume must be EBS and encrypted** (not instance store), RAM **< 150 GB**, no bare metal, works On-Demand/Reserved/Spot, **max 60 days** hibernated.
- Use cases: long-running processes, slow-initializing services, preserving RAM state.

---

## Section 5 — EC2 Instance Storage (EBS, AMI, Instance Store, EFS)

**The mental model:** three storage personalities. **EBS (Elastic Block Store)** = one instance's private network drive (Availability-Zone-locked). **Instance Store** = raw speed, dies with the hardware. **EFS (Elastic File System)** = one shared filesystem for hundreds of Linux instances across Availability Zones. The exam gives you a workload and expects you to pick the personality.

### EBS — Elastic Block Store
- **Network drive** ("network USB stick") → slight latency, but detach/reattach quickly. Persists after instance termination (configurable).
- **Locked to one AZ.** To move across AZs/regions: **snapshot → copy → restore.** (Non-negotiable exam fact.)
- One instance at a time (except Multi-Attach). Provisioned capacity (GB + IOPS) — **you pay for what you provision**, and can grow it over time.
- **Delete on Termination:** root volume **deleted by default**; non-root volumes **kept by default**. Flip the attribute to preserve a root volume past termination (classic Auto Scaling Group scale-in data-preservation question).

### EBS Snapshots
- Point-in-time backup; detaching first is recommended but not required. Copy across AZ **and** Region.
- **Snapshot Archive** — 75% cheaper tier, but restore takes **24–72 hours**.
- **Recycle Bin for snapshots** — retention rules (1 day–1 year) to recover accidental deletions.
- **Fast Snapshot Restore (FSR)** — pre-initializes the snapshot so first use has zero latency. **Expensive.** Good for very large volumes.

### AMI — Amazon Machine Image
- A **customization of an EC2 instance**: your OS + software + config pre-baked → **fast boot** because nothing needs installing at launch.
- **Built per-region** (copyable across regions). Sources: AWS public AMIs, your own, AWS Marketplace.
- Build process: launch & customize instance → **stop it** (data integrity) → build AMI (creates EBS snapshots underneath) → launch new instances from it.
- **Golden AMI** (quiz favorite — twice!): pre-install all dependencies/software so scale-out launches are near-instant. Answer to both "Beanstalk deployments are slow because dependencies resolve on every instance" and "ERP takes an hour to install — how to speed up scale-out?" The runner-up answers (EFS-hosted files, User Data bootstrap) still do the work *at every boot* — Golden AMI does it **once, at bake time**.

### EC2 Instance Store
- **Physically attached** disk = the best I/O (very high IOPS). **Ephemeral**: data gone on stop/termination; lost if hardware fails.
- Only for: **buffer, cache, scratch, temporary content.** Backups/replication = your problem.

### EBS Volume Types (6 — defined by Size | Throughput | IOPS)
**Only gp2/gp3 and io1/io2 Block Express can be boot volumes. HDD (st1/sc1) cannot boot.**

| Type | Class | Sweet spot | Key numbers |
|---|---|---|---|
| **gp3** | SSD, general purpose | most workloads; boot, virtual desktops, dev/test | baseline **3,000 IOPS / 125 MiB/s**; scale **IOPS (→16,000) and throughput (→1,000 MiB/s) independently** |
| **gp2** | SSD, general purpose (legacy) | same | **IOPS linked to size: 3 IOPS/GiB**, max 16,000 (hit at 5,334 GiB); small volumes burst to 3,000 |
| **io1** | SSD, Provisioned IOPS | databases; >16,000 IOPS; sustained IOPS-sensitive apps | 4 GiB–16 TiB; max **64,000 IOPS (Nitro)** / 32,000 (other); IOPS independent of size |
| **io2 Block Express** | SSD, PIOPS | mission-critical, sub-ms latency | 4 GiB–**64 TiB**; up to **256,000 IOPS** (1,000 IOPS : 1 GiB ratio) |
| **st1** | HDD, throughput-optimized | **frequently accessed**, throughput-heavy: Big Data, data warehouses, log processing | max 500 MiB/s, 500 IOPS |
| **sc1** | HDD, cold | **infrequently accessed**, lowest cost | max 250 MiB/s, 250 IOPS |

> gp3 vs gp2 in one line: **gp3 decouples IOPS/throughput from size; gp2 chains them together.** And the infrequent-access HDD is **sc1** (there is no "st2").

### EBS Multi-Attach (io1/io2 only)
- Same volume attached to **up to 16 instances in the same AZ**, each with full read/write.
- Application must handle concurrent writes; file system must be **cluster-aware** (not XFS/EXT4). Use case: clustered Linux apps needing higher availability (e.g., Teradata).

### EBS Encryption
- Encrypted volume ⇒ data at rest + data in flight (instance↔volume) + all snapshots + all volumes created from those snapshots. Transparent, minimal latency impact. Keys from **KMS (AES-256)**.
- **Encrypting an unencrypted volume — the 4-step dance:** snapshot volume → **copy the snapshot with encryption enabled** → create new (now encrypted) volume from it → attach to the instance. (Copying an unencrypted snapshot is *the* moment you can add encryption.)

### EFS — Elastic File System
- **Managed NFS (NFSv4.1)** mountable on **100s of EC2 instances across multiple AZs simultaneously** — the "shared storage, dynamically loaded, no heavy ops" quiz answer.
- **Linux only (POSIX API). No Windows.** Access controlled by **security group**. KMS encryption at rest.
- **Scales automatically to petabytes, pay-per-use, zero capacity planning** — the anti-EBS: no provisioning, but ~**3× gp2 price**.
- **Performance Mode** (set at creation): **General Purpose** (default — latency-sensitive: web servers, CMS) vs **Max I/O** (higher latency, more throughput, highly parallel — big data, media processing).
- **Throughput Mode:** **Bursting** (scales with size: 1 TB = 50 MiB/s + bursts to 100), **Provisioned** (set throughput regardless of size), **Elastic** (auto up/down — up to 3 GiB/s read / 1 GiB/s write — for unpredictable workloads).
- **Storage classes + lifecycle policies** (move files after N days without access): **Standard** (frequent), **Infrequent Access (EFS-IA)** (cheaper storage, retrieval cost), **Archive** (rarely accessed, ~50% cheaper again). Up to 90%+ savings.
- **Availability:** Standard = multi-AZ (prod). **One Zone** = single AZ (dev; pairs with IA as One Zone-IA).

### The decision matrix (burn this in)
- **EBS** → one instance (io1/io2 Multi-Attach is the only exception), one AZ, block storage, provision it.
- **EFS** → many Linux instances, many AZs, shared POSIX filesystem, auto-scales, pricier.
- **Instance Store** → speed demons and scratch space, ephemeral.
- Quiz corollary: **RDS is for relational data, not big binary files** — never the answer for storing files/updates/software.

---

## Section 6 — High Availability & Scalability (Elastic Load Balancing + Auto Scaling Groups)

### Vocabulary first (the exam tests the distinctions)
- **Vertical scaling** = bigger instance (scale up/down). Common for non-distributed systems — databases. RDS/ElastiCache scale vertically. Hardware-limited.
- **Horizontal scaling (= elasticity)** = more instances (scale out/in). Implies distributed systems. ASG (Auto Scaling Groups) + ELB (Elastic Load Balancing).
- **High Availability** = surviving a data-center or Availability Zone (AZ) loss → run across **≥ 2 AZs**. Can be **passive** (RDS Multi-AZ standby waits) or **active** (all nodes serving, horizontal scaling).

### Why a load balancer at all
Single DNS point of access • spreads load • health checks + seamless failure handling • **SSL termination** • sticky sessions • cross-AZ high availability • separates public from private traffic. ELB means **Elastic Load Balancing**: it is managed by AWS (AWS handles upgrades/high availability; fewer knobs, less effort than DIY) and integrates with EC2, Auto Scaling Groups, ECS, ACM, CloudWatch, Route 53, WAF, and Global Accelerator.

**Health checks:** on a port + route (`/health`); non-200 = unhealthy. Defined **at the target-group level**.

### The four load balancers
| LB | Layer | Protocols | Its "thing" |
|---|---|---|---|
| **CLB — Classic Load Balancer** (2009, v1, legacy) | 4 & 7 | HTTP/HTTPS/TCP/SSL | one SSL cert only; fixed hostname; avoid for new designs |
| **ALB — Application Load Balancer** (2016, v2) | **7** | HTTP/HTTPS/**WebSocket**, HTTP/2 | **routing rules**: URL path, hostname, query string, headers; HTTP→HTTPS redirects; **containers/microservices** (dynamic port mapping with ECS); one ALB replaces many CLBs |
| **NLB — Network Load Balancer** (2017, v2) | **4** | TCP/UDP/TLS | **millions of req/s, ultra-low latency**; **one static IP per Availability Zone + Elastic IP support** (the "clients must whitelist an IP" answer) |
| **GWLB — Gateway Load Balancer** (2020) | **3** (IP) | GENEVE, **port 6081** | routes traffic *through* 3rd-party **network appliances** (firewalls, IDS/IPS, deep packet inspection): transparent gateway + load balancer in one |

- **ALB target groups:** EC2 instances, ECS tasks, **Lambda functions** (HTTP → JSON event), **private IPs**. Application Load Balancers route to multiple target groups.
- **NLB target groups:** EC2, private IPs, **and an ALB** (Network Load Balancer in front of an Application Load Balancer = static IP + Layer 7 rules). NLB health checks support TCP/HTTP/HTTPS.
- **GWLB target groups:** EC2 and private IPs. Gateway Load Balancers are for routing through inspection appliances, not ordinary web routing.
- **ALB gotchas:** fixed hostname (`XXX.region.elb.amazonaws.com`) but **no static IP**; backends see the Application Load Balancer's private IP — the client's true IP arrives in **`X-Forwarded-For`** (+ `X-Forwarded-Port` / `-Proto`).

### Sticky Sessions (Session Affinity)
- Same client → same backend instance. Works on Classic Load Balancer, Application Load Balancer, and Network Load Balancer. Use case: don't lose session data. Cost: **load imbalance**.
- Cookie types (ALB): **application-based** — custom (generated by target, any attributes; name per target group; can't use reserved names `AWSALB`, `AWSALBAPP`, `AWSALBTG`) or application cookie (generated by LB, `AWSALBAPP`); **duration-based** — generated by LB (`AWSALB` on ALB, `AWSELB` on CLB), expiry you control.

### Cross-Zone Load Balancing (distributes evenly across ALL instances in ALL AZs, not just the node's own AZ)
- **ALB (Application Load Balancer): ON by default**, free inter-AZ. (Can disable per target group.)
- **NLB (Network Load Balancer) & GWLB (Gateway Load Balancer): OFF by default, $ for inter-AZ** if enabled.
- **CLB (Classic Load Balancer): OFF by default**, free if enabled.

### SSL/TLS
- Cert on the LB = in-flight encryption; LB **terminates TLS** (decrypts) and talks plain HTTP to backends over the private VPC. Certs = X.509, managed via **ACM** (or upload your own). HTTPS listener needs a default cert; add more for multiple domains.
- **SNI (Server Name Indication):** client names the target hostname in the TLS handshake → server picks the right cert → **multiple certs on one listener**. Works on **Application Load Balancer, Network Load Balancer, and CloudFront. NOT Classic Load Balancer** (CLB = one cert; need multiple certs → multiple CLBs).
- Security policies exist to support legacy SSL/TLS clients.

### Connection Draining / Deregistration Delay
- Classic Load Balancer calls it Connection Draining; Application Load Balancer and Network Load Balancer call it **Deregistration Delay**. In-flight requests get time to finish while an instance deregisters; no new requests sent to it. **1–3600s, default 300, 0 = off.** Short requests → set it low.

### Auto Scaling Groups
- Goal: scale **out** on load up, **in** on load down; keep between **min / desired / max**; auto-register instances to the load balancer; **replace unhealthy instances** (Elastic Load Balancing health checks can drive this). **ASG, or Auto Scaling Group, itself is free** — you pay for the instances.
- **Launch Template** (Launch Configurations are deprecated): AMI (Amazon Machine Image) + instance type, User Data, EBS (Elastic Block Store), security groups, key pair, IAM role, network/subnets, load balancer info.
- Instances commonly flunk health checks for two reasons: security group misconfig, or a broken User Data bootstrap.
- **Scaling policies:**
  - **Target Tracking** — "keep average CPU ≈ 40%" — simplest; auto-creates the CloudWatch alarms.
  - **Simple / Step** — on CloudWatch alarm (CPU > 70% → +2; CPU < 30% → −1). Simple scaling has cooldowns between actions.
  - **Scheduled** — known patterns ("min 10 at 5pm Friday").
  - **Predictive** — ML forecast, scales ahead of the load.
- **Good scaling metrics:** `CPUUtilization`, `RequestCountPerTarget` (requests per instance stays stable), Average Network In/Out (network-bound apps), any custom CloudWatch metric.
- **Cooldown:** after a scaling action, **default 300s** where the Auto Scaling Group won't launch/terminate (let metrics settle). Pro move: **use a ready-to-go Golden AMI (Amazon Machine Image)** → instances serve faster → shorter effective cooldowns.

---

## Section 7 — RDS, Aurora & ElastiCache

**The mental model:** RDS means Relational Database Service: a managed relational engine. Aurora = AWS's cloud-native rebuild of MySQL/Postgres with storage magic. ElastiCache = the in-memory layer that keeps both alive under read pressure and makes apps stateless. The exam's favorite axis: **Multi-AZ = availability / disaster recovery** vs **Read Replicas = performance (read scaling)**. Never confuse them.

### RDS core
- Managed SQL databases: **Postgres, MySQL, MariaDB, Oracle, Microsoft SQL Server, IBM DB2, Aurora** (these are the *engines*).
- Managed = automated provisioning, OS patching, continuous backups + **Point-in-Time Restore**, monitoring dashboards, read replicas, Multi-AZ, maintenance windows, vertical & horizontal scaling. Storage on EBS, or Elastic Block Store.
- **You cannot SSH into RDS** (no access to the underlying host) — except **RDS Custom**.
- **Storage Auto Scaling:** set a **Maximum Storage Threshold**; RDS grows storage automatically when free space **< 10%** for **≥ 5 min** and **≥ 6 h** since last modification. All engines. Great for unpredictable workloads.

### Read Replicas (performance)
- **Up to 15.** Within-AZ, cross-AZ, or cross-Region. Replication is **ASYNC → eventually consistent reads**.
- Serve **SELECT only**. Applications must **update their connection string** to use them (or you architect around endpoints — Aurora fixes this).
- A replica can be **promoted** to a standalone DB.
- Classic use case: run the **reporting/analytics** workload on a replica so production is untouched.
- **Network cost:** same-region cross-AZ replication traffic = **free**; cross-region = **$$$**.
- Read Replicas **can themselves be set up as Multi-AZ** (yes, that's legal, and yes, it's an exam question).

### Multi-AZ (disaster recovery)
- **SYNC replication** to a standby in another AZ. **One DNS name** — automatic failover, zero app intervention. Covers AZ loss, network loss, instance or storage failure.
- **Not for scaling** — the standby serves no traffic (passive HA).
- **Single-AZ → Multi-AZ is a zero-downtime click** ("modify"): internally, snapshot → restore into new AZ → sync established.

### RDS Custom (Oracle & SQL Server only)
- Full admin: OS + database access (SSH / SSM Session Manager), configure settings, install patches, native features. Trade: **you** own OS/DB patching now.
- **De-activate Automation Mode** before customizing; snapshot first. RDS vs RDS Custom = "AWS manages everything" vs "you get the keys".

### Aurora
- AWS-proprietary, **drop-in compatible with Postgres & MySQL** (same drivers). ~**5× MySQL / 3× Postgres** performance, ~20% cost premium over RDS.
- **Storage:** auto-grows in **10 GB increments up to 256 TB**, striped across 100s of volumes.
- **The 6/3 rule: 6 copies of data across 3 AZs** — **4/6 needed for writes, 3/6 for reads**, self-healing with peer-to-peer replication.
- **One writer (master) + up to 15 replicas**; replica lag **sub-10 ms**; **failover < 30 s** (a replica is promoted) — HA-native.
- **Endpoints (must-know):** **Writer Endpoint** → always points at the master. **Reader Endpoint** → **connection-level load balancing** across replicas. **Custom Endpoints** → target a defined subset (e.g., beefy `db.r5.2xlarge` replicas for analytics; once you define custom endpoints, the reader endpoint typically goes unused).
- **Replica Auto Scaling:** scale replica count on CPU utilization.
- **Aurora Serverless:** on-demand, auto-scaling instantiation via a managed proxy fleet — **infrequent / intermittent / unpredictable** workloads, no capacity planning, pay per second.
- **Global Aurora:** 1 primary region (R/W) + **up to 10 secondary read-only regions**; **replication lag < 1 s**; up to 16 replicas per secondary; cross-region promotion **RTO < 1 minute**. (Cross-region read replicas exist too, but Global Database is the recommended answer.)
- **Aurora ML:** SQL-invoked predictions via **SageMaker** (any model) & **Comprehend** (sentiment) — fraud detection, ads, recommendations, no ML expertise needed.
- **Babelfish for Aurora PostgreSQL:** understands **T-SQL** so **MS SQL Server apps run against Aurora Postgres** with little/no code change (same SQL Server client driver); migrate with AWS SCT + DMS.
- **Aurora Cloning:** new cluster from existing via **copy-on-write** — near-instant, cheap, the "staging copy of production without touching production" answer. Faster than snapshot & restore.
- **Backtrack:** rewind the cluster to any point in time **without restoring from backups**.

### Backups & restores
- **RDS automated backups:** daily full backup (backup window) + **transaction logs every 5 min** → **restore to any point in time** (oldest backup → 5 min ago). Retention **1–35 days; 0 disables**.
- **Aurora automated backups:** 1–35 days, **cannot be disabled**; PITR within the window.
- **Manual DB snapshots** (both): user-triggered, **kept as long as you want**.
- **Cost trick:** a **stopped** RDS instance still bills storage. Stopping long-term? **Snapshot → delete → restore later.**
- **Restore from S3:** RDS MySQL ← plain backup file in S3. Aurora MySQL ← backup made with **Percona XtraBackup**, staged in S3, restored into a new cluster.

### RDS & Aurora security
- **At-rest:** KMS encryption — must be set **at launch time**. **Unencrypted master ⇒ replicas can't be encrypted.** To encrypt an existing DB: **snapshot → copy-restore as encrypted** (same dance as EBS).
- **In-flight:** TLS-ready by default (use AWS TLS root certs client-side).
- **IAM Authentication** (connect with roles instead of passwords), **Security Groups** for network control, **audit logs → CloudWatch Logs** for retention. No SSH (except Custom).

### RDS Proxy
- Fully managed proxy that **pools & shares DB connections** → less CPU/RAM stress, fewer open connections/timeouts. Serverless, auto-scaling, multi-AZ.
- **Reduces failover time by up to 66%.** Supports RDS (MySQL, Postgres, MariaDB, SQL Server) + Aurora (MySQL, Postgres). No app code changes.
- **Enforces IAM auth**; credentials in **Secrets Manager**. **Never publicly accessible** (VPC-only).
- **Trigger words:** "Lambda functions opening too many DB connections" or "must enforce IAM auth to the DB" → RDS Proxy.

### ElastiCache
- Managed **Redis / Memcached** (those are the *engine types*): in-memory, sub-ms reads. Two jobs: **(1) offload read-heavy RDS traffic, (2) externalize session state → stateless app tier**.
- Unlike Elastic Load Balancing and RDS (Relational Database Service) drop-ins, ElastiCache requires **heavy application code changes** (your app must implement the caching logic).
- **DB-cache pattern:** app checks cache → hit = serve; miss = read RDS, write to cache. Needs a **cache invalidation strategy** (the hard part — "only two hard things in CS...").
- **Session-store pattern:** login writes session to ElastiCache; any instance retrieves it → user stays logged in across instances.
- **Redis vs Memcached (know cold):**
  - **Redis** = HA: **Multi-AZ with auto-failover, read replicas**, **AOF persistence (durability)**, backup & restore, **Sets & Sorted Sets**. Think: replication.
  - **Memcached** = raw distributed cache: **sharding (multi-node partitioning), multi-threaded**, **no replication/HA, non-persistent** (backup/restore only on Serverless). Think: sharding.
- **Security:** Redis supports **IAM authentication**; **Redis AUTH** (password/token at cluster creation, on top of SGs) + in-flight SSL. Memcached: **SASL** auth. IAM policies on ElastiCache = AWS API-level security only.
- **Caching patterns:** **Lazy Loading** (cache on read; stale data possible), **Write Through** (cache on write; no stale data), **Session Store** (TTL-based).
- **Redis Sorted Sets** = uniqueness + ordering in real time → the **gaming leaderboard** answer.

---

## Section 8 — Amazon Route 53

**The mental model:** DNS, or Domain Name System, doesn't route packets — it **answers questions**. Every "routing policy" is just a rule for *which answer to give*. Health checks decide *which answers are allowed*.

### DNS fundamentals
- DNS = Domain Name System: hostname → IP, hierarchical. **Terminology:** Domain Registrar (Route 53, GoDaddy...), DNS Records, **Zone File** (holds the records), **Name Server** (answers queries — authoritative or not), **TLD** (Top-Level Domain, such as .com/.org), **SLD** (Second-Level Domain, such as amazon.com). FQDN means Fully Qualified Domain Name, such as `api.www.example.com.` (protocol → subdomain → SLD → TLD → root).
- **Resolution walk:** browser → local/ISP resolver → **Root servers** (ICANN) → **TLD servers** (IANA) hand back the domain's NS records → **SLD/authoritative name server** (your registrar/Route 53) returns the record → resolver **caches it for the TTL**.
- Registrar vs Registry (from your annotation — worth keeping): the registrar (GoDaddy) just files your NS records with the registry (e.g., Verisign for .com). The registrar never answers DNS queries; resolvers go registry → your name servers directly.

### Route 53 itself
- Highly available, scalable, fully managed, **authoritative** DNS (authoritative = *you* can update the records). Also a **domain registrar**. Can health-check resources. **The only AWS service with a 100% availability SLA.** Named after DNS port 53.

### Records & Hosted Zones
- A record = **name + type + value + routing policy + TTL**. TTL means **Time To Live**, or how long resolvers cache the answer.
- **Must-know types: A** (hostname→IPv4), **AAAA** (→IPv6), **CNAME** (hostname→hostname; target needs an A/AAAA), **NS** (name servers for the zone — control how traffic is routed for the domain). Advanced (recognize): CAA, DS, MX, NAPTR, PTR, SOA, TXT, SPF, SRV.
- **Hosted Zone** = container of records for a domain + subdomains. **Public** (internet) vs **Private** (resolve inside your VPCs — `app.company.internal`). **$0.50/month per zone** (Route 53 isn't free).
- **TTL (Time To Live):** high (24 h) = less Route 53 traffic + $ savings, but stale records linger; low (60 s) = fresh + easy changes, more queries $. **TTL is mandatory on every record type EXCEPT Alias.**

### CNAME vs Alias — the guaranteed exam question
- **CNAME:** any hostname → any hostname, but **NEVER on the zone apex/root** (`example.com` ✗, `www.example.com` ✓).
- **Alias:** hostname → **AWS resource** only. **Works on the root domain AND subdomains. Free. Native health checks.** Always type A/AAAA; **TTL is set by AWS, not you**; auto-tracks the resource's changing IPs.
- **Alias targets:** ELBs (Elastic Load Balancers), CloudFront, API Gateway, Elastic Beanstalk, **S3 Websites** (not buckets), VPC Interface Endpoints, Global Accelerator, another Route 53 record in the same zone. **NOT an EC2 DNS name** (memorize the exception).

### Routing Policies (which answer does Route 53 give?)
| Policy | Behavior | Notes / triggers |
|---|---|---|
| **Simple** | one record, one or more values; client picks **randomly** if multiple | **no health checks**; with Alias, one AWS resource only |
| **Weighted** | % of *responses* per record (weight ÷ sum; needn't total 100) | same name+type across records; health-checkable; **weight 0 = stop traffic** (all 0 = all returned); A/B tests, cross-region balancing |
| **Latency-based** | answer = region with lowest measured latency to the user | latency is user↔AWS-region based; health-checkable; "Germany users may land in the US if that's fastest" |
| **Failover** | **active-passive**: primary while healthy, secondary on failure | **health check on the primary is mandatory** |
| **Geolocation** | answer by **user's location** (continent / country / US state — most precise match wins) | ≠ latency! **Create a Default record** for no-match; localization, content restriction |
| **Geoproximity** | shift traffic by geography **± bias** (1..99 expand, −1..−99 shrink) | AWS resources (region) or lat/long; **requires Route 53 Traffic Flow** |
| **IP-based** | route by client CIDR blocks (IP→endpoint mapping) | e.g., send a specific ISP to a specific endpoint |
| **Multi-Value** | return **up to 8 healthy** records | client-side "load balancing"; health-checkable; **NOT a substitute for an ELB / Elastic Load Balancer** |

### Health Checks
- **Endpoint monitors:** ~**15 global checkers**; healthy/unhealthy threshold = 3; interval 30 s (10 s = faster, costs more); HTTP/HTTPS/TCP; healthy if **> 18% of checkers** say so; pass only on **2xx/3xx** (or on text match in the **first 5,120 bytes**). Your firewall/security group must **allow the Route 53 health-checker IP ranges**.
- **Calculated health checks:** parent combines up to **256 children** with **AND / OR / NOT**, with a pass-count threshold — do maintenance without tripping everything.
- **Private resources problem:** the checkers live *outside* your VPC → they can't reach private endpoints. **Workaround: CloudWatch metric → CloudWatch alarm → health check monitors the alarm.** (Also the trick for "full control" checks — DynamoDB throttles, RDS alarms, custom metrics.)
- Health checks integrate with CloudWatch metrics, and are what turns DNS into **automated DNS failover**.

### Registrar ≠ DNS service
- Buy the domain anywhere (GoDaddy), manage DNS anywhere (Route 53): **create a public hosted zone in Route 53 → update the NS records at the registrar to Route 53's name servers.** Every registrar bundles some DNS, but you're never locked to it.

---

## Section 9 — Classic Solutions Architecture

**The mental model:** this section is the *reasoning pattern* the whole exam runs on: start naive → hit a specific pain → apply the one service that fixes it → notice the new tradeoff → repeat. Know each step's *pain* and *fix*, not just the final diagram.

### Case 1 — WhatIsTheTime.com (stateless app)
1. **One public EC2 + Elastic IP.** Fine until load grows.
2. **Scale vertically** (t2 → m5): **downtime during the resize.** Users angry.
3. **Scale horizontally, DNS A record to each instance** (TTL / Time To Live = 1 h): an instance dies → **users keep hitting the dead IP for up to an hour** (TTL caching). DNS is not failover.
4. **Add ELB (Elastic Load Balancing) + health checks**, instances go **private**, security groups chained (load balancer security group → EC2 security group), DNS becomes an **Alias record** (ELB IPs change; CNAME can't do root domain anyway). New pain: adding/removing instances by hand.
5. **Add an ASG (Auto Scaling Group)** → automatic scale out/in. New pain: everything in one Availability Zone = disaster-recovery nightmare.
6. **Go Multi-AZ** (Elastic Load Balancing + Auto Scaling Group across 2–3 Availability Zones) → survives Availability Zone loss. Costs more; that's the tradeoff you accept for high availability.
7. **Reserve capacity** for the Auto Scaling Group **minimum size** → steady baseline = Reserved Instances = cost savings. (Spot for the bursty top if fault-tolerant.)

*Lessons the deck names explicitly:* public vs private IPs, Elastic IP vs Route 53 vs Elastic Load Balancing, TTL/A/Alias, manual vs Auto Scaling Group, Multi-AZ, Elastic Load Balancing health checks, security group rules, reserving capacity.

### Case 2 — MyClothes.com (stateful: shopping cart)
The core problem: **horizontal scaling bounces users between instances → they lose carts/logins.** Three escalating fixes:
1. **ELB Sticky Sessions** — Elastic Load Balancing can keep the same client on the same backend instance, but the cart dies with the instance, plus load imbalance.
2. **Client-side web cookies** (cart in the cookie) — app becomes stateless, but: **≤ 4 KB**, heavier HTTP requests, **security risk (users/attackers can alter cookies → must validate)**.
3. **Server session store** — cookie holds only a **session_id**; cart lives in **ElastiCache** (**DynamoDB is the alternative**). Secure (attackers can't touch the store), fast, stateless app tier. **This is the pattern.**
- **User data** (addresses, profiles) → **RDS**. Reads explode → two options: **RDS Read Replicas** or **ElastiCache lazy loading** (cache hit spares the DB; costs you cache-management code + invalidation headaches).
- **Survive disasters:** make Elastic Load Balancing, the Auto Scaling Group, **RDS Multi-AZ, and ElastiCache Multi-AZ** (Redis) span multiple Availability Zones.
- **Security groups tightened by reference:** Elastic Load Balancing open to 0.0.0.0/0 on 80/443 → EC2 security group accepts only the load balancer security group → RDS/ElastiCache security groups accept only the EC2 security group. **The 3-tier security group chain — memorize it.**

### Case 3 — MyWordPress.com (shared uploads)
- DB layer: RDS Multi-AZ → upgraded to **Aurora MySQL Multi-AZ + Read Replicas** (less ops, global scaling).
- Image uploads on **EBS (Elastic Block Store)**: fine with **one** instance; with many instances each has its own volume → **users' images "disappear"** depending on which instance serves them.
- Fix: **EFS (Elastic File System)** — one shared NFS filesystem mounted by all instances via **ENIs (Elastic Network Interfaces) in every Availability Zone**. The canonical "distributed app needs shared file storage" architecture. (EBS = single-instance storage; EFS = distributed storage.)

### Instantiating applications quickly (full-stack boot speed)
- **EC2:** **Golden AMI (Amazon Machine Image)** (pre-install apps/OS dependencies — the quiz answer, twice), **User Data** for dynamic config only, **Hybrid** = Golden AMI + User Data (this is what Elastic Beanstalk does).
- **RDS (Relational Database Service):** **restore from snapshot** → schemas + data ready.
- **EBS (Elastic Block Store):** **restore from snapshot** → formatted disk with data.

### The typical 3-tier web architecture (draw it from memory)
**Route 53 → ELB / Elastic Load Balancing (public subnet) → ASG / Auto Scaling Group of EC2 across ≥2 Availability Zones (private subnet) → RDS / Relational Database Service + ElastiCache (data subnet).** ElastiCache = session + cached reads; RDS = source of truth.

### Elastic Beanstalk
- The problem it solves: every web app is "Application Load Balancer + Auto Scaling Group + RDS" again; **developers just want their code to run** consistently across environments.
- **Developer-centric PaaS (Platform as a Service)** wrapping EC2, Auto Scaling Groups, Elastic Load Balancing, and RDS. Managed: capacity provisioning, load balancing, scaling, health monitoring, instance config. **You keep full config control.** **Beanstalk is free — pay for the underlying resources.**
- **Components:** **Application** (the collection) → **Application Versions** (code iterations) → **Environments** (resources running ONE version at a time; dev/test/prod).
- **Two tiers:** **Web Server Environment** (classic Elastic Load Balancing + Auto Scaling Group serving HTTP) vs **Worker Environment** (**SQS / Simple Queue Service queue** + workers; **scales on queue depth**; web tier can push jobs to it).
- **Deployment modes:** **Single Instance** (EC2 + Elastic IP, database on-instance — dev) vs **High Availability with LB / load balancer** (Application Load Balancer + Auto Scaling Group multi-AZ + RDS Multi-AZ standby — prod).
- Platforms: Go, Java SE/Tomcat, .NET (Linux & Windows), Node.js, PHP, Python, Ruby, Packer, Docker (single/multi-container/preconfigured).

---

## The Cross-Section Exam Traps (rapid-fire recap)
1. **Multi-AZ = disaster recovery/availability across multiple Availability Zones. Read Replicas = read performance.** Sync vs async. One DNS name vs new connection strings.
2. **CNAME never on the zone apex; Alias everywhere, free, AWS targets only, no EC2 DNS names.**
3. **Timeout = security group. Connection refused = application.** SGs are stateful; inbound denied / outbound allowed by default.
4. **EBS (Elastic Block Store) is Availability-Zone-locked → snapshot to move. Root volume deletes on termination by default; extra volumes don't.**
5. **Spot: cancel the request, then terminate instances. Never for DBs.**
6. **Golden AMI (Amazon Machine Image)** whenever the question smells like "installs take too long at launch/scale-out."
7. **EFS (Elastic File System) = shared, multi-AZ, Linux-only, pay-per-use. EBS (Elastic Block Store) = one instance. Instance Store = ephemeral speed. RDS (Relational Database Service) ≠ file storage.**
8. **NLB (Network Load Balancer) = static IP/extreme TCP-UDP performance. ALB (Application Load Balancer) = Layer 7 routing/containers. GWLB (Gateway Load Balancer) = 3rd-party appliances (GENEVE 6081).**
9. **"Most cost-effective storage"** → check persistent? shared? throughput? then default to the simplest: **S3 > EFS > EBS**.
10. **Stateless beats stateful:** session_id cookie + ElastiCache/DynamoDB > sticky sessions > fat cookies.
