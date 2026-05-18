import { Calculator, FileDown, RotateCcw } from "lucide-react";
import { useEstimation } from "@/hooks/useEstimation";

export function ActionBar() {
  const { state, calculations, loading, runCalculation, downloadPdf, reset } = useEstimation();
  const canCalculate = state.missingFields.filter((field) => !field.endsWith("notApplicableConfirmed")).length === 0;
  const canExport = Boolean(calculations) || state.phase === "RESULT_GENERATION";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => void runCalculation()}
        disabled={loading || !canCalculate}
        className="inline-flex items-center gap-2 rounded-lg bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-line disabled:text-accent-600"
        title="Run calculation"
      >
        <Calculator className="h-4 w-4" aria-hidden="true" />
        Calculate
      </button>
      <button
        type="button"
        onClick={() => void downloadPdf()}
        disabled={loading || !canExport}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-accent-600"
        title="Export PDF"
      >
        <FileDown className="h-4 w-4" aria-hidden="true" />
        PDF
      </button>
      <button
        type="button"
        onClick={() => void reset()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-accent-600 transition hover:bg-panel disabled:cursor-not-allowed disabled:text-line"
        title="Reset system"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset
      </button>
      <span className="text-sm text-accent-600">
        {canCalculate ? "Calculation inputs are complete." : "Complete required fields to enable calculation."}
      </span>
    </div>
  );
}
