import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { phaseLabels, phaseOrder } from "@/constants/phases";
import { useEstimation } from "@/hooks/useEstimation";

export function ProgressTracker() {
  const { state } = useEstimation();
  const activeIndex = phaseOrder.indexOf(state.phase);

  return (
    <nav aria-label="Estimation phase progress" className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Phase Progress</h2>
        <span className="rounded-md bg-panel px-2 py-1 text-xs font-medium text-accent-600">
          {activeIndex + 1}/{phaseOrder.length}
        </span>
      </div>
      <ol className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
        {phaseOrder.map((phase, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex;
          const Icon = complete ? CheckCircle2 : active ? LoaderCircle : Circle;
          return (
            <li
              key={phase}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition duration-200 ${
                active
                  ? "border-accent-500 bg-accent-50 text-accent-700"
                  : complete
                    ? "border-brand-100 bg-brand-50 text-brand-700"
                    : "border-transparent bg-panel text-accent-600"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "animate-spin" : ""}`} aria-hidden="true" />
              <span className="min-w-0 truncate">{phaseLabels[phase]}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
