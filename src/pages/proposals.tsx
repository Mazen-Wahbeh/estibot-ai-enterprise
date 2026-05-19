import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchProjects, fetchProposals, generateProposal, type ProjectSummary, type ProposalRecord } from "@/services/apiClient";

function parseContent(proposal: ProposalRecord): Record<string, unknown> {
  if (proposal.content) {
    return proposal.content;
  }
  try {
    return JSON.parse(proposal.contentJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default function ProposalsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProposals = async (projectId: string) => {
    if (!projectId) {
      setProposals([]);
      return;
    }
    const payload = await fetchProposals(projectId);
    setProposals(payload.proposals);
  };

  useEffect(() => {
    void fetchProjects()
      .then(async (payload) => {
        setProjects(payload.projects);
        const firstProjectId = payload.projects[0]?.id ?? "";
        setSelectedProjectId(firstProjectId);
        await loadProposals(firstProjectId);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load projects."));
  }, []);

  const onProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setError(null);
    try {
      await loadProposals(projectId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load proposals.");
    }
  };

  const onGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await generateProposal(selectedProjectId, title || undefined);
      await loadProposals(selectedProjectId);
      setTitle("");
      setMessage("Commercial proposal generated from project analytics.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate proposal.");
    }
  };

  return (
    <>
      <Head>
        <title>Proposals | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[360px_1fr]">
            <form onSubmit={onGenerate} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h1 className="text-xl font-semibold">Proposal Builder</h1>
              <p className="mt-2 text-sm text-accent-600">Create an SOW-ready commercial proposal from estimate ranges, sector assumptions, risks, and next steps.</p>
              <label className="mt-4 block text-sm font-semibold" htmlFor="project">
                Project
              </label>
              <select id="project" value={selectedProjectId} onChange={(event) => void onProjectChange(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <label className="mt-4 block text-sm font-semibold" htmlFor="title">
                Proposal title
              </label>
              <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional custom title" className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-500" />
              <button type="submit" className="mt-5 w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
                Generate proposal
              </button>
              {message ? <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}
              {error ? <p className="mt-3 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            </form>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Generated Proposals</h2>
              <div className="mt-5 space-y-4">
                {proposals.map((proposal) => {
                  const content = parseContent(proposal);
                  const estimate = content.estimate as { currency?: string; costRange?: { low: number; mostLikely: number; high: number } } | undefined;
                  const recommendations = Array.isArray(content.recommendations) ? content.recommendations : [];
                  return (
                    <article key={proposal.id} className="rounded-lg border border-line bg-panel p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <p className="mt-1 text-sm text-accent-600">{String(content.executiveSummary ?? "Commercial proposal draft")}</p>
                        </div>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-accent-700">{proposal.status}</span>
                      </div>
                      {estimate?.costRange ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-lg bg-white p-3 text-sm">
                            <p className="text-xs font-semibold uppercase text-accent-600">Low</p>
                            <p className="mt-1 font-semibold">{estimate.currency} {estimate.costRange.low}</p>
                          </div>
                          <div className="rounded-lg bg-brand-50 p-3 text-sm">
                            <p className="text-xs font-semibold uppercase text-brand-700">Likely</p>
                            <p className="mt-1 font-semibold">{estimate.currency} {estimate.costRange.mostLikely}</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 text-sm">
                            <p className="text-xs font-semibold uppercase text-accent-600">High</p>
                            <p className="mt-1 font-semibold">{estimate.currency} {estimate.costRange.high}</p>
                          </div>
                        </div>
                      ) : null}
                      <ul className="mt-4 space-y-2 text-sm text-accent-700">
                        {recommendations.slice(0, 3).map((item) => (
                          <li key={String(item)} className="rounded-lg bg-white px-3 py-2">
                            {String(item)}
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
                {proposals.length === 0 ? <p className="text-sm text-accent-600">No proposals generated for this project yet.</p> : null}
              </div>
            </section>
          </div>
        </main>
      </RequireAuth>
    </>
  );
}
