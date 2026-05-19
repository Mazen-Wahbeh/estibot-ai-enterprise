import Head from "next/head";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchHealth } from "@/services/apiClient";

export default function StatusPage() {
  const [health, setHealth] = useState<Record<string, number | string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchHealth()
      .then(setHealth)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load system status."));
  }, []);

  return (
    <>
      <Head>
        <title>Status | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-accent-600">Operational readiness</p>
                <h1 className="mt-2 text-3xl font-semibold">System Status</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-accent-700">
                  Live platform checks for database reachability, core record counts, and production launch posture.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                <Activity className="h-4 w-4" aria-hidden="true" />
                {health?.status ?? "Checking"}
              </span>
            </div>
            {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {health
                ? Object.entries(health).map(([key, value]) => (
                    <article key={key} className="rounded-lg border border-line bg-panel p-4">
                      <p className="text-xs font-semibold uppercase text-accent-600">{key}</p>
                      <p className="mt-2 text-lg font-semibold">{String(value)}</p>
                    </article>
                  ))
                : ["status", "database", "checkedAt"].map((key) => (
                    <article key={key} className="rounded-lg border border-line bg-panel p-4">
                      <p className="text-xs font-semibold uppercase text-accent-600">{key}</p>
                      <p className="mt-2 text-lg font-semibold">Loading</p>
                    </article>
                  ))}
            </div>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
