import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS — Indian Port Risk Command",
  icons: [{ rel: "icon", url: "/favicon.svg" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
