import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgressView } from "./ProgressView";

export const metadata: Metadata = { title: "กำลังสร้าง – PassportAI" };

export default function ProgressPage() {
  return (
    // อ่าน id ทริปจาก URL จึงต้องอยู่ใน Suspense (กฎของ Next 16)
    <Suspense>
      <ProgressView />
    </Suspense>
  );
}
