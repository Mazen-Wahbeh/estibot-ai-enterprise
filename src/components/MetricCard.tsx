import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-accent-600">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-md bg-brand-50 p-2 text-accent-700">{icon}</div> : null}
      </div>
      {detail ? <p className="mt-3 text-sm text-accent-600">{detail}</p> : null}
    </section>
  );
}
