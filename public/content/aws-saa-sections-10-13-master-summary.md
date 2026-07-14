# AWS SAA-C03 — Sections 10–13 Master Summary
### Amazon S3 → S3 Advanced → S3 Security → CloudFront & Global Accelerator
*Companion to the Sections 1–9 master summary. Same rules: the psychology first, then the must-know facts, numbers, and traps.*

---

## Section 10 — Amazon S3 (Fundamentals)

**The mental model:** S3 is not a filesystem — it's an infinitely scaling **key → object** store with 11 nines of durability. Everything else (websites, data lakes, backups, "folders") is an illusion built on keys. The exam's favorite S3 axis: **durability is identical everywhere; availability, cost, and retrieval speed are what the storage classes trade.**

### Use cases (recognize the breadth)
Backup & storage, disaster recovery, archive (Nasdaq keeps 7 years in Glacier), hybrid cloud storage, application/media hosting, **data lakes & big-data analytics** (Sysco), software delivery, static websites.

### Buckets
- Defined **at the region level** — S3 *looks* global in the console, but buckets live in a region.
- Naming: **globally unique** (shared global namespace across all regions/accounts); an account-regional namespace option allows name reuse across regions.
- Naming constraints: no uppercase, no underscores, not an IP, must start with lowercase letter or number, must NOT start with `xn--`, must NOT end with `-s3alias`.

### Objects
- The **key is the FULL path** = prefix + object name (`s3://my-bucket/folder1/sub/file.txt`). **There are no real directories** — just long key names containing slashes; the UI fakes folders.
- **Max object size: 50 TB** (raised 10× from the long-standing 5 TB at re:Invent Dec 2025 — older practice exams may still say 5 TB). **Uploads > 5 GB MUST use multi-part upload.**
- Objects also carry: metadata (system/user key-value text), **tags (up to 10** — used for security & lifecycle), and a **Version ID** when versioning is on.

### Security model (the ALLOW/DENY logic)
- **User-based:** IAM policies (which API calls a user may make).
- **Resource-based:** **Bucket policies** (bucket-wide JSON, the tool for public access, forcing upload encryption, and **cross-account** access) + object/bucket ACLs (finer-grained, can and usually should be disabled).
- The rule: an IAM principal can access an object if **(IAM permissions ALLOW it OR the resource policy ALLOWS it) AND there is no explicit DENY.**
- **Block Public Access:** account- or bucket-level kill switch built to prevent data leaks. If a bucket should never be public, leave it ON — it overrides everything else.

### Static website hosting
- URL: `http://bucket-name.s3-website-aws-region.amazonaws.com` (or `.s3-website.` variant).
- **403 Forbidden → the bucket policy doesn't allow public reads.** Memorize that troubleshooting pair.

### Versioning
- Enabled **at the bucket level**; overwriting the same key stacks versions 1, 2, 3…
- Best practice: protects against unintended deletes (restore a version) + easy rollback.
- Files existing **before** versioning get version **"null"**. **Suspending versioning does not delete old versions.**

### Replication — CRR & SRR
- **Versioning required on BOTH source and destination.** Copying is **asynchronous**. Buckets can be in **different accounts**. S3 needs proper IAM permissions.
- **CRR** (cross-region): compliance, lower-latency access in other regions, cross-account replication.
- **SRR** (same-region): log aggregation, live prod→test replication.
- Notes the exam loves: only **new** objects replicate after enabling (use **S3 Batch Replication** for existing/failed objects); **delete markers can optionally replicate, but deletes with a version ID never do** (anti-malicious-delete); **no chaining** (1→2 and 2→3 does not give 1→3).

### Durability vs Availability
- **Durability: 11 nines (99.999999999%) for ALL classes** — lose ~1 object per 10 million every 10,000 years.
- **Availability varies by class** — Standard's 99.99% ≈ 53 minutes unavailable per year.

