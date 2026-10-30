import type { Metadata } from "next";
import { Suspense } from "react";
import { ReceiveLoader, Waiting } from "@/components/receive/Receive";

export const metadata: Metadata = {
  title: "A little bouquet for you",
  description: "Someone made something special for you. Tap to unwrap your digital bouquet.",
  openGraph: {
    title: "Someone made something special for you",
    description: "Tap to unwrap your little bouquet.",
    images: [{ url: "/og-gift.png", width: 1200, height: 630, alt: "A wrapped bouquet with a gift tag" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-gift.png"] },
  robots: { index: false, follow: false },
};

export default function BouquetPage({ params }: PageProps<"/b/[id]">) {
  return (
    <Suspense fallback={<Waiting />}>
      <ReceiveLoader params={params} />
    </Suspense>
  );
}
