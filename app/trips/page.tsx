import type { Metadata } from "next";
import { Suspense } from "react";
import { TripsView } from "./TripsView";

export const metadata: Metadata = { title: "ทริปของคุณ – PassportAI" };

export default function TripsPage() {
  return (
    // TripsView อ่าน ?demo=empty จาก URL จึงต้องอยู่ใน Suspense (กฎของ Next 16)
    <Suspense>
      <TripsView />
    </Suspense>
  );
}
