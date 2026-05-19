import Head from "next/head";
import Link from "next/link";
import { BarChart3, Bot, FileText, Lock, Sparkles } from "lucide-react";

const features = [
  { icon: Bot, title: "Deterministic AI intake", text: "One question per turn with strict phase control and resumable project state." },
  { icon: BarChart3, title: "Commercial analytics", text: "Portfolio KPIs, scenario ranges, Monte Carlo confidence, actuals calibration, and sector benchmarks." },
  { icon: Lock, title: "Tenant isolation", text: "Every project, usage event, and estimate is scoped to the authenticated organization." },
  { icon: FileText, title: "Proposal-ready outputs", text: "Branded reports, proposal drafts, approval checkpoints, and integration-ready commercial data." }
];

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>EstiBot AI SaaS</title>
        <meta name="description" content="Commercial SaaS platform for AI-assisted software project estimation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-panel text-ink">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              EstiBot AI SaaS
            </div>
            <nav className="flex items-center gap-3 text-sm">
              <Link className="font-medium text-accent-600 hover:text-ink" href="/pricing">
                Pricing
              </Link>
              <Link className="font-medium text-accent-600 hover:text-ink" href="/login">
                Login
              </Link>
              <Link className="rounded-lg bg-ink px-4 py-2 font-semibold text-white transition hover:bg-accent-600" href="/register">
                Start free
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">Commercial software estimation for teams that need defensible numbers.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-accent-600">
              EstiBot AI SaaS turns conversational requirements into FP, UCP, effort, cost, confidence, analytics, and client-ready PDF reports.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-brand-600 hover:text-white" href="/register">
                Create workspace
              </Link>
              <Link className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-accent-600 transition hover:bg-panel" href="/login">
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm font-semibold">SaaS readiness</span>
              <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">Multi-tenant</span>
            </div>
            <div className="mt-5 grid gap-3">
              {["Authentication", "Usage limits", "Tenant database", "Billing-ready plans", "Admin metrics", "Actuals calibration", "Approval workflow"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md bg-panel px-3 py-2 text-sm">
                  <span>{item}</span>
                  <span className="font-semibold text-accent-600">Ready</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <Icon className="h-5 w-5 text-accent-700" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-accent-600">{feature.text}</p>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
