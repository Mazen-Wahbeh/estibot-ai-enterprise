import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchAdminMetrics, fetchAdvancedPortfolioAnalytics, type AdvancedPortfolioAnalytics } from "@/services/apiClient";

function metric(value: number, suffix = ""): string {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value)}${suffix}`;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Record<string, number | string> | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedPortfolioAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminMetrics(), fetchAdvancedPortfolioAnalytics()])
      .then(([metricsPayload, advancedPayload]) => {
        setMetrics(metricsPayload);
        setAdvanced(advancedPayload.analytics);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load admin metrics."));
  }, []);

  return (
    <>
      <Head>
        <title>Admin | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto max-w-6xl space-y-5">
            <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold">Admin Metrics</h1>
              <p className="mt-2 text-sm text-accent-600">Operational metrics, revenue estimate, tenant activity, and advanced portfolio intelligence for platform operators.</p>
              {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {metrics
                  ? Object.entries(metrics).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-line bg-panel p-4">
                        <p className="text-xs font-semibold uppercase text-accent-600">{key}</p>
                        <p className="mt-2 text-2xl font-semibold">{value}</p>
                      </div>
                    ))
                  : null}
              </div>
            </section>

            {advanced ? (
              <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Advanced Portfolio Oversight</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {[
                    ["Average risk", metric(advanced.totals.averageRiskScore)],
                    ["Critical projects", String(advanced.totals.criticalProjects)],
                    ["Average margin", metric(advanced.totals.averageMarginPercent, "%")],
                    ["Recommended pipeline", metric(advanced.totals.totalRecommendedPipeline)],
                    ["Capacity coverage", metric(advanced.totals.averageCapacityCoveragePercent, "%")],
                    ["Projects with EVM", String(advanced.totals.projectsWithEvm)]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-line bg-panel p-4">
                      <p className="text-xs font-semibold uppercase text-accent-600">{label}</p>
                      <p className="mt-2 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
