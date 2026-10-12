import type { Metadata } from "next";
import { ProgressView } from "./ProgressView";

export const metadata: Metadata = { title: "กำลังสร้าง – PassportAI" };

export default function ProgressPage() {
  return <ProgressView />;
}
