import type { Metadata } from "next";
import { Studio } from "@/components/studio/Studio";

export const metadata: Metadata = { title: "Bouquet studio" };

export default function StudioPage() {
  return <Studio />;
}
