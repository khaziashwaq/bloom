import type { Metadata } from "next";
import { SendScreen } from "@/components/screens/SendScreen";

export const metadata: Metadata = { title: "Send your bouquet" };

export default function SendPage() {
  return <SendScreen />;
}
