import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useAuth } from "@/state/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, loading } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register(email, password, organizationName || undefined);
    void router.push("/dashboard");
  };

  return (
    <>
      <Head>
        <title>Register | EstiBot AI SaaS</title>
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-panel px-4 text-ink">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold">Create workspace</h1>
          <p className="mt-2 text-sm text-accent-600">Start on the Free plan with tenant-isolated projects and usage tracking.</p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="organization">
            Organization
          </label>
          <input id="organization" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100" placeholder="Acme Software" autoComplete="organization" />
          <label className="mt-4 block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100" required autoComplete="email" />
          <label className="mt-4 block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100" required minLength={10} autoComplete="new-password" />
          <p className="mt-2 text-xs leading-5 text-accent-600">Use at least 10 characters with uppercase, lowercase, number, and symbol.</p>
          {error ? <p className="mt-4 rounded-md border border-line bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:bg-line">
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="mt-4 text-center text-sm text-accent-600">
            Already registered?{" "}
            <Link className="font-semibold text-ink" href="/login">
              Login
            </Link>
          </p>
        </form>
      </main>
    </>
  );
}
