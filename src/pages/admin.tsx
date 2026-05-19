import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchAdminMetrics } from "@/services/apiClient";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Record<string, number | string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminMetrics()
      .then(setMetrics)
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
          <section className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Admin Metrics</h1>
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
        </main>
      </RequireAuth>
    </>
  );
}
