import { useEffect, useState } from "react";
import { Activity, Database, Globe2, ReceiptText } from "lucide-react";
import { fetchTenantSettings, fetchUsage, type TenantSettings, type UsagePayload } from "@/services/apiClient";

function usageLabel(value: number, limit: number | null): string {
  return limit === null ? `${value} / unlimited` : `${value} / ${limit}`;
}

export function SaasCommandCenter() {
  const [usage, setUsage] = useState<UsagePayload | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  useEffect(() => {
    void Promise.all([fetchUsage(), fetchTenantSettings()]).then(([usagePayload, settingsPayload]) => {
      setUsage(usagePayload);
      setSettings(settingsPayload.settings);
    });
  }, []);

  const cards = [
    {
      label: "Monthly estimations",
      value: usage ? usageLabel(usage.usage.estimations, usage.limits.estimationsPerMonth) : "Loading",
      icon: Activity
    },
    {
      label: "PDF exports",
      value: usage ? usageLabel(usage.usage.pdfExports, usage.limits.pdfExportsPerMonth) : "Loading",
      icon: ReceiptText
    },
    {
      label: "Market profile",
      value: settings ? `${settings.country} / ${settings.currency}` : "Loading",
      icon: Globe2
    },
    {
      label: "Data residency",
      value: settings?.dataResidency ?? "Loading",
      icon: Database
    }
  ];

  return (
    <section className="bg-white border-b border-line">
      <div className="mx-auto max-w-[1800px] px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Commercial estimation command center</h1>
            <p className="mt-1 text-sm text-accent-600">Tenant-aware workflow, market settings, usage gates, and governed estimation records.</p>
          </div>
          <span className="rounded-md bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">{usage?.plan ?? "FREE"} plan</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="rounded-lg border border-line bg-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-accent-600">{card.label}</p>
                  <Icon className="h-4 w-4 text-accent-700" aria-hidden="true" />
                </div>
                <p className="mt-3 text-lg font-semibold text-ink">{card.value}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
