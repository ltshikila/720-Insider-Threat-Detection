import type { AppProps } from "next/app";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import ToastOutlet from "@/components/Toast";
import BootSequence from "@/components/BootSequence";
import { JobsProvider } from "@/lib/jobs";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <JobsProvider>
      <Head>
        <title>Soteria · Insider Threat Detection</title>
        <meta
          name="description"
          content="Soteria, AI-powered behavioural classification for insider threat detection."
        />
      </Head>
      <Sidebar />
      <main className="ml-56 min-h-screen px-8 py-8">
        <Component {...pageProps} />
      </main>
      <ToastOutlet />
      <BootSequence />
    </JobsProvider>
  );
}
