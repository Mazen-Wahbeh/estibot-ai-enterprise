import Head from "next/head";
import Link from "next/link";

const plans = [
  ["FREE", "$0", "3 estimations/month", "Limited PDF export", "Basic portfolio analytics", "FP or UCP estimation"],
  ["PRO", "$29", "Unlimited estimations", "Full PDF export", "FP + UCP + BOTH", "COCOMO II, COSMIC, profitability, and charts"],
  ["ENTERPRISE", "Custom", "Team collaboration", "API access", "EVM, benchmarking, capacity planning, and governance", "Priority processing"]
];

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing | EstiBot AI SaaS</title>
      </Head>
      <main className="min-h-screen bg-panel px-5 py-12 text-ink">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Pricing</h1>
              <p className="mt-2 text-accent-600">Billing-ready plans for estimation teams, sales operations, PMO governance, and enterprise delivery analytics.</p>
            </div>
            <Link href="/" className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-accent-600">
              Home
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map(([name, price, ...items]) => (
              <article key={name} className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold">{name}</h2>
                <p className="mt-2 text-3xl font-semibold">{price}</p>
                <ul className="mt-5 space-y-3 text-sm text-accent-600">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href="/register" className="mt-6 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
                  Choose {name}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
