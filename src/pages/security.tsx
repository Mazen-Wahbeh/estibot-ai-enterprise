import Head from "next/head";
import { ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";

const securityControls = [
  ["Authentication", "JWT-backed session cookies, bcrypt password hashing, login/logout/register endpoints."],
  ["Tenant isolation", "Every protected business query is scoped by tenantId or by a tenant-owned project relation."],
  ["Validation", "Zod schemas validate project, settings, actuals, approvals, proposals, and integrations input."],
  ["Rate limiting", "Protected routes enforce per-user request limits to reduce accidental overload and abuse."],
  ["Auditability", "AuditLog records important product actions for administrative review."],
  ["Secret handling", "Production secrets are read from environment variables and .env files are ignored by git."]
];

const productionControls = [
  "Rotate any API key that was pasted into chat, logs, screenshots, or documentation.",
  "Use managed PostgreSQL before paid production pilots.",
  "Create a backup and restore procedure before onboarding customer data.",
  "Add support contact, incident owner, and escalation policy.",
  "Add customer data export and deletion process.",
  "Review privacy and terms text with legal counsel before public sales."
];

export default function SecurityPage() {
  return (
    <>
      <Head>
        <title>Security | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-6xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase text-accent-600">Trust center</p>
                <h1 className="text-3xl font-semibold">Security and Compliance Readiness</h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-accent-700">
              This page summarizes implemented controls and the remaining production controls companies should expect before a paid rollout.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {securityControls.map(([title, text]) => (
                <article key={title} className="rounded-lg border border-line bg-panel p-4">
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-accent-700">{text}</p>
                </article>
              ))}
            </div>
            <article className="mt-6 rounded-lg border border-line bg-panel p-5">
              <h2 className="text-lg font-semibold">Production Security Checklist</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {productionControls.map((item) => (
                  <div key={item} className="rounded-lg bg-white px-3 py-2 text-sm text-accent-700">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