### Storage classes
| Class | Availability | AZs | Min duration | Min billable size | Personality |
|---|---|---|---|---|---|
| **Standard** | 99.99% | ≥3 | none | none | frequent access; survives 2 concurrent facility failures; big data, gaming, content |
| **Intelligent-Tiering** | 99.9% | ≥3 | none | none | small monitoring fee, **no retrieval charges**, auto-moves objects |
| **Standard-IA** | 99.9% | ≥3 | 30 days | 128 KB | rapid access, rare use; DR, backups; per-GB retrieval fee |
| **One Zone-IA** | 99.5% | **1** | 30 days | 128 KB | 11 nines *within* one AZ but **lost if the AZ dies**; recreatable data, secondary backups |
| **Glacier Instant Retrieval** | 99.9% | ≥3 | **90 days** | 128 KB | **millisecond retrieval**, data touched ~quarterly |
| **Glacier Flexible Retrieval** | 99.99% | ≥3 | **90 days** | 40 KB | Expedited **1–5 min**, Standard **3–5 h**, Bulk **5–12 h (free)** |
| **Glacier Deep Archive** | 99.99% | ≥3 | **180 days** | 40 KB | cheapest ($0.00099/GB); Standard **12 h**, Bulk **48 h** |

- **Intelligent-Tiering internals:** Frequent (default) → Infrequent (30 days untouched) → Archive Instant (90 days) → optional Archive Access (90–700+ days) → optional Deep Archive Access (180–700+ days).
- Glacier pricing = storage price + **retrieval cost per request** — that's the tradeoff for cheapness.

### S3 Express One Zone
- High-performance class in a **Directory Bucket** living in a **single AZ** (name format `bucket--use1-az4--x-s3`).
- **100,000s of requests/sec, single-digit ms latency, up to 10× Standard's performance at 50% lower request cost.** 11 nines durability, 99.95% availability.
- The play: **co-locate storage + compute in the same AZ**. Use: latency-sensitive apps, AI/ML training, financial modeling, media processing, HPC; best friends with SageMaker, Athena, EMR, Glue.

> **Exam psychology:** "cheapest," "millisecond retrieval," "can be recreated," "compliance archive for 10 years" — every storage-class question is these four dials: cost, retrieval speed, resilience (One Zone!), and minimum duration.

---

## Section 11 — Amazon S3 Advanced

**The mental model:** this section is "S3 as a machine": moving data down the class waterfall automatically (lifecycle), reacting to events, and squeezing performance out of prefixes and parallelism.

### Moving between classes + Lifecycle Rules
- Objects transition down a waterfall: Standard → Standard-IA → Intelligent-Tiering → One Zone-IA → Glacier Instant → Flexible → Deep Archive.
- **Transition actions** ("to IA after 60 days, Glacier after 6 months") and **Expiration actions** (delete after N days — including **old versions** and **incomplete multi-part uploads**).
- Rules scope by **prefix** (`s3://bucket/mp3/*`) or **object tags** (`Department: Finance`).

### The two canonical lifecycle scenarios (learn the reasoning, they reappear verbatim)
1. **Thumbnails**: source images on Standard → Glacier after 60 days (can wait 6 h to retrieve = Flexible). Thumbnails (recreatable!) on **One Zone-IA** → **expire after 60 days**.
2. **Recover deletes instantly for 30 days, within 48 h up to 365 days**: enable **Versioning** (deletes become delete markers hiding recoverable versions) → transition **noncurrent versions** to Standard-IA → then to **Glacier Deep Archive** (48 h = Deep Archive Bulk).

### Storage Class Analysis
- Recommends transitions for **Standard and Standard-IA ONLY** (not One Zone-IA or Glacier). Daily CSV report, 24–48 h to start. The "good first step before writing Lifecycle rules."

### Requester Pays
- Normally the owner pays storage + transfer. With Requester Pays, the **requester pays the networking/download**; owner still pays storage. For sharing big datasets with other accounts. **The requester must be authenticated (never anonymous).**

