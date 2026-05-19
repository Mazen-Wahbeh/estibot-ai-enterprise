import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchAdvancedProjectAnalytics, fetchProjectAnalytics, fetchProjects, saveActualResult, type AdvancedProjectAnalytics, type ProjectAnalytics, type ProjectSummary } from "@/services/apiClient";

function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export default function ActualsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedProjectAnalytics | null>(null);
  const [actualEffortHours, setActualEffortHours] = useState(160);
  const [actualDurationMonths, setActualDurationMonths] = useState(1);
  const [actualCost, setActualCost] = useState(8000);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (projectId: string) => {
    const [projectPayload, advancedPayload] = await Promise.all([fetchProjectAnalytics(projectId), fetchAdvancedProjectAnalytics(projectId)]);
    setAnalytics(projectPayload.analytics);
    setAdvancedAnalytics(advancedPayload.analytics);
  }, []);

  useEffect(() => {
    void fetchProjects()
      .then((payload) => {
        setProjects(payload.projects);
        setSelectedProjectId(payload.projects[0]?.id ?? "");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load projects."));
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
      setAdvancedAnalytics(null);
      return;
    }
    void loadAnalytics(selectedProjectId)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load analytics."));
  }, [loadAnalytics, selectedProjectId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await saveActualResult({ projectId: selectedProjectId, actualEffortHours, actualDurationMonths, actualCost, notes });
      await loadAnalytics(selectedProjectId);
      setMessage("Actual result saved and calibration plus EVM metrics updated.");
      setNotes("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save actual result.");
    }
  };

  return (
    <>
      <Head>
        <title>Actuals | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[380px_1fr]">
            <form onSubmit={onSubmit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h1 className="text-xl font-semibold">Actuals Tracking</h1>
              <p className="mt-2 text-sm text-accent-600">Capture delivery reality so EstiBot can update estimate accuracy, calibration deltas, and earned value signals.</p>
              <label className="mt-4 block text-sm font-semibold" htmlFor="project">
                Project
              </label>
              <select id="project" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <label className="mt-4 block text-sm font-semibold" htmlFor="effort">
                Actual effort hours
              </label>
              <input id="effort" type="number" value={actualEffortHours} onChange={(event) => setActualEffortHours(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" min={1} />
              <label className="mt-4 block text-sm font-semibold" htmlFor="duration">
                Actual duration months
              </label>
              <input id="duration" type="number" value={actualDurationMonths} onChange={(event) => setActualDurationMonths(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" min={0.1} step={0.1} />
              <label className="mt-4 block text-sm font-semibold" htmlFor="cost">
                Actual cost
              </label>
              <input id="cost" type="number" value={actualCost} onChange={(event) => setActualCost(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" min={0} />
              <label className="mt-4 block text-sm font-semibold" htmlFor="notes">
                Notes
              </label>
              <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-[110px] w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" />
              <button type="submit" className="mt-5 w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
                Save actuals
              </button>
              {message ? <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}
              {error ? <p className="mt-3 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            </form>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Calibration Summary</h2>
                  <p className="mt-1 text-sm text-accent-600">Actuals feed both variance tracking and EVM status for the selected project.</p>
                </div>
                {selectedProjectId ? (
                  <Link href={`/advanced-analytics?projectId=${encodeURIComponent(selectedProjectId)}`} className="rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-accent-700">
                    Advanced view
                  </Link>
                ) : null}
              </div>
              {analytics ? (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-panel p-4">
                      <p className="text-xs font-semibold uppercase text-accent-600">Cost variance</p>
                      <p className="mt-2 text-2xl font-semibold">{analytics.accuracy.costVariancePercent === null ? "N/A" : `${analytics.accuracy.costVariancePercent}%`}</p>
                    </div>
                    <div className="rounded-lg bg-panel p-4">
                      <p className="text-xs font-semibold uppercase text-accent-600">Effort variance</p>
                      <p className="mt-2 text-2xl font-semibold">{analytics.accuracy.effortVariancePercent === null ? "N/A" : `${analytics.accuracy.effortVariancePercent}%`}</p>
                    </div>
                    <div className="rounded-lg bg-panel p-4">
                      <p className="text-xs font-semibold uppercase text-accent-600">Duration variance</p>
                      <p className="mt-2 text-2xl font-semibold">{analytics.accuracy.durationVariancePercent === null ? "N/A" : `${analytics.accuracy.durationVariancePercent}%`}</p>
                    </div>
                  </div>
                  {advancedAnalytics ? (
                    <div className="mt-5 rounded-lg border border-line bg-brand-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-brand-700">Earned Value Management</p>
                          <p className="mt-2 text-2xl font-semibold">{advancedAnalytics.evm.status}</p>
                        </div>
                        <div className="grid gap-2 text-sm sm:grid-cols-3">
                          <span className="rounded-md bg-white px-3 py-2 font-semibold">CPI {advancedAnalytics.evm.available ? advancedAnalytics.evm.cpi : "N/A"}</span>
                          <span className="rounded-md bg-white px-3 py-2 font-semibold">SPI {advancedAnalytics.evm.available ? advancedAnalytics.evm.spi : "N/A"}</span>
                          <span className="rounded-md bg-white px-3 py-2 font-semibold">EAC {money(advancedAnalytics.evm.estimateAtCompletion, advancedAnalytics.currency)}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5 overflow-hidden rounded-lg border border-line">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-panel text-xs uppercase text-accent-600">
                        <tr>
                          <th className="px-3 py-2">Actual cost</th>
                          <th className="px-3 py-2">Effort</th>
                          <th className="px-3 py-2">Duration</th>
                          <th className="px-3 py-2">Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.actuals.map((actual) => (
                          <tr key={`${actual.createdAt}-${actual.actualCost}`} className="border-t border-line">
                            <td className="px-3 py-2">{actual.actualCost}</td>
                            <td className="px-3 py-2">{actual.actualEffortHours} h</td>
                            <td className="px-3 py-2">{actual.actualDurationMonths} mo</td>
                            <td className="px-3 py-2">{actual.accuracyDeltaPercent === null ? "N/A" : `${actual.accuracyDeltaPercent}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-accent-600">Select a project to view calibration.</p>
              )}
            </section>
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
