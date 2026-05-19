import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchUsage, type UsagePayload } from "@/services/apiClient";
import { useAuth } from "@/state/AuthContext";

export default function BillingPage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsagePayload | null>(null);

  useEffect(() => {
    fetchUsage().then(setUsage).catch(() => setUsage(null));
  }, []);

  return (
    <>
      <Head>
        <title>Billing | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Billing</h1>
            <p className="mt-2 text-sm text-accent-600">Stripe-ready billing structure. Checkout and webhooks can be connected without changing the plan-gating model.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase text-accent-600">Estimations</p>
                <p className="mt-2 text-xl font-semibold">{usage ? `${usage.usage.estimations} / ${usage.limits.estimationsPerMonth ?? "Unlimited"}` : "Loading"}</p>
              </div>
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase text-accent-600">PDF exports</p>
                <p className="mt-2 text-xl font-semibold">{usage ? `${usage.usage.pdfExports} / ${usage.limits.pdfExportsPerMonth ?? "Unlimited"}` : "Loading"}</p>
              </div>
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase text-accent-600">Chat turns</p>
                <p className="mt-2 text-xl font-semibold">{usage?.usage.chats ?? "Loading"}</p>
              </div>
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase text-accent-600">Projects</p>
                <p className="mt-2 text-xl font-semibold">{usage?.usage.projects ?? "Loading"}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {["FREE", "PRO", "ENTERPRISE"].map((plan) => (
                <div key={plan} className="rounded-lg border border-line bg-panel p-4">
                  <h2 className="font-semibold">{plan}</h2>
                  <p className="mt-2 text-sm text-accent-600">{plan === user?.plan ? "Current plan" : "Upgrade-ready"}</p>
                  <button className="mt-4 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white" type="button">
                    {plan === user?.plan ? "Active" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
