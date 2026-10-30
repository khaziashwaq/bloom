import type { Metadata } from "next";
import { NoteScreen } from "@/components/screens/NoteScreen";

export const metadata: Metadata = { title: "Write your note" };

export default function NotePage() {
  return <NoteScreen />;
}
