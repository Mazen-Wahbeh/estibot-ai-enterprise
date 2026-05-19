import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchIntegrations, saveIntegration, type IntegrationRecord } from "@/services/apiClient";

const providerCopy: Record<string, { title: string; description: string }> = {
  JIRA: { title: "Jira", description: "Sync estimates into delivery epics and backlog planning." },
  SLACK: { title: "Slack", description: "Send approval and risk alerts to delivery channels." },
  GITHUB: { title: "GitHub", description: "Link estimation scope with repositories and releases." },
  CSV_EXPORT: { title: "CSV export", description: "Export governed analytics for spreadsheets and BI tools." },
  ERP: { title: "ERP / CRM", description: "Prepare commercial data for finance, CRM, and contract systems." },
  WEBHOOK: { title: "Webhook", description: "Push estimation events to external workflows." }
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const payload = await fetchIntegrations();
    setIntegrations(payload.integrations);
  };

  useEffect(() => {
    void load().catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load integrations."));
  }, []);

  const toggle = async (integration: IntegrationRecord) => {
    setError(null);
    setMessage(null);
    try {
      await saveIntegration({
        provider: integration.provider as "JIRA" | "SLACK" | "GITHUB" | "CSV_EXPORT" | "ERP" | "WEBHOOK",
        status: integration.status === "CONNECTED" ? "PAUSED" : "CONNECTED",
        configJson: integration.configJson || "{}"
      });
      await load();
      setMessage(`${providerCopy[integration.provider]?.title ?? integration.provider} updated.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update integration.");
    }
  };

  return (
    <>
      <Head>
        <title>Integrations | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-6xl rounded-lg border border-line bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold">Integration Layer</h1>
            <p className="mt-2 max-w-3xl text-sm text-accent-600">
              Billing, project delivery, approvals, exports, and enterprise workflow integrations are structured here so the SaaS can grow without rewriting the core.
            </p>
            {message ? <p className="mt-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}
            {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {integrations.map((integration) => {
                const copy = providerCopy[integration.provider] ?? { title: integration.provider, description: "External system connection." };
                const connected = integration.status === "CONNECTED";
                return (
                  <article key={integration.provider} className="rounded-lg border border-line bg-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{copy.title}</h2>
                        <p className="mt-1 text-sm text-accent-600">{copy.description}</p>
                      </div>
                      <span className={connected ? "rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700" : "rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-700"}>{integration.status}</span>
                    </div>
                    <pre className="mt-4 min-h-[72px] overflow-auto rounded-lg bg-white p-3 text-xs text-accent-700">{integration.configJson}</pre>
                    <button type="button" onClick={() => void toggle(integration)} className="mt-4 w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
                      {connected ? "Pause integration" : "Mark connected"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
