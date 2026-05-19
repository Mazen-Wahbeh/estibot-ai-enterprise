import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import {
  fetchPortfolioAnalytics,
  fetchProjectAnalytics,
  fetchProjects,
  requestApproval,
  type PortfolioAnalytics,
  type ProjectAnalytics,
  type ProjectSummary
} from "@/services/apiClient";

function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function number(value: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value);
}

export default function AnalyticsPage() {
  const [portfolio, setPortfolio] = useState<PortfolioAnalytics | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    void Promise.all([fetchPortfolioAnalytics(), fetchProjects()])
      .then(([analyticsPayload, projectsPayload]) => {
        setPortfolio(analyticsPayload.analytics);
        setProjects(projectsPayload.projects);
        const firstProject = projectsPayload.projects[0]?.id ?? "";
        setSelectedProjectId(firstProject);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load analytics."));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectAnalytics(null);
      return;
    }
    void fetchProjectAnalytics(selectedProjectId)
      .then((payload) => setProjectAnalytics(payload.analytics))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load project analytics."));
  }, [selectedProjectId]);

  const selectedCurrency = projectAnalytics?.currency ?? "USD";

  const riskData = useMemo(
    () =>
      projectAnalytics
        ? [
            { name: "Low", value: projectAnalytics.estimateRange.low },
            { name: "Most likely", value: projectAnalytics.estimateRange.mostLikely },
            { name: "High", value: projectAnalytics.estimateRange.high }
          ]
        : [],
    [projectAnalytics]
  );

  const onRequestApproval = async () => {
    if (!selectedProjectId) {
      return;
    }
    setApprovalMessage(null);
    await requestApproval(selectedProjectId, "Commercial analytics review requested.");
    setApprovalMessage("Approval checkpoint created for this project.");
  };

  return (
    <>
      <Head>
        <title>Analytics | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto max-w-7xl space-y-5">
            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Commercial Analytics</h1>
                  <p className="mt-2 max-w-3xl text-sm text-accent-600">
                    Portfolio health, risk ranges, estimate accuracy, Monte Carlo confidence, and sector benchmarking for sales and delivery teams.
                  </p>
                </div>
                <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-accent-500">
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            </section>

            <section className="grid gap-3 md:grid-cols-4">
              {[
                ["Estimated portfolio", portfolio ? money(portfolio.totals.estimatedCost, selectedCurrency) : "Loading"],
                ["Effort hours", portfolio ? number(portfolio.totals.estimatedEffortHours) : "Loading"],
                ["High-risk projects", portfolio ? String(portfolio.totals.highRiskProjects) : "Loading"],
                ["Avg accuracy delta", portfolio?.totals.averageAccuracyPercent === null || !portfolio ? "No actuals" : `${portfolio.totals.averageAccuracyPercent}%`]
              ].map(([label, value]) => (
                <article key={label} className="rounded-lg border border-line bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-accent-600">{label}</p>
                  <p className="mt-3 text-2xl font-semibold">{value}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Portfolio Trend</h2>
                <div className="mt-4 h-[290px]">
                  {mounted && portfolio ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={portfolio.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#B9E9EE" />
                        <XAxis dataKey="month" tick={{ fill: "#3B7597", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#3B7597", fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="estimatedCost" stroke="#093C5D" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg bg-panel text-sm text-accent-600">No estimation history yet.</div>
                  )}
                </div>
              </article>

              <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Sector Mix</h2>
                <div className="mt-4 h-[290px]">
                  {mounted && portfolio ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolio.bySector}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#B9E9EE" />
                        <XAxis dataKey="sector" tick={{ fill: "#3B7597", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#3B7597", fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="estimatedCost" fill="#6FD1D7" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg bg-panel text-sm text-accent-600">No sectors yet.</div>
                  )}
                </div>
              </article>
            </section>

            {projectAnalytics ? (
              <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{projectAnalytics.name}</h2>
                      <p className="mt-1 text-sm text-accent-600">{projectAnalytics.sectorTemplate.name}</p>
                    </div>
                    <span className="rounded-md bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">{projectAnalytics.latestEstimate.confidenceLevel}</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-panel p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">Low</p>
                      <p className="mt-2 font-semibold">{money(projectAnalytics.estimateRange.low, projectAnalytics.currency)}</p>
                    </div>
                    <div className="rounded-lg bg-brand-50 p-3">
                      <p className="text-xs font-semibold uppercase text-brand-700">Likely</p>
                      <p className="mt-2 font-semibold">{money(projectAnalytics.estimateRange.mostLikely, projectAnalytics.currency)}</p>
                    </div>
                    <div className="rounded-lg bg-panel p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">High</p>
                      <p className="mt-2 font-semibold">{money(projectAnalytics.estimateRange.high, projectAnalytics.currency)}</p>
                    </div>
                  </div>
                  <div className="mt-5 h-[220px]">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#B9E9EE" />
                          <XAxis dataKey="name" tick={{ fill: "#3B7597", fontSize: 12 }} />
                          <YAxis tick={{ fill: "#3B7597", fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#093C5D" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                  <button type="button" onClick={onRequestApproval} className="mt-4 w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
                    Request approval checkpoint
                  </button>
                  {approvalMessage ? <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{approvalMessage}</p> : null}
                </article>

                <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">Delivery Intelligence</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-panel p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">P80 Cost</p>
                      <p className="mt-2 font-semibold">{money(projectAnalytics.monteCarlo.p80Cost, projectAnalytics.currency)}</p>
                    </div>
                    <div className="rounded-lg bg-panel p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">P90 Cost</p>
                      <p className="mt-2 font-semibold">{money(projectAnalytics.monteCarlo.p90Cost, projectAnalytics.currency)}</p>
                    </div>
                    <div className="rounded-lg bg-panel p-3">
                      <p className="text-xs font-semibold uppercase text-accent-600">P80 Duration</p>
                      <p className="mt-2 font-semibold">{projectAnalytics.monteCarlo.p80DurationMonths} mo</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold">Method comparison</p>
                      <div className="mt-3 space-y-2">
                        {projectAnalytics.methodComparison.map((item) => (
                          <div key={item.method} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                            <span>{item.method}</span>
                            <span className="font-semibold">{number(item.effortHours)} h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Recommendations</p>
                      <ul className="mt-3 space-y-2 text-sm text-accent-700">
                        {projectAnalytics.recommendations.map((item) => (
                          <li key={item} className="rounded-lg bg-panel px-3 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </section>
            ) : null}
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
