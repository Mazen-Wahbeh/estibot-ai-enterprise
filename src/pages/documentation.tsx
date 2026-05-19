import Head from "next/head";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { documentationMeta, documentationSections, launchChecklist } from "@/content/platformDocumentation";

export default function DocumentationPage() {
  return (
    <>
      <Head>
        <title>Documentation | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-lg border border-line bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:h-fit">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Platform Docs</p>
                  <p className="text-xs text-accent-600">{documentationMeta.version}</p>
                </div>
              </div>
              <nav className="mt-5 space-y-2 text-sm">
                {documentationSections.map((section) => (
                  <a key={section.id} className="block rounded-md px-3 py-2 font-medium text-accent-700 hover:bg-panel hover:text-ink" href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <section className="space-y-5">
              <article className="rounded-lg border border-line bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-accent-600">Last updated {documentationMeta.updatedAt}</p>
                <h1 className="mt-2 text-3xl font-semibold">{documentationMeta.productName} Documentation</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-accent-700">
                  This documentation explains what companies need to know before using EstiBot commercially: architecture, data inputs,
                  estimation workflow, analytics, governance, security, deployment, and launch readiness. It is maintained from a versioned
                  content module in the codebase so it can be updated with every platform release.
                </p>
              </article>

              {documentationSections.map((section) => (
                <article key={section.id} id={section.id} className="scroll-mt-5 rounded-lg border border-line bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-accent-700">{section.summary}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {section.points.map((point) => (
                      <div key={point} className="flex gap-3 rounded-lg bg-panel p-3 text-sm text-accent-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}

              <article className="rounded-lg border border-line bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Launch Checklist</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {launchChecklist.map((item) => (
                    <div key={item} className="rounded-lg border border-line bg-panel p-3 text-sm text-accent-700">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
