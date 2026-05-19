import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import {
  fetchAdvancedPortfolioAnalytics,
  fetchAdvancedProjectAnalytics,
  fetchProjects,
  type AdvancedPortfolioAnalytics,
  type AdvancedProjectAnalytics,
  type ProjectSummary
} from "@/services/apiClient";

function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function metric(value: number, suffix = ""): string {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value)}${suffix}`;
}

export default function AdvancedAnalyticsPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<AdvancedPortfolioAnalytics | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [analytics, setAnalytics] = useState<AdvancedProjectAnalytics | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    void Promise.all([fetchAdvancedPortfolioAnalytics(), fetchProjects()])
      .then(([advancedPayload, projectsPayload]) => {
        setPortfolio(advancedPayload.analytics);
        setProjects(projectsPayload.projects);
        setSelectedProjectId(projectsPayload.projects[0]?.id ?? "");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load advanced analytics."));
  }, []);

  useEffect(() => {
    if (!router.isReady || projects.length === 0) {
      return;
    }
    const queryProjectId = typeof router.query.projectId === "string" ? router.query.projectId : "";
    if (queryProjectId && projects.some((project) => project.id === queryProjectId)) {
      setSelectedProjectId(queryProjectId);
    }
  }, [projects, router.isReady, router.query.projectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setAnalytics(null);
      return;
    }
    void fetchAdvancedProjectAnalytics(selectedProjectId)
      .then((payload) => setAnalytics(payload.analytics))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load project analytics."));
  }, [selectedProjectId]);

  const comparisonData = useMemo(
    () =>
      analytics
        ? [
            { name: "Baseline", cost: analytics.baseline.cost, effort: analytics.baseline.effortHours },
            { name: "COCOMO II", cost: analytics.cocomo.cost, effort: analytics.cocomo.effortHours },
            { name: "COSMIC", cost: analytics.cosmic.cost, effort: analytics.cosmic.effortHours }
          ]
        : [],
    [analytics]
  );

  const radarData = useMemo(
    () =>
      analytics
        ? [
            { subject: "Risk", value: analytics.risk.score },
            { subject: "Volatility", value: analytics.volatility.volatilityIndex },
            { subject: "Margin", value: analytics.profitability.grossMarginPercent },
            { subject: "Capacity", value: Math.min(100, analytics.capacity.capacityCoveragePercent) },
            { subject: "CPI", value: analytics.evm.available ? Math.min(100, analytics.evm.cpi * 100) : 0 }
          ]
        : [],
    [analytics]
  );

  const portfolioRiskData = portfolio?.projects.map((item) => ({
    name: item.name.length > 18 ? `${item.name.slice(0, 18)}...` : item.name,
    risk: item.risk.score,
    margin: item.profitability.grossMarginPercent
  })) ?? [];

  return (
    <>
      <Head>
        <title>Advanced Analytics | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto max-w-7xl space-y-5">
            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Advanced Estimation Analytics</h1>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-accent-600">
                    COCOMO II, approximate COSMIC sizing, profitability, EVM, team capacity, requirements volatility, scope creep, and benchmarking on top of FP/UCP.
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

            <section className="grid gap-3 md:grid-cols-5">
              {[
                ["Risk score", portfolio ? metric(portfolio.totals.averageRiskScore) : "Loading"],
                ["Critical projects", portfolio ? String(portfolio.totals.criticalProjects) : "Loading"],
                ["Avg margin", portfolio ? metric(portfolio.totals.averageMarginPercent, "%") : "Loading"],
                ["Pipeline", portfolio ? money(portfolio.totals.totalRecommendedPipeline, analytics?.currency ?? "USD") : "Loading"],
                ["Capacity coverage", portfolio ? metric(portfolio.totals.averageCapacityCoveragePercent, "%") : "Loading"]
              ].map(([label, value]) => (
                <article key={label} className="rounded-lg border border-line bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-accent-600">{label}</p>
                  <p className="mt-3 text-xl font-semibold">{value}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Portfolio Risk and Margin</h2>
                <div className="mt-4 h-[290px]">
                  {mounted && portfolioRiskData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={portfolioRiskData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#B9E9EE" />
                        <XAxis dataKey="name" tick={{ fill: "#3B7597", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#3B7597", fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="risk" stroke="#093C5D" strokeWidth={3} />
                        <Line type="monotone" dataKey="margin" stroke="#5DF8D8" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg bg-panel text-sm text-accent-600">Create estimates to populate portfolio analytics.</div>
                  )}
                </div>
              </article>

              <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Executive Signal Radar</h2>
                <div className="mt-4 h-[290px]">
                  {mounted && analytics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#B9E9EE" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#3B7597", fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fill: "#3B7597", fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#093C5D" fill="#6FD1D7" fillOpacity={0.45} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg bg-panel text-sm text-accent-600">Select a project.</div>
                  )}
                </div>
              </article>
            </section>

            {analytics ? (
              <>
                <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Parametric Model Comparison</h2>
                    <div className="mt-4 h-[300px]">
                      {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#B9E9EE" />
                            <XAxis dataKey="name" tick={{ fill: "#3B7597", fontSize: 12 }} />
                            <YAxis tick={{ fill: "#3B7597", fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="cost" fill="#093C5D" radius={[5, 5, 0, 0]} />
                            <Bar dataKey="effort" fill="#6FD1D7" radius={[5, 5, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : null}
                    </div>
                  </article>

                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Commercial Readiness</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs font-semibold uppercase text-accent-600">Recommended price</p>
                        <p className="mt-2 text-xl font-semibold">{money(analytics.profitability.recommendedPrice, analytics.currency)}</p>
                      </div>
                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs font-semibold uppercase text-accent-600">Total with VAT</p>
                        <p className="mt-2 text-xl font-semibold">{money(analytics.profitability.totalClientPrice, analytics.currency)}</p>
                      </div>
                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs font-semibold uppercase text-accent-600">Margin</p>
                        <p className="mt-2 text-xl font-semibold">{metric(analytics.profitability.grossMarginPercent, "%")}</p>
                      </div>
                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs font-semibold uppercase text-accent-600">Contingency</p>
                        <p className="mt-2 text-xl font-semibold">{money(analytics.profitability.contingencyReserve, analytics.currency)}</p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-accent-700">
                      {analytics.executiveSignals.map((signal) => (
                        <li key={signal} className="rounded-lg border border-line bg-panel px-3 py-2">
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </article>
                </section>

                <section className="grid gap-5 lg:grid-cols-3">
                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">COCOMO II</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>Mode: <span className="font-semibold">{analytics.cocomo.mode}</span></p>
                      <p>Estimated KLOC: <span className="font-semibold">{analytics.cocomo.estimatedKloc}</span></p>
                      <p>Person-months: <span className="font-semibold">{analytics.cocomo.effortPersonMonths}</span></p>
                      <p>Effort hours: <span className="font-semibold">{metric(analytics.cocomo.effortHours)}</span></p>
                      <p>Cost: <span className="font-semibold">{money(analytics.cocomo.cost, analytics.currency)}</span></p>
                    </div>
                  </article>

                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">COSMIC Approximation</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>Domain fit: <span className="font-semibold">{analytics.cosmic.domainFit}</span></p>
                      <p>CFP: <span className="font-semibold">{analytics.cosmic.approximateCfp}</span></p>
                      <p>Entries / Exits: <span className="font-semibold">{analytics.cosmic.dataMovements.entries} / {analytics.cosmic.dataMovements.exits}</span></p>
                      <p>Reads / Writes: <span className="font-semibold">{analytics.cosmic.dataMovements.reads} / {analytics.cosmic.dataMovements.writes}</span></p>
                      <p>Cost: <span className="font-semibold">{money(analytics.cosmic.cost, analytics.currency)}</span></p>
                    </div>
                  </article>

                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">EVM Snapshot</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>Status: <span className="font-semibold">{analytics.evm.status}</span></p>
                      <p>CPI: <span className="font-semibold">{analytics.evm.available ? analytics.evm.cpi : "No actuals"}</span></p>
                      <p>SPI: <span className="font-semibold">{analytics.evm.available ? analytics.evm.spi : "No actuals"}</span></p>
                      <p>Cost variance: <span className="font-semibold">{money(analytics.evm.costVariance, analytics.currency)}</span></p>
                      <p>EAC: <span className="font-semibold">{money(analytics.evm.estimateAtCompletion, analytics.currency)}</span></p>
                    </div>
                  </article>
                </section>

                <section className="grid gap-5 lg:grid-cols-3">
                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Risk Drivers</h2>
                    <p className="mt-2 text-3xl font-semibold">{analytics.risk.score}</p>
                    <p className="mt-1 text-sm font-semibold text-accent-700">{analytics.risk.level}</p>
                    <ul className="mt-4 space-y-2 text-sm text-accent-700">
                      {analytics.risk.drivers.map((item) => (
                        <li key={item} className="rounded-lg bg-panel px-3 py-2">{item}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Team Capacity</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>Required FTE: <span className="font-semibold">{analytics.capacity.requiredFte}</span></p>
                      <p>Available team: <span className="font-semibold">{analytics.capacity.availableTeamSize}</span></p>
                      <p>Coverage: <span className="font-semibold">{metric(analytics.capacity.capacityCoveragePercent, "%")}</span></p>
                      <p>Delivery at current team: <span className="font-semibold">{analytics.capacity.deliveryMonthsAtCurrentTeam} mo</span></p>
                    </div>
                    <p className="mt-4 rounded-lg bg-panel px-3 py-2 text-sm text-accent-700">{analytics.capacity.recommendation}</p>
                  </article>

                  <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Scope and Benchmark</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>Versions: <span className="font-semibold">{analytics.volatility.versionCount}</span></p>
                      <p>Cost change: <span className="font-semibold">{metric(analytics.volatility.costChangePercent, "%")}</span></p>
                      <p>Volatility index: <span className="font-semibold">{analytics.volatility.volatilityIndex}</span></p>
                      <p>Scope creep: <span className="font-semibold">{analytics.volatility.scopeCreepLevel}</span></p>
                      <p>Vs sector cost: <span className="font-semibold">{metric(analytics.benchmark.costVsSectorPercent, "%")}</span></p>
                    </div>
                  </article>
                </section>
              </>
            ) : null}
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
