import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CoverCard,
  DayCard,
  ExpensesCard,
  MapCard,
  PlacesCard,
  ShareCard,
  StatsCard,
} from "@/components/cards/TripCards";
import { TopBar } from "@/components/ui";
import { getTripBySlug, MOCK_TRIPS } from "@/lib/mock";

// สร้างหน้าของทริปตัวอย่างไว้ล่วงหน้าตอน build
export function generateStaticParams() {
  return MOCK_TRIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  return { title: trip ? `${trip.summary.title} – PassportAI` : "ไม่พบทริป – PassportAI" };
}

export default function TripPage({ params }: PageProps<"/t/[slug]">) {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <TopBar backHref="/" title="ทริปของฉัน" />
      <main className="mx-auto w-full max-w-md px-4 pt-2 pb-12">
        {/* อ่าน slug จาก URL อยู่ใน Suspense ตามกฎของ Next 16 */}
        <Suspense fallback={<p className="mt-10 text-center text-label text-ink-muted">กำลังเปิดทริป...</p>}>
          <TripContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function TripContent({ params }: { params: PageProps<"/t/[slug]">["params"] }) {
  const { slug } = await params;
  const trip = getTripBySlug(slug); // MOCK: ของจริงจะดึงจากตาราง shares + trip_outputs
  if (!trip) notFound();
  const s = trip.summary;

  // การ์ดเรียงต่อกันให้เลื่อนอ่าน ปก → สรุปตัวเลข → รายวัน → แผนที่ → ค่าใช้จ่าย → ตราประทับ → แชร์
  const sections = [
    { key: "cover", node: <CoverCard s={s} /> },
    { key: "stats", node: <StatsCard s={s} /> },
    ...s.days.map((day, i) => ({ key: day.date, node: <DayCard day={day} index={i} /> })),
    { key: "map", node: <MapCard s={s} /> },
    { key: "expenses", node: <ExpensesCard s={s} /> },
    { key: "places", node: <PlacesCard s={s} /> },
    { key: "share", node: <ShareCard s={s} slug={trip.slug} /> },
  ];

  return (
    <div className="mt-2 space-y-4">
      {sections.map((sec) => (
        <section key={sec.key}>{sec.node}</section>
      ))}
    </div>
  );
}
