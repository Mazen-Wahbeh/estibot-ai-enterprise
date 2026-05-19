export const documentationMeta = {
  productName: "EstiBot AI SaaS",
  version: "2026.05.19-advanced-analytics",
  updatedAt: "2026-05-19",
  owner: "EstiBot Product Operations"
};

export interface DocumentationSection {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const documentationSections: DocumentationSection[] = [
  {
    id: "overview",
    title: "Platform Overview",
    summary: "EstiBot AI SaaS is a multi-tenant commercial estimation platform for software projects.",
    points: [
      "Supports Function Point Analysis, Use Case Point Analysis, and combined FP/UCP estimates.",
      "Guides teams through deterministic one-question-per-turn estimation instead of open-ended chatbot behavior.",
      "Stores projects, estimations, usage, audit logs, approvals, actuals, proposals, and integrations per tenant.",
      "Designed for sales, delivery, product, PMO, and executive teams that need defensible commercial numbers."
    ]
  },
  {
    id: "tenancy",
    title: "Tenants, Users, and Roles",
    summary: "Each company works inside an isolated workspace with plan, usage, market settings, and audit history.",
    points: [
      "Every authenticated user belongs to one tenant organization.",
      "Project, estimation, usage, actuals, proposal, approval, and integration queries are scoped to tenantId.",
      "The first registered user is assigned ADMIN, while later users receive USER by default.",
      "Admin pages expose system metrics and operational visibility without exposing another tenant's records."
    ]
  },
  {
    id: "workflow",
    title: "Estimation Workflow",
    summary: "The AI engine follows strict phases so companies can review and reproduce the estimate.",
    points: [
      "Phases: introduction, method selection, FP collection, UCP collection, technical factors, environmental factors, validation, calculation, and report generation.",
      "The engine asks one question per turn and persists state so teams can resume later.",
      "Calculations remain deterministic: FP uses UFP, VAF, AFP, effort, duration, and cost; UCP uses UAW, UUCW, UUCP, TCF, ECF, effort, duration, and cost.",
      "Confidence is derived from method agreement: high below 15 percent difference, medium from 15 to 35 percent, low above 35 percent."
    ]
  },
  {
    id: "inputs",
    title: "Required Business Inputs",
    summary: "Companies should prepare commercial and delivery context before running production estimates.",
    points: [
      "Project name, client name, description, sector, country, currency, risk level, VAT, hourly rate, and team size.",
      "FP inputs: external inputs, outputs, inquiries, internal logical files, external interface files, and general system characteristics.",
      "UCP inputs: actors, use cases, technical factors, and environmental factors.",
      "Market settings: tenant locale, currency, country, data residency, VAT rate, and report brand."
    ]
  },
  {
    id: "analytics",
    title: "Analytics and Calibration",
    summary: "The analytics layer helps companies evaluate portfolio value, risk, and delivery accuracy.",
    points: [
      "Portfolio analytics include estimated cost, effort, duration, high-risk projects, actuals coverage, sector mix, method mix, and monthly trend.",
      "Project analytics include estimate ranges, Monte Carlo P50/P80/P90, FP/UCP method comparison, confidence, and recommendations.",
      "Advanced analytics add COCOMO II, approximate COSMIC sizing, profitability, EVM, capacity planning, scope creep, volatility, and benchmarking.",
      "Actuals tracking records real effort, duration, and cost to show variance against the estimate.",
      "Sector templates standardize assumptions and compliance concerns across SaaS, government, fintech, healthcare, e-commerce, education, logistics, and ERP/CRM projects."
    ]
  },
  {
    id: "governance",
    title: "Governance and Approvals",
    summary: "Commercial teams can add review gates before a number becomes a proposal or delivery commitment.",
    points: [
      "Approval requests can be created from analytics for high-risk or low-confidence estimates.",
      "Approval records keep status, requester, reviewer, comments, and timestamps.",
      "Audit logs record major actions such as registration, project creation, calculations, analytics views, actuals, proposals, and integrations.",
      "Recommended enterprise process: estimate, validate, request approval, generate proposal, export report, then track actuals."
    ]
  },
  {
    id: "reports",
    title: "Reports and Proposals",
    summary: "Outputs are designed for internal review and client-facing commercial discussion.",
    points: [
      "PDF reports include tenant branding, project summary, FP/UCP tables, cost breakdown, confidence, timestamp, and pagination.",
      "Proposal Builder generates SOW-ready content from analytics, sector assumptions, risks, cost ranges, and next steps.",
      "Pricing and billing pages are structured for future Stripe integration and plan gating.",
      "Use exported reports as commercial evidence, not as a replacement for final legal or procurement review."
    ]
  },
  {
    id: "security",
    title: "Security Model",
    summary: "Security controls are implemented around authentication, tenant boundaries, validation, and operational logging.",
    points: [
      "Passwords are hashed with bcrypt and sessions are signed with JWT_SECRET.",
      "Protected API routes require an authenticated session, request rate limiting, same-origin checks, JSON-only unsafe methods, and payload size limits.",
      "Zod validates user inputs before database writes.",
      "Production deployments must use long random secrets, rotate exposed AI keys, avoid committing .env files, and keep security headers enabled."
    ]
  },
  {
    id: "deployment",
    title: "Deployment and Operations",
    summary: "The current deployment path supports Render with automatic GitHub deploys.",
    points: [
      "Render build command: npm install && npm run build.",
      "Render start command: npm run db:push && npm run start.",
      "Required environment variables: DATABASE_URL, JWT_SECRET, GROQ_API_KEY, GROQ_MODEL, and GROQ_ENABLED.",
      "For production beyond a demo, move from file-based SQLite to managed PostgreSQL with backups and migration policy."
    ]
  },
  {
    id: "integrations",
    title: "Integration Readiness",
    summary: "The integration layer prepares the product for enterprise workflows without coupling the core estimation engine.",
    points: [
      "Supported integration records: Jira, Slack, GitHub, CSV export, ERP/CRM, and webhooks.",
      "Integration status and JSON config are tenant-scoped.",
      "CSV and webhook flows can become the first practical integration targets.",
      "Future enterprise additions should include API keys, webhooks signing, retry logs, and customer-owned data export."
    ]
  }
];

export const launchChecklist = [
  "Rotate any exposed AI provider keys and update Render environment variables.",
  "Set JWT_SECRET to a long random value in production.",
  "Confirm tenant isolation with two test companies before inviting customers.",
  "Run a sample FP/UCP estimate, review COCOMO/COSMIC and EVM outputs, generate a proposal, export PDF, create approval, and record actuals.",
  "Move production customers to PostgreSQL before storing critical business data.",
  "Define support email, billing contact, privacy policy, and terms of use.",
  "Prepare backup and incident response procedures before paid pilots."
];

export const releaseNotes: ReleaseNote[] = [
  {
    version: "2026.05.19-advanced-analytics",
    date: "2026-05-19",
    title: "Advanced estimation analytics",
    changes: [
      "Added COCOMO II parametric analysis on top of FP/UCP baselines.",
      "Added approximate COSMIC sizing with data movement breakdown.",
      "Added profitability, contingency, VAT, and client price recommendations.",
      "Added team capacity, EVM snapshot, scope creep, requirements volatility, and sector benchmarking.",
      "Added Advanced Analytics page and protected API endpoint."
    ]
  },
  {
    version: "2026.05.19-enterprise-analytics",
    date: "2026-05-19",
    title: "Enterprise analytics and go-to-market expansion",
    changes: [
      "Added portfolio and project analytics with estimate ranges, confidence, method comparison, and Monte Carlo risk outputs.",
      "Added actuals tracking for cost, duration, and effort calibration.",
      "Added sector templates for local and global markets.",
      "Added proposal builder, approval workflow, integration layer, and operational health endpoint.",
      "Added documentation, security, status, changelog, privacy, and terms pages for launch readiness."
    ]
  },
  {
    version: "2026.05.19-saas-foundation",
    date: "2026-05-19",
    title: "SaaS foundation",
    changes: [
      "Implemented multi-tenant authentication, tenant settings, billing-ready plans, usage limits, audit logs, and admin metrics.",
      "Added protected dashboards, projects, billing, settings, and PDF/reporting workflows.",
      "Prepared Render deployment with runtime database initialization."
    ]
  }
];
