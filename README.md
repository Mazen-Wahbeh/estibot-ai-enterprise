# EstiBot AI SaaS

Commercial multi-tenant SaaS platform for AI-powered software project estimation with deterministic state-machine intake, Function Point Analysis, Use Case Point Analysis, tenant-isolated persistence, usage limits, dashboards, REST APIs, and PDF reporting.

لشرح عربي شامل عن فكرة المشروع، طريقة عرضه على شركة، المدخلات والمخرجات، والمعمارية التقنية، راجع:

```text
PROJECT_EXPLANATION_AR.md
```

## Stack

- Next.js Pages Router with React and TypeScript
- Tailwind CSS enterprise UI
- Next.js API routes for REST backend
- Prisma ORM with SQLite development persistence
- JWT cookie authentication with bcrypt password hashing
- Tenant-scoped projects, estimations, usage logs, and subscriptions
- Recharts analytics
- jsPDF and jspdf-autotable report generation

## Setup

```bash
npm install
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

Optional Groq extraction layer:

```bash
copy .env.example .env.local
```

Set `GROQ_API_KEY` in `.env.local`. The default model is `llama-3.1-8b-instant`; override it with `GROQ_MODEL` if needed. If the key is missing, invalid, rate-limited, or Groq is disabled with `GROQ_ENABLED=false`, the system automatically falls back to the local deterministic extractor.

Required SaaS environment values:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-long-random-secret-before-production"
```

Groq is used in two server-side places:

- Extraction: normalizes free-form answers into the deterministic state-machine format.
- Reply rewriting: turns deterministic prompts into natural conversational responses while preserving one-question-per-turn behavior.

Production build:

```bash
npm run typecheck
npm run lint
npm run db:push
npm run build
npm run start
```

## State Machine Phases

The engine advances in this exact order:

1. `PROJECT_INTRODUCTION`
2. `METHOD_SELECTION`
3. `FUNCTION_POINT_COLLECTION`
4. `USE_CASE_COLLECTION`
5. `TECHNICAL_FACTORS_COLLECTION`
6. `ENVIRONMENTAL_FACTORS_COLLECTION`
7. `VALIDATION_PHASE`
8. `CALCULATION_PHASE`
9. `RESULT_GENERATION`

The persisted AI state uses the strict root schema:

```json
{
  "phase": "",
  "project": {},
  "fp": {},
  "ucp": {},
  "technical": {},
  "environmental": {},
  "missingFields": [],
  "isComplete": false
}
```

## API Endpoints

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Protected tenant-scoped APIs:

- `POST /api/chat`: accepts `{ "message": "...", "projectId": "optional" }`, processes one deterministic state-machine turn.
- `POST /api/state` and `POST /api/state/load`: read the tenant-scoped project state.
- `POST /api/state/save`: persist a strict state object for the current tenant project.
- `POST /api/calculate`: validates usage limits, calculates FP/UCP results, and stores an estimation record.
- `POST /api/pdf` and `POST /api/pdf/generate`: validates PDF limits and returns a branded PDF.
- `POST /api/reset`: resets the selected tenant project state.
- `GET /api/projects`: list tenant projects.
- `POST /api/projects` and `POST /api/projects/create`: create a tenant project.
- `GET /api/admin/metrics`: admin-only SaaS metrics.

## Calculation Formulas

Function Points:

- `UFP = sum(weighted FP components)`
- `VAF = 0.65 + (0.01 * TDI)`
- `AFP = UFP * VAF`
- `Effort = AFP * 8`
- `Duration = Effort / 160`
- `Cost = Effort * HourlyRate`

Use Case Points:

- `UAW = sum(weighted actors)`
- `UUCW = sum(weighted use cases)`
- `UUCP = UAW + UUCW`
- `TCF = 0.6 + (0.01 * TFactor)`
- `ECF = 1.4 - (0.03 * EFactor)`
- `UCP = UUCP * TCF * ECF`
- `Effort = UCP * 20`
- `Duration = Effort / 160`
- `Cost = Effort * HourlyRate`

Confidence:

- `HIGH`: FP and UCP effort difference is less than 15%
- `MEDIUM`: difference is 15% to 35%
- `LOW`: difference is greater than 35%

## Architecture

```text
src/
  ai-engine/
  calculation-engine/
  api/
  components/
  pages/
  services/
  server/
  state/
  utils/
  types/
  constants/
  database/
  hooks/
  styles/
```

The UI and API both use the same TypeScript contracts. The calculation engine is pure and throws on missing or invalid data, while API handlers catch errors and return structured failure responses.
