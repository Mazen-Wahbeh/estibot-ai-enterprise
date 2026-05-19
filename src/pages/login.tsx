import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useAuth } from "@/state/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(email, password);
    const requestedNext = typeof router.query.next === "string" ? router.query.next : "/dashboard";
    const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
    void router.push(next);
  };

  return (
    <>
      <Head>
        <title>Login | EstiBot AI SaaS</title>
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-panel px-4 text-ink">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="mt-2 text-sm text-accent-600">Access your tenant workspace and saved estimations.</p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100" required autoComplete="email" />
          <label className="mt-4 block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100" required autoComplete="current-password" />
          {error ? <p className="mt-4 rounded-md border border-line bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-line">
            {loading ? "Signing in..." : "Login"}
          </button>
          <p className="mt-4 text-center text-sm text-accent-600">
            No account?{" "}
            <Link className="font-semibold text-ink" href="/register">
              Create one
            </Link>
          </p>
        </form>
      </main>
    </>
  );
}
