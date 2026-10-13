import type { Metadata } from "next";
import Link from "next/link";
import { CardStack } from "@/components/cards/CardStack";
import { CoverCard, DayCard, StatsCard } from "@/components/cards/TripCards";
import { MOCK_SUMMARY } from "@/lib/mock";

export const metadata: Metadata = { title: `${MOCK_SUMMARY.title} – PassportAI` };

// MOCK: ยังไม่อ่าน slug จาก URL ใช้ทริปตัวอย่างเสมอ
export default function TripCardsPage() {
  const s = MOCK_SUMMARY;

  // ชั่วคราว: การ์ดที่ยังไม่ได้ใส่เนื้อหา
  const todo = ["ค่าใช้จ่าย", "สถานที่ทั้งหมด", "แชร์"].map((label) => (
    <div key={label} className="flex h-full items-center justify-center p-6">
      <p className="font-heading text-[8cqw] font-semibold text-brown/40">{label}</p>
    </div>
  ));

  const cards = [
    <CoverCard key="cover" s={s} />,
    <StatsCard key="stats" s={s} />,
    ...s.days.map((day, i) => <DayCard key={day.date} day={day} index={i} />),
    ...todo,
  ];

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
