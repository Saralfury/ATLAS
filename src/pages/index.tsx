import Head from "next/head";

import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <>
      <Head>
        <title>ATLAS — Indian Port Risk Command</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <AppShell />
    </>
  );
}
