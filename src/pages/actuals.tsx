import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchProjectAnalytics, fetchProjects, saveActualResult, type ProjectAnalytics, type ProjectSummary } from "@/services/apiClient";

export default function ActualsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [actualEffortHours, setActualEffortHours] = useState(160);
  const [actualDurationMonths, setActualDurationMonths] = useState(1);
  const [actualCost, setActualCost] = useState(8000);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchProjects()
      .then((payload) => {
        setProjects(payload.projects);
        setSelectedProjectId(payload.projects[0]?.id ?? "");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load projects."));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setAnalytics(null);
      return;
    }
    void fetchProjectAnalytics(selectedProjectId)
      .then((payload) => setAnalytics(payload.analytics))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load analytics."));
  }, [selectedProjectId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await saveActualResult({ projectId: selectedProjectId, actualEffortHours, actualDurationMonths, actualCost, notes });
      const payload = await fetchProjectAnalytics(selectedProjectId);
      setAnalytics(payload.analytics);
      setMessage("Actual result saved and calibration metrics updated.");
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
              <p className="mt-2 text-sm text-accent-600">Capture delivery reality so EstiBot can show estimate accuracy and calibration deltas.</p>
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
              <h2 className="text-xl font-semibold">Calibration Summary</h2>
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
