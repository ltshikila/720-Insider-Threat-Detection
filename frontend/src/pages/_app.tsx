import type { AppProps } from "next/app";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Insider Threat Detection</title>
        <meta
          name="description"
          content="AI-powered behavioural classification"
        />
      </Head>
      <Sidebar />
      <main className="ml-56 min-h-screen px-8 py-8">
        <Component {...pageProps} />
      </main>
    </>
  );
}
