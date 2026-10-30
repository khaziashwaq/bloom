import type { Metadata } from "next";
import { Collection } from "@/components/screens/Collection";

export const metadata: Metadata = { title: "The flower collection" };

export default function ShopPage() {
  return <Collection />;
}
