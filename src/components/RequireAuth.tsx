import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/state/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      void router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-panel text-ink">
        <div className="rounded-lg border border-line bg-white px-5 py-4 text-sm shadow-sm">Loading secure workspace...</div>
      </main>
    );
  }

  return <>{children}</>;
}
