import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Nunito } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Bloom — your little flower shop",
    template: "%s · Bloom",
  },
  description:
    "Pick flowers, arrange a bouquet, wrap it in pretty paper, write a note and send it to someone you love — all for free, all digital.",
  applicationName: "Bloom",
  openGraph: {
    title: "Bloom — your little flower shop",
    description: "Make a digital bouquet for someone you love.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "A wrapped bouquet of pastel flowers" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#fff9f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}>
      <body className="paper-grain min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
