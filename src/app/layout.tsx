import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

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
    <html data-theme="dark" lang="en" suppressHydrationWarning>
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
