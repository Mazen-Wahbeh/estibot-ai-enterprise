import { Database, ListChecks } from "lucide-react";
import { useEstimation } from "@/hooks/useEstimation";
import { titleCase } from "@/utils/format";

export function StateSidebar() {
  const { state } = useEstimation();

  return (
    <aside className="flex h-[calc(100vh-2.5rem)] min-h-[520px] max-h-[760px] min-w-0 flex-col gap-4">
      <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-accent-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-ink">Missing Fields</h2>
        </div>
        {state.missingFields.length > 0 ? (
          <ul className="space-y-2">
            {state.missingFields.slice(0, 8).map((field) => (
              <li key={field} className="rounded-md bg-panel px-3 py-2 text-xs text-accent-600">
                {titleCase(field)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">No missing fields.</p>
        )}
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-accent-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-ink">Live State</h2>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-md bg-ink p-3 text-xs leading-5 text-brand-50">
          {JSON.stringify(state, null, 2)}
        </pre>
      </section>
    </aside>
  );
}
