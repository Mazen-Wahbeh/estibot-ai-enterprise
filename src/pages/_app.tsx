import type { AppProps } from "next/app";
import { EstimationProvider } from "@/state/EstimationContext";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EstimationProvider>
      <Component {...pageProps} />
    </EstimationProvider>
  );
}
