import Head from "next/head";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const sections = [
  ["Product scope", "EstiBot AI SaaS provides software estimation workflows, analytics, reports, proposals, and governance tools."],
  ["Customer responsibility", "Customers remain responsible for validating inputs, approving final budgets, and reviewing legal or procurement documents."],
  ["Estimation disclaimer", "Outputs are decision-support estimates, not guaranteed delivery prices or timelines."],
  ["Security obligations", "Customers must protect credentials, rotate exposed keys, and configure production environment variables securely."],
  ["Commercial launch note", "Before paid public use, finalize plan terms, support commitments, refund policy, data retention, and jurisdiction-specific clauses."]
];

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms | EstiBot AI SaaS</title>
      </Head>
      <main className="min-h-screen bg-panel px-4 py-6 text-ink">
        <section className="mx-auto max-w-4xl rounded-lg border border-line bg-white p-6 shadow-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            EstiBot AI SaaS
          </Link>
          <h1 className="mt-6 text-3xl font-semibold">Terms of Use</h1>
          <p className="mt-3 text-sm leading-6 text-accent-700">
            These starter terms describe the expected use of the platform. Replace this page with counsel-reviewed legal terms before selling.
          </p>
          <div className="mt-6 space-y-4">
            {sections.map(([title, text]) => (
              <article key={title} className="rounded-lg bg-panel p-4">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-accent-700">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
