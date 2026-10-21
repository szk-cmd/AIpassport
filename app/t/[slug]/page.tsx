import type { Metadata } from "next";
import Link from "next/link";
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
    <main className="mx-auto w-full max-w-md px-4 pt-4 pb-12">
      <Link href="/" className="text-sm text-cream/70 hover:text-cream">
        ← ทริปของฉัน
      </Link>
      {/* อ่าน slug จาก URL อยู่ใน Suspense ตามกฎของ Next 16 */}
      <Suspense fallback={<p className="mt-10 text-center text-cream/60">กำลังเปิดทริป...</p>}>
        <TripContent params={params} />
      </Suspense>
    </main>
  );
}

async function TripContent({ params }: { params: PageProps<"/t/[slug]">["params"] }) {
  const { slug } = await params;
  const trip = getTripBySlug(slug); // MOCK: ของจริงจะดึงจากตาราง shares + trip_outputs
  if (!trip) notFound();
  const s = trip.summary;

  // ใช้เนื้อหาชุดเดียวกับการ์ด เรียงต่อกันให้เลื่อนอ่าน
  const sections = [
    { key: "cover", node: <CoverCard s={s} hint={false} />, tall: true },
    { key: "stats", node: <StatsCard s={s} />, tall: true },
    ...s.days.map((day, i) => ({ key: day.date, node: <DayCard day={day} index={i} />, tall: true })),
    { key: "map", node: <MapCard s={s} />, tall: false },
    { key: "expenses", node: <ExpensesCard s={s} />, tall: true },
    { key: "places", node: <PlacesCard s={s} />, tall: true },
    { key: "share", node: <ShareCard s={s} slug={trip.slug} />, tall: true },
  ];

  return (
    <div className="mt-4 space-y-5">
      {sections.map((sec) => (
        <section
          key={sec.key}
          className={`@container overflow-hidden rounded-[28px] bg-cream text-brown shadow-xl shadow-black/30 ${
            sec.tall ? "aspect-[0.62]" : ""
          }`}
        >
          {sec.node}
        </section>
      ))}
    </div>
  );
}
