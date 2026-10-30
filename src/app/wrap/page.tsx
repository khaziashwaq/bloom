import type { Metadata } from "next";
import { Customize } from "@/components/screens/Customize";

export const metadata: Metadata = { title: "Wrap your bouquet" };

export default function WrapPage() {
  return <Customize />;
}