### Event Notifications
- Events: `S3:ObjectCreated`, `S3:ObjectRemoved`, `S3:ObjectRestore`, `S3:Replication`… with name filtering (`*.jpg`). Classic use: generate thumbnails on upload.
- Destinations: **SNS, SQS, Lambda** — each needs a **resource (access) policy** allowing S3 to deliver. Delivery typically seconds, occasionally a minute+.
- **EventBridge path:** ALL events flow to EventBridge → **JSON-rule filtering** (metadata, size, name), **18+ service destinations** (Step Functions, Kinesis…), plus **archive, replay, reliable delivery**. If the question wants advanced filtering or fan-out, the answer is EventBridge.

### Performance numbers (memorize cold)
- Baseline latency 100–200 ms; **3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second PER PREFIX — with NO limit on prefixes.** Spread reads over 4 prefixes = 22,000 GET/s.
- **Multi-part upload:** recommended > 100 MB, **required > 5 GB**; parallelizes uploads.
- **Transfer Acceleration:** upload to the nearest **edge location**, then ride AWS's private network to the target-region bucket. Compatible with multi-part.
- **Byte-Range Fetches:** parallelize GETs by byte range → faster downloads, failure resilience, or fetch just the head of a file.

### S3 Batch Operations
- Bulk actions on existing objects in one job: modify metadata/ACLs/tags, copy between buckets, **encrypt unencrypted objects** (a favorite), restore from Glacier, invoke Lambda per object. Manages retries, tracks progress, reports.
- The pipeline: **S3 Inventory** produces the object list → **Athena** filters it → Batch Operations processes it.

