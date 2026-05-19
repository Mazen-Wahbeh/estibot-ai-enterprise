import Head from "next/head";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const sections = [
  ["Data we process", "Workspace account data, project inputs, estimation state, calculation outputs, usage events, audit logs, approvals, actuals, proposals, and integration configuration."],
  ["Purpose", "To authenticate users, isolate tenant workspaces, calculate software estimates, generate reports, provide analytics, track usage, and support commercial workflows."],
  ["Secrets", "API keys and JWT secrets must be stored in environment variables. Exposed keys should be rotated immediately."],
  ["Retention", "Production deployments should define retention, export, and deletion policies before onboarding paying customers."],
  ["Third parties", "AI provider, hosting provider, database provider, and payment provider policies should be reviewed before public launch."]
];

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy | EstiBot AI SaaS</title>
      </Head>
      <main className="min-h-screen bg-panel px-4 py-6 text-ink">
        <section className="mx-auto max-w-4xl rounded-lg border border-line bg-white p-6 shadow-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            EstiBot AI SaaS
          </Link>
          <h1 className="mt-6 text-3xl font-semibold">Privacy Notice</h1>
          <p className="mt-3 text-sm leading-6 text-accent-700">
            This launch-ready privacy notice explains the data categories and operating expectations for EstiBot AI SaaS. It should be reviewed
            by legal counsel before paid public sales.
          </p>
          <div className="mt-6 space-y-4">
            {sections.map(([title, text]) => (
              <article key={title} className="rounded-lg bg-panel p-4">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-accent-700">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
