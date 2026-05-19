import Head from "next/head";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchAuditLogs, type AuditEntry } from "@/services/apiClient";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs()
      .then((payload) => setLogs(payload.logs))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load audit logs."));
  }, []);

  return (
    <>
      <Head>
        <title>Audit | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <section className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Audit Trail</h1>
            <p className="mt-2 text-sm text-accent-600">Tenant-level activity feed for governance, security review, and enterprise sales readiness.</p>
            {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            <div className="mt-6 overflow-hidden rounded-lg border border-line">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-panel text-xs uppercase text-accent-600">
                  <tr>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Entity</th>
                    <th className="px-3 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-line">
                      <td className="px-3 py-3 text-accent-600">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-3 font-semibold">{log.action}</td>
                      <td className="px-3 py-3">{log.entity}</td>
                      <td className="max-w-[320px] truncate px-3 py-3 text-accent-600">{log.metadata}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </RequireAuth>
    </>
  );
}