### S3 Storage Lens
- Org-wide storage analytics: understand/optimize across accounts, regions, buckets, prefixes; 30-day usage & activity; default dashboard (multi-region/multi-account, can't delete, can disable); daily export to a bucket (CSV/Parquet).
- Metric families: Summary (StorageBytes, ObjectCount), Cost-Optimization (incomplete MPUs!, noncurrent versions), Data-Protection (versioning/MFA-delete/SSE-KMS/replication counts), Access-management, Event, Performance (Transfer Acceleration), Activity, Status Codes.
- **Free vs paid:** free = ~28 usage metrics, 14-day queries. Advanced = activity/status-code/advanced cost & protection metrics, **CloudWatch publishing, prefix-level aggregation, 15-month retention**.

---

## Section 12 — Amazon S3 Security

**The mental model:** four encryption methods, one question each: WHO holds the key, and WHERE does encryption happen? Then a toolbox of guardrails — WORM locks, MFA delete, pre-signed URLs, access points — each answering a different "how do I stop the wrong person / the wrong action?"

### Object encryption — the big four
| Method | Who manages keys | Where encrypted | Header / requirement | Pick it when… |
|---|---|---|---|---|
| **SSE-S3** | AWS (S3-owned keys) | server-side | `x-amz-server-side-encryption: AES256`; **enabled by DEFAULT** for new buckets/objects | you just want encryption with zero management (AES-256) |
| **SSE-KMS** | AWS KMS (your KMS keys) | server-side | `x-amz-server-side-encryption: aws:kms` | you need **key control + CloudTrail audit** of key usage |
| **SSE-C** | **You**, outside AWS | server-side (S3 encrypts but **never stores your key**) | **HTTPS mandatory** + key in headers on EVERY request | you must own keys but still want S3 to do the crypto |
| **Client-Side** | You, fully | **client-side**, before upload | client library (e.g., S3 Client-Side Encryption Library) | data must never reach AWS unencrypted; you decrypt on retrieval too |

- **SSE-KMS limitation (trap):** every upload calls `GenerateDataKey`, every download calls `Decrypt` — both count against the **KMS quota (5,500 / 10,000 / 30,000 req/s by region)**. Very hot buckets can throttle on KMS; request a Service Quotas increase.
- **In transit:** S3 exposes HTTP and HTTPS endpoints; HTTPS recommended, **mandatory for SSE-C**. **Force TLS** with a bucket policy denying `aws:SecureTransport = false`.
- **Force encryption at upload:** either rely on default SSE-S3, or a bucket policy refusing PUTs lacking encryption headers. **Bucket policies are evaluated BEFORE default encryption.**

### CORS (a self-declared "popular exam question")
- **Origin = scheme + host + port.** Same origin: `http://example.com/app1` vs `/app2`. Different: `www.example.com` vs `other.example.com`.
- Browser mechanism: a cross-origin request triggers a **preflight** (OPTIONS); the target must reply with **`Access-Control-Allow-Origin`** (+ allowed methods) or the browser blocks it.
- S3 version: if a static site on bucket A pulls assets from bucket B, **bucket B needs the CORS headers allowing bucket A's origin** (specific origin or `*`).

### MFA Delete
- Requires **Versioning enabled**; only the **bucket owner (root account)** can enable/disable it.
- MFA **required** for: permanently deleting an object version; suspending versioning. **Not** required for: enabling versioning, listing deleted versions.

### S3 Access Logs
- Log ALL requests (any account, authorized or denied) into **another bucket in the SAME region**.
- **Never point the logging bucket at itself → infinite logging loop and exponential growth.**

### Pre-Signed URLs
- Temporary URLs that **inherit the permissions of the user who generated them** (GET/PUT).
- Expiration: Console 1 min–720 min (12 h); CLI `--expires-in` seconds (default 3,600, max 604,800 ≈ 168 h).
- Uses: premium video downloads for logged-in users only, ever-changing user lists, temporary upload rights to one precise key.

### WORM — the two locks
- **Glacier Vault Lock:** attach a Vault Lock Policy, lock it, and **it can never be changed or deleted** — compliance retention.
- **S3 Object Lock** (needs Versioning): block version deletion for a time.
  - **Compliance mode:** no one — **not even root** — can overwrite/delete or shorten retention.
  - **Governance mode:** most users can't, but privileged users with special permissions can.
  - **Retention period** (fixed, extendable) vs **Legal Hold** (indefinite, independent, toggled via the `s3:PutObjectLegalHold` permission).

### S3 Access Points
- Scale security on one big bucket: each access point gets **its own DNS name** (Internet or **VPC origin**) and its **own policy** (e.g., Finance AP → `/finance/*` R/W, Analytics AP → whole bucket read-only).
- **VPC-origin access points** require a **VPC Endpoint** (Gateway or Interface), and the endpoint policy must allow both the bucket AND the access point — a 3-policy chain: endpoint policy → access point policy → bucket policy.

### S3 Object Lambda
- A Lambda function transforms the object **on retrieval**, in-flight, on top of an access point (one bucket + supporting AP + Object Lambda AP).
- Uses: **redacting PII** for analytics/non-prod, converting formats (XML→JSON), resizing/watermarking per caller. One bucket, many views.

---

## Section 13 — CloudFront & Global Accelerator

**The mental model:** both ride AWS's edge network, but they do opposite jobs. **CloudFront CACHES content at the edge** (a CDN for reads). **Global Accelerator PROXIES packets from the edge to your app over AWS's private backbone** (no caching, 2 anycast IPs). The exam question is always "cache it near users?" vs "fast, stable path to one app?"

### CloudFront basics
- CDN: content cached at **hundreds of edge locations** → better read performance and UX. Built-in DDoS protection (it's worldwide), integrates with **Shield** and **WAF**.
- Flow: client hits the edge → cache hit serves locally → miss forwards to the origin, caches the response for its TTL.

### Origins
- **S3 bucket** — distribute/cache files, even upload through CloudFront; secured with **Origin Access Control (OAC) + a bucket policy** so ONLY CloudFront can read the bucket.
- **VPC Origin** — serve apps in **private subnets** with no internet exposure: private ALB, private NLB, or private EC2.
- **Custom HTTP origin** — an S3 *website* endpoint (static hosting must be enabled first) or any public HTTP backend (public ALB…).
- Public-network alternative (pre-VPC-origins pattern): make the ALB/EC2 public but restrict its security group to the published **CloudFront edge IP ranges**.

### CloudFront vs S3 Cross-Region Replication (classic comparison)
- **CloudFront:** global edge network, cached for a TTL — **static content that must be available EVERYWHERE**.
- **S3 CRR:** per-region setup, near-real-time updates, read-only — **dynamic content at low latency in a FEW regions**.

### Geo Restriction
- **Allowlist** or **Blocklist** of countries, resolved by a 3rd-party Geo-IP database. Use case: **copyright licensing**.

### Cache Invalidations
- CloudFront doesn't know your origin changed; content refreshes only when TTL expires — unless you force an **invalidation** for everything (`/*`) or a path (`/images/*`).

### Global Accelerator
- Problem: global users reach your single-region app over the public internet = many hops = latency.
- **Unicast IP** = one server, one IP. **Anycast IP** = many endpoints share the SAME IP; clients are routed to the nearest one.
- GA gives you **2 anycast IPs**; traffic enters the nearest **edge location**, then rides the **AWS internal network** to your app.
- Works with **Elastic IP, EC2, ALB, NLB — public or private**.
- Benefits: intelligent lowest-latency routing, **no client-cache problems (the IPs never change)**, built-in **health checks with failover < 1 minute** (great for DR), only **2 IPs to whitelist**, Shield DDoS protection.

### Global Accelerator vs CloudFront (the money table)
| | CloudFront | Global Accelerator |
|---|---|---|
| Edge role | **serves cached content AT the edge** | **proxies packets THROUGH the edge** to your regions |
| Content | cacheable (images, video) + dynamic HTTP (API/site acceleration) | any **TCP or UDP** application |
| Sweet spot | static content for the whole world | **non-HTTP**: gaming (UDP), IoT (MQTT), VoIP — or HTTP needing **static IPs** or **deterministic fast regional failover** |
| Shared traits | both use the AWS global edge network; both integrate with Shield | same |

---

## The Cross-Section Exam Traps (rapid-fire recap, sections 10–13)
1. **Durability (11 nines) is the same everywhere; availability/cost/retrieval differ.** One Zone-IA dies with its AZ.
2. **Max object 50 TB (Dec 2025 change — old dumps say 5 TB); multi-part REQUIRED > 5 GB, recommended > 100 MB.**
3. **Replication needs Versioning on both sides; async; new objects only (Batch Replication for the rest); versioned deletes never replicate; no chaining.**
4. **Static site returns 403 → bucket policy isn't allowing public reads.**
5. **3,500 PUT / 5,500 GET per second PER PREFIX, unlimited prefixes** — spread keys to multiply throughput.
6. **SSE-KMS can throttle on KMS API quotas at high request rates.** SSE-C = HTTPS + key in every request; S3 never stores it.
7. **Compliance mode Object Lock stops even root; Governance mode has escape hatches; Legal Hold is indefinite and separate.**
8. **Pre-signed URLs inherit the creator's permissions** and expire (CLI max ~168 h).
9. **Never log a bucket's access into itself** — logging loop.
10. **"Assets from another domain blocked by the browser" → CORS headers on the target bucket.**
11. **Advanced event filtering / many destinations / replay → EventBridge**, not plain S3 notifications.
12. **Cache everywhere = CloudFront. TCP/UDP, static IPs, or <1-min deterministic failover = Global Accelerator.**
13. **Private-subnet ALB/EC2 behind CloudFront → VPC Origins** (no public exposure needed anymore).
14. **Old versions recovery scenarios = Versioning + lifecycle on NONCURRENT versions** (the 30-day/48-hour scenario).
