import type { Metadata } from "next";
import Link from "next/link";
import { PlanForm } from "./PlanForm";

export const metadata: Metadata = { title: "เลือกแพ็กเกจ – PassportAI" };

export default function PlanPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <Link href="/trips" className="text-sm text-cream/70 hover:text-cream">
        ← ทริปของคุณ
      </Link>
      <h1 className="mt-2 text-3xl font-semibold">เลือกแพ็กเกจ</h1>
      <p className="mt-2 text-cream/70">จ่ายต่อ 1 ทริป ไม่มีรายเดือน ช่วงทดลองเปิดให้ใช้แพ็กเกจฟรีก่อน</p>
      <PlanForm />
    </main>
  );
}
