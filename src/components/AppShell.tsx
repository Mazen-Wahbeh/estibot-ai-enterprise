import { ChatPanel } from "@/components/ChatPanel";
import { Dashboard } from "@/components/Dashboard";
import { ProgressTracker } from "@/components/ProgressTracker";
import { StateSidebar } from "@/components/StateSidebar";

export function AppShell() {
  return (
    <main className="min-h-screen bg-panel text-ink">
      <div className="mx-auto grid max-w-[1800px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)] xl:grid-cols-[280px_minmax(0,1.35fr)_420px]">
        <div className="space-y-5 xl:sticky xl:top-5 xl:order-1 xl:self-start">
          <ProgressTracker />
        </div>
        <div className="space-y-5 xl:order-2">
          <ChatPanel />
          <Dashboard />
        </div>
        <div className="min-h-0 xl:sticky xl:top-5 xl:order-3 xl:self-start">
          <StateSidebar />
        </div>
      </div>
    </main>
  );
}
