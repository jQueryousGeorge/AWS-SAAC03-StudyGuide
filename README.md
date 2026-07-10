# AWS SAA Study Website

An interactive Node.js study site for AWS Certified Solutions Architect - Associate (SAA-C03) review. The app turns a personal AWS course summary into a navigable study console with section pages, flashcards, reference diagrams, and practice exams.

## Features

- Multi-page study app with clean URLs
- Dashboard/welcome page with a 3-tier AWS architecture visual
- Summary hub for Sections 1-9, with quick links and cross-section exam traps
- Individual section pages for focused review
- 120 flip-to-reveal flashcards with section filtering and shuffle
- Exam center with two 65-question practice exams
- Scoring and answer explanations after grading
- Clickable full-size reference images
- Dependency-free Node.js server using only built-in modules

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Study dashboard and architecture overview |
| `/summary` | Summary hub with Sections 1-9 cards and rapid-fire exam traps |
| `/section/1` - `/section/9` | Detailed section study pages |
| `/flashcards` | Flashcard drill mode with filtering and shuffle |
| `/exam` | Exam center landing page |
| `/exam/a` | Practice Exam A |
| `/exam/b` | Practice Exam B |

## Tech Stack

- Node.js
- HTML
- CSS
- Vanilla JavaScript

The current app does not rely on third-party runtime packages, but you should still run `npm install` during setup so npm can validate the project and create local install metadata if needed.

## Requirements

- Node.js 18 or newer

The app has been developed with Node.js `v26.5.0`, but it only uses standard Node APIs and should run on any supported Node 18+ version.

## Getting Started

Clone the repo:

```bash
git clone https://github.com/jQueryousGeorge/AWS-SAAC03-StudyGuide.git

cd AWS-Study-Website
```

Install the Node project requirements:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the site:

```text
http://127.0.0.1:5173
```

The production-style start command is the same server:

```bash
npm start
```

## Project Structure

```text
.
├── package.json
├── server.js
├── public
│   ├── app.js
│   ├── exam-data.js
│   ├── index.html
│   ├── styles.css
│   ├── assets
│   │   ├── aws_cost_optimization_simulator.html
│   │   ├── ebs_vs_instanceStore.png
│   │   ├── iam-roles-entity-types.png
│   │   └── route53-vs-elb-failover-simulator.html
│   └── content
│       └── aws-saa-sections-1-9-master-summary.md
└── README.md
```

## Content

The study content is built from a local AWS SAA-C03 course summary and supporting personal study assets. The bundled markdown file lives at:

```text
public/content/aws-saa-sections-1-9-master-summary.md
```

In the app, the source file is not shown as one long page. It is split into two study surfaces:

- `/summary` is the summary hub. It shows the Sections 1-9 overview cards and the cross-section exam traps recap.
- `/section/1` through `/section/9` contain the detailed notes from the master summary document for each section.

So when this README says "summary," it means the `/summary` route as the starting hub, not a separate hidden page.

The flashcard bank is defined in:

```text
public/app.js
```

The practice exams are defined in:

```text
public/exam-data.js
```

## Safety Notes

The source material directory contained credential-looking files such as access keys and PEM files. Those were intentionally not copied into this repo.

Only safe study assets were included:

- Summary markdown
- Reference diagrams
- Study simulator HTML files

Do not commit AWS credentials, PEM files, `.env` files, access key CSVs, or exported account secrets.

## Verification

Useful local checks:

```bash
node --check server.js
node --check public/app.js
node --check public/exam-data.js
```

Check a running server:

```bash
curl -I http://127.0.0.1:5173/flashcards
```

## Study Flow

Recommended usage:

1. Start at `/summary` to review the section map and rapid-fire exam traps.
2. Use `/section/1` through `/section/9` for the detailed notes from the master summary document.
3. Use `/flashcards` with section filters for repetition.
4. Shuffle the flashcard deck for mixed recall.
5. Take `/exam/a`, review explanations, then take `/exam/b`.

## Exam Scope Reference

The expanded flashcards and practice questions are aligned with the AWS Certified Solutions Architect - Associate SAA-C03 exam themes:

- Design Secure Architectures
- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

Official AWS references:

- https://aws.amazon.com/certification/certified-solutions-architect-associate/
- https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html

## License

This is a personal study project. Add a license before distributing or accepting external contributions.
