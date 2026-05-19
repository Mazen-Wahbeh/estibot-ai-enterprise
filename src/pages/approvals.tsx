import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchApprovals, reviewApproval, type ApprovalRecord } from "@/services/apiClient";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const payload = await fetchApprovals();
    setApprovals(payload.approvals);
  };

  useEffect(() => {
    void load().catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load approvals."));
  }, []);

  const onReview = async (approvalId: string, status: "APPROVED" | "REJECTED") => {
    setError(null);
    setMessage(null);
    try {
      await reviewApproval(approvalId, status, `Estimate ${status.toLowerCase()} from approval console.`);
      await load();
      setMessage(`Approval ${status.toLowerCase()}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to review approval.");
    }
  };

  return (
    <>
      <Head>
        <title>Approvals | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-6xl rounded-lg border border-line bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold">Approval Workflow</h1>
            <p className="mt-2 max-w-3xl text-sm text-accent-600">Review high-risk or low-confidence estimates before proposal and delivery commitment.</p>
            {message ? <p className="mt-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}
            {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            <div className="mt-6 overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel text-xs uppercase text-accent-600">
                  <tr>
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Risk</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Requested</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((approval) => (
                    <tr key={approval.id} className="border-t border-line">
                      <td className="px-3 py-3 font-semibold">{approval.project?.name ?? approval.projectId}</td>
                      <td className="px-3 py-3">{approval.project?.riskLevel ?? "N/A"}</td>
                      <td className="px-3 py-3">{approval.status}</td>
                      <td className="px-3 py-3">{new Date(approval.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => void onReview(approval.id, "APPROVED")} className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                            Approve
                          </button>
                          <button type="button" onClick={() => void onReview(approval.id, "REJECTED")} className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-accent-700">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {approvals.length === 0 ? <p className="p-4 text-sm text-accent-600">No approval requests yet.</p> : null}
            </div>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
