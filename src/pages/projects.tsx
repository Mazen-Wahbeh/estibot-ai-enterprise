import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { createProject, fetchProjects, fetchTemplates, type ProjectSummary, type SectorTemplate } from "@/services/apiClient";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<"FP" | "UCP" | "BOTH">("BOTH");
  const [hourlyRate, setHourlyRate] = useState(50);
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("GLOBAL");
  const [clientName, setClientName] = useState("");
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [sector, setSector] = useState("SAAS");
  const [teamSize, setTeamSize] = useState(3);
  const [vatRate, setVatRate] = useState(0);
  const [templates, setTemplates] = useState<SectorTemplate[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchProjects();
      setProjects(payload.projects);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    void fetchTemplates().then((payload) => setTemplates(payload.templates)).catch(() => setTemplates([]));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createProject({ name, description, method, hourlyRate, currency, country, clientName: clientName || undefined, riskLevel, sector, teamSize, vatRate });
      setName("");
      setDescription("");
      setMethod("BOTH");
      setHourlyRate(50);
      setCurrency("USD");
      setCountry("GLOBAL");
      setClientName("");
      setRiskLevel("MEDIUM");
      setSector("SAAS");
      setTeamSize(3);
      setVatRate(0);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create project.");
    }
  };

  return (
    <>
      <Head>
        <title>Projects | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[360px_1fr]">
            <form onSubmit={onSubmit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h1 className="text-xl font-semibold">Create Market-Ready Project</h1>
              <p className="mt-2 text-sm text-accent-600">Capture commercial settings up front for local VAT, currency, risk, and client-ready reports.</p>
              <label className="mt-4 block text-sm font-semibold" htmlFor="client-name">
                Client name
              </label>
              <input id="client-name" value={clientName} onChange={(event) => setClientName(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" />
              <label className="mt-4 block text-sm font-semibold" htmlFor="project-name">
                Name
              </label>
              <input id="project-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" required />
              <label className="mt-4 block text-sm font-semibold" htmlFor="project-description">
                Description
              </label>
              <textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-[120px] w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" required />
              <label className="mt-4 block text-sm font-semibold" htmlFor="method">
                Method
              </label>
              <select id="method" value={method} onChange={(event) => setMethod(event.target.value as "FP" | "UCP" | "BOTH")} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500">
                <option value="BOTH">BOTH</option>
                <option value="FP">FP</option>
                <option value="UCP">UCP</option>
              </select>
              <label className="mt-4 block text-sm font-semibold" htmlFor="rate">
                Hourly rate
              </label>
              <input id="rate" type="number" value={hourlyRate} onChange={(event) => setHourlyRate(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" min={1} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold" htmlFor="country">
                  Country
                  <select id="country" value={country} onChange={(event) => setCountry(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-accent-500">
                    {["GLOBAL", "SA", "AE", "QA", "KW", "JO", "EG", "US", "GB", "EU"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold" htmlFor="currency">
                  Currency
                  <select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-accent-500">
                    {["USD", "SAR", "AED", "QAR", "KWD", "JOD", "EGP", "EUR", "GBP"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold" htmlFor="sector">
                  Sector
                  <select id="sector" value={sector} onChange={(event) => setSector(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-accent-500">
                    {(templates.length > 0 ? templates : [{ id: "SAAS", name: "B2B SaaS product" }]).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold" htmlFor="team-size">
                  Team size
                  <input id="team-size" type="number" value={teamSize} onChange={(event) => setTeamSize(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-accent-500" min={1} max={500} />
                </label>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold" htmlFor="risk">
                  Risk
                  <select id="risk" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as "LOW" | "MEDIUM" | "HIGH")} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-accent-500">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold" htmlFor="vat">
                  VAT %
                  <input id="vat" type="number" value={vatRate} onChange={(event) => setVatRate(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-accent-500" min={0} max={100} />
                </label>
              </div>
              <button type="submit" className="mt-5 w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
                Create
              </button>
            </form>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Project History</h2>
              {error ? <p className="mt-3 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
              {loading ? <p className="mt-5 text-sm text-accent-600">Loading projects...</p> : null}
              <div className="mt-5 grid gap-3">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-lg border border-line bg-panel p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.clientName ? <p className="mt-1 text-xs font-semibold text-accent-700">{project.clientName}</p> : null}
                        <p className="mt-1 text-sm text-accent-600">{project.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{project.method}</span>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-600">{project.sector}</span>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-600">{project.currency}</span>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-600">{project.riskLevel}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-accent-600">Team {project.teamSize} · Updated {new Date(project.updatedAt).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
