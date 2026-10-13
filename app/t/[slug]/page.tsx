import type { Metadata } from "next";
import Link from "next/link";
import { CardStack } from "@/components/cards/CardStack";
import { MOCK_SUMMARY } from "@/lib/mock";

export const metadata: Metadata = { title: `${MOCK_SUMMARY.title} – PassportAI` };

// MOCK: ยังไม่อ่าน slug จาก URL ใช้ทริปตัวอย่างเสมอ
export default function TripCardsPage() {
  const s = MOCK_SUMMARY;

  // ชั่วคราว: การ์ดเปล่าไว้ทดสอบการปัด (จะใส่เนื้อหาทีละประเภทถัดไป)
  const labels = ["ปก", "สรุปตัวเลข", ...s.days.map((_, i) => `วันที่ ${i + 1}`), "ค่าใช้จ่าย", "สถานที่ทั้งหมด", "แชร์"];
  const cards = labels.map((label, i) => (
    <div key={label} className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="font-heading text-[18cqw] font-bold text-orange">{i + 1}</p>
      <p className="font-heading text-[8cqw] font-semibold">{label}</p>
      <p className="text-[4cqw] text-brown/60">ปัดซ้ายเพื่อดูใบถัดไป</p>
    </div>
  ));

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 pt-4">
        <Link href="/trips" className="text-sm text-cream/70 hover:text-cream">
          ← ทริปของคุณ
        </Link>
        <p className="font-heading text-sm text-cream/80">{s.title}</p>
      </header>
      <CardStack cards={cards} />
    </main>
  );
}
