import Head from "next/head";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasCommandCenter } from "@/components/SaasCommandCenter";
import { SaasHeader } from "@/components/SaasHeader";
import { EstimationProvider } from "@/state/EstimationContext";

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <SaasCommandCenter />
        <EstimationProvider>
          <AppShell />
        </EstimationProvider>
      </RequireAuth>
    </>
  );
}
