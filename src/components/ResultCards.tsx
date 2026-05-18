import { BadgeDollarSign, CalendarDays, Gauge, Timer } from "lucide-react";
import type { CalculationResult } from "@/types/estimation";
import { formatCurrency, formatNumber } from "@/utils/format";
import { MetricCard } from "@/components/MetricCard";

interface ResultCardsProps {
  calculations: CalculationResult | null;
}

export function ResultCards({ calculations }: ResultCardsProps) {
  if (!calculations) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="FP Effort" value="Pending" detail="Awaiting calculation" icon={<Timer className="h-4 w-4" />} />
        <MetricCard label="UCP Effort" value="Pending" detail="Awaiting calculation" icon={<Timer className="h-4 w-4" />} />
        <MetricCard label="Estimated Cost" value="Pending" detail="Awaiting calculation" icon={<BadgeDollarSign className="h-4 w-4" />} />
        <MetricCard label="Confidence" value="Pending" detail="Requires comparable output" icon={<Gauge className="h-4 w-4" />} />
      </div>
    );
  }

  const preferredEffort = calculations.fp?.effortHours ?? calculations.ucp?.effortHours ?? 0;
  const preferredDuration = calculations.fp?.durationMonths ?? calculations.ucp?.durationMonths ?? 0;
  const preferredCost = calculations.fp?.cost ?? calculations.ucp?.cost ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="FP Effort"
        value={calculations.fp ? `${formatNumber(calculations.fp.effortHours)} h` : "N/A"}
        detail={calculations.fp ? `${formatNumber(calculations.fp.afp)} AFP` : "Method not selected"}
        icon={<Timer className="h-4 w-4" />}
      />
      <MetricCard
        label="UCP Effort"
        value={calculations.ucp ? `${formatNumber(calculations.ucp.effortHours)} h` : "N/A"}
        detail={calculations.ucp ? `${formatNumber(calculations.ucp.ucp)} UCP` : "Method not selected"}
        icon={<Timer className="h-4 w-4" />}
      />
      <MetricCard
        label="Estimated Cost"
        value={formatCurrency(preferredCost)}
        detail={`${formatNumber(preferredEffort)} hours across ${formatNumber(preferredDuration)} months`}
        icon={<BadgeDollarSign className="h-4 w-4" />}
      />
      <MetricCard
        label="Confidence"
        value={calculations.confidence.level}
        detail={calculations.confidence.differencePercent === null ? "Single method estimate" : `${formatNumber(calculations.confidence.differencePercent)}% difference`}
        icon={<Gauge className="h-4 w-4" />}
      />
      <MetricCard
        label="Duration"
        value={`${formatNumber(preferredDuration)} mo`}
        detail="Based on 160 productive hours per month"
        icon={<CalendarDays className="h-4 w-4" />}
      />
    </div>
  );
}
