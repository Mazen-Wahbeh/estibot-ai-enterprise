import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchTemplates, type SectorTemplate } from "@/services/apiClient";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<SectorTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTemplates()
      .then((payload) => setTemplates(payload.templates))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load templates."));
  }, []);

  return (
    <>
      <Head>
        <title>Sector Templates | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-7xl rounded-lg border border-line bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold">Local and Global Sector Templates</h1>
            <p className="mt-2 max-w-3xl text-sm text-accent-600">
              Use these profiles to standardize assumptions, compliance gates, risks, and default commercial settings across markets.
            </p>
            {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <article key={template.id} className="rounded-lg border border-line bg-panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{template.name}</h2>
                      <p className="mt-1 text-sm text-accent-600">{template.regionFit}</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-700">{template.riskProfile}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">Method</p>
                      <p className="mt-1 font-semibold">{template.defaultMethod}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">Rate</p>
                      <p className="mt-1 font-semibold">${template.suggestedHourlyRate}/h</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold">Compliance</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {template.complianceNeeds.map((item) => (
                      <span key={item} className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-700">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold">Delivery risks</p>
                  <ul className="mt-2 space-y-1 text-sm text-accent-700">
                    {template.deliveryRisks.map((risk) => (
                      <li key={risk}>{risk}</li>
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
