import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/state/AuthContext";

export function SaasHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    void router.push("/");
  };

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          EstiBot AI SaaS
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="font-medium text-accent-600 hover:text-ink" href="/dashboard">
            Dashboard
          </Link>
          <Link className="font-medium text-accent-600 hover:text-ink" href="/projects">
            Projects
          </Link>
          <Link className="font-medium text-accent-600 hover:text-ink" href="/billing">
            Billing
          </Link>
          <Link className="font-medium text-accent-600 hover:text-ink" href="/settings">
            Settings
          </Link>
          <Link className="font-medium text-accent-600 hover:text-ink" href="/audit">
            Audit
          </Link>
          {user?.role === "ADMIN" ? (
            <Link className="font-medium text-accent-600 hover:text-ink" href="/admin">
              Admin
            </Link>
          ) : null}
          <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{user?.plan ?? "FREE"}</span>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 font-semibold text-accent-600 transition hover:bg-panel">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
