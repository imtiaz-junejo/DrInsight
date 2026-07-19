import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";
import "@/styles/responsive.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "DrInsight – Trusted Medical Information & Consultations",
  description:
    "Evidence-based medical information, health tools, and expert doctor consultations. Your trusted healthcare partner.",
  icons: {
    icon: [
      { url: "/assets/logo/favicons/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
      { url: "/assets/logo/favicons/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo/favicons/favicon-48x48.png?v=3", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/assets/logo/favicons/favicon-32x32.png?v=3",
    apple: [
      { url: "/assets/logo/favicons/favicon-180x180.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/assets/logo/favicons/site.webmanifest?v=3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
