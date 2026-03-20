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

export const metadata: Metadata = {
  title: "Cruxd",
  description: "Predict outcomes on real events. No real money. Just skill."
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
