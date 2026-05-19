import Head from "next/head";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { documentationMeta, releaseNotes } from "@/content/platformDocumentation";

export default function ChangelogPage() {
  return (
    <>
      <Head>
        <title>Changelog | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-accent-600">Current version {documentationMeta.version}</p>
            <h1 className="mt-2 text-3xl font-semibold">Platform Changelog</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-accent-700">
              Release notes for customer-facing platform changes. Keep this page updated with each commit that changes workflow,
              data model, billing behavior, integrations, analytics, or security posture.
            </p>
            <div className="mt-7 space-y-5">
              {releaseNotes.map((release) => (
                <article key={release.version} className="rounded-lg border border-line bg-panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{release.title}</h2>
                      <p className="mt-1 text-sm text-accent-600">{release.version}</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-700">{release.date}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-accent-700">
                    {release.changes.map((change) => (
                      <li key={change} className="rounded-md bg-white px-3 py-2">
                        {change}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
