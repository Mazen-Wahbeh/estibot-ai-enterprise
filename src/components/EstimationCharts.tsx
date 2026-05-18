import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CalculationResult } from "@/types/estimation";

interface EstimationChartsProps {
  calculations: CalculationResult | null;
}

export function EstimationCharts({ calculations }: EstimationChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!calculations) {
      return [];
    }
    return [
      {
        name: "Effort Hours",
        FP: calculations.fp?.effortHours ?? 0,
        UCP: calculations.ucp?.effortHours ?? 0
      },
      {
        name: "Duration Months",
        FP: calculations.fp?.durationMonths ?? 0,
        UCP: calculations.ucp?.durationMonths ?? 0
      },
      {
        name: "Cost / 100",
        FP: calculations.fp ? calculations.fp.cost / 100 : 0,
        UCP: calculations.ucp ? calculations.ucp.cost / 100 : 0
      }
    ];
  }, [calculations]);

  if (!mounted) {
    return <div className="h-[280px] rounded-lg border border-dashed border-line bg-white" />;
  }

  if (!calculations) {
    return (
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">FP vs UCP Analytics</h2>
        <div className="mt-4 flex h-[240px] items-center justify-center rounded-lg bg-panel text-sm text-accent-600">
          Complete validation and run calculation to render charts.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">FP vs UCP Analytics</h2>
        <span className="rounded-md bg-panel px-2 py-1 text-xs text-accent-600">Cost axis scaled by 100</span>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#B9E9EE" />
            <XAxis dataKey="name" tick={{ fill: "#3B7597", fontSize: 12 }} />
            <YAxis tick={{ fill: "#3B7597", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #B9E9EE",
                boxShadow: "0 10px 30px rgba(9, 60, 93, 0.12)"
              }}
            />
            <Legend />
            <Bar dataKey="FP" fill="#3B7597" radius={[4, 4, 0, 0]} />
            <Bar dataKey="UCP" fill="#5DF8D8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
