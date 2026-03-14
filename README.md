# FaultMint

**AI pre-mortem and release gate dashboard for software teams.**

Paste your release notes, run AI-powered failure analysis, get severity-ranked risk predictions, track a mitigation checklist, collect role-based approvals, and receive a real-time ship-or-block verdict — all before code hits production.

---

## Why It Matters

Most teams discover what went wrong **after** a release breaks. FaultMint flips that model: it runs a structured pre-mortem **before** you ship so you can identify, mitigate, and gate risks while there's still time to act.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma |
| Validation | Zod |
| Icons | lucide-react |
| Dates | date-fns |
| AI (optional) | OpenAI GPT-4o-mini |

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# 1. Clone
git clone https://github.com/your-username/faultmint.git
cd faultmint

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to SQLite
npm run db:push

# 6. Seed sample data
npm run db:seed

# 7. Start dev server
npm run dev