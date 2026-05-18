import Head from "next/head";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <>
      <Head>
        <title>EstiBot AI Enterprise</title>
        <meta name="description" content="AI-powered software project estimation platform using FP and UCP analysis." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AppShell />
    </>
  );
}
