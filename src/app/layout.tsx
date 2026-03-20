import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"]
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "https://cruxd.in";

export const metadata: Metadata = {
  title: {
    default: "Cruxd — Call it before the crowd",
    template: "%s | Cruxd"
  },
  description: "Predict yes/no outcomes on real events — elections, cricket, world events. No real money. Play coins only. 18+.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: "Cruxd",
    title: "Cruxd — Call it before the crowd",
    description: "Predict yes/no outcomes on real events — elections, cricket, world events. No real money. Play coins only. 18+.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cruxd — Call it before the crowd" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cruxd — Call it before the crowd",
    description: "Predict yes/no outcomes on real events — elections, cricket, world events. No real money. Play coins only. 18+.",
    images: ["/opengraph-image"]
  },
  keywords: ["prediction market", "India", "elections 2026", "forecasting", "play money", "cricket", "West Bengal", "Tamil Nadu"],
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#000000"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      className={`${jakarta.variable} ${mono.variable}`}
      data-theme="dark"
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (() => {
              try {
                const storedTheme = window.localStorage.getItem("cruxd-theme");
                const nextTheme = storedTheme === "light" ? "light" : "dark";
                document.documentElement.dataset.theme = nextTheme;
              } catch {
                document.documentElement.dataset.theme = "dark";
              }
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
