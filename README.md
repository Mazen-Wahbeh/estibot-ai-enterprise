# EstiBot AI Enterprise

AI-powered software project estimation platform with a deterministic state machine, Function Point Analysis, Use Case Point Analysis, analytics dashboards, JSON persistence, REST APIs, and PDF reporting.

لشرح عربي شامل عن فكرة المشروع، طريقة عرضه على شركة، المدخلات والمخرجات، والمعمارية التقنية، راجع:

```text
PROJECT_EXPLANATION_AR.md
```

## Stack

- Next.js Pages Router with React and TypeScript
- Tailwind CSS enterprise UI
- Next.js API routes for REST backend
- JSON file persistence in `data/estibot-state.json`
- Recharts analytics
- jsPDF and jspdf-autotable report generation

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional Groq extraction layer:

```bash
copy .env.example .env.local
```

Set `GROQ_API_KEY` in `.env.local`. The default model is `llama-3.1-8b-instant`; override it with `GROQ_MODEL` if needed. If the key is missing, invalid, rate-limited, or Groq is disabled with `GROQ_ENABLED=false`, the system automatically falls back to the local deterministic extractor.

Groq is used in two server-side places:

- Extraction: normalizes free-form answers into the deterministic state-machine format.
- Reply rewriting: turns deterministic prompts into natural conversational responses while preserving one-question-per-turn behavior.

Production build:

```bash
npm run typecheck
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

All endpoints use `POST`.

- `/api/chat`: accepts `{ "message": "..." }`, processes one deterministic state-machine turn.
- `/api/state`: accepts `{}` to read state or `{ "state": ... }` to persist a strict state object.
- `/api/calculate`: accepts `{ "state": ... }`, validates and returns FP/UCP calculations.
- `/api/pdf`: accepts `{ "state": ... }`, validates and returns an enterprise PDF.
- `/api/reset`: resets persisted state to the initial phase.

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
  state/
  utils/
  types/
  constants/
  database/
  hooks/
  styles/
```

The UI and API both use the same TypeScript contracts. The calculation engine is pure and throws on missing or invalid data, while API handlers catch errors and return structured failure responses.
