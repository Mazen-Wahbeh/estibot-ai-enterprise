import { Activity, Cpu, ShieldCheck } from "lucide-react";
import { phaseLabels } from "@/constants/phases";
import { useEstimation } from "@/hooks/useEstimation";
import { formatNumber } from "@/utils/format";
import { ActionBar } from "@/components/ActionBar";
import { EstimationCharts } from "@/components/EstimationCharts";
import { MetricCard } from "@/components/MetricCard";
import { ResultCards } from "@/components/ResultCards";

export function Dashboard() {
  const { state, calculations } = useEstimation();
  const completeFields = Math.max(0, 12 - state.missingFields.length);

  return (
    <section className="space-y-4">
      <ActionBar />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current Phase" value={phaseLabels[state.phase]} detail="Strict ordered state-machine phase" icon={<Cpu className="h-4 w-4" />} />
        <MetricCard label="Input Completeness" value={`${formatNumber((completeFields / 12) * 100, 0)}%`} detail={`${state.missingFields.length} open fields tracked`} icon={<Activity className="h-4 w-4" />} />
        <MetricCard label="Schema Status" value="Strict JSON" detail="No root-level extra keys allowed" icon={<ShieldCheck className="h-4 w-4" />} />
      </div>
      <ResultCards calculations={calculations} />
      <EstimationCharts calculations={calculations} />
    </section>
  );
}
