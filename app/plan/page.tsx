import type { Metadata } from "next";
import { PlanForm } from "./PlanForm";

export const metadata: Metadata = { title: "เลือกแพ็กเกจ – PassportAI" };

export default function PlanPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="font-heading text-sm tracking-widest text-gold">PASSPORT AI</p>
      <h1 className="mt-1 text-3xl font-semibold">เลือกแพ็กเกจ</h1>
      <p className="mt-2 text-cream/70">จ่ายต่อ 1 ทริป ไม่มีรายเดือน ช่วงทดลองเปิดให้ใช้แพ็กเกจฟรีก่อน</p>
      <PlanForm />
    </main>
  );
}
