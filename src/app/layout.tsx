import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Vocadex — Learn English Words | PLKSHS",
  description:
    "Vocadex is an English vocabulary and exercise platform for students of P.L.K. Siu Hon Sum Primary School.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d9a441",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* English display type: Momo Trust Sans (Comic Sans is the fallback) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Momo+Trust+Sans:wght@400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
