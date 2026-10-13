"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CardStack } from "@/components/cards/CardStack";
import { Stamp } from "@/components/cards/Stamp";
import { LogoMark } from "@/components/Logo";
import { Photo } from "@/components/Photo";
import { formatBaht, formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_TRIPS } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";

// เผื่อที่ให้หัวหน้า (โลโก้ + สรุป) ปุ่มเลื่อนการ์ด และปุ่มสร้างทริปใหม่ด้านล่าง
const CARD_HEIGHT = "min(calc(100dvh - 330px), 620px)";

export function TripsView() {
  // /trips?demo=empty ใช้ดูหน้าตอนผู้ใช้ยังไม่มีทริป
  const trips = useSearchParams().get("demo") === "empty" ? [] : MOCK_TRIPS;

  const places = new Set(trips.flatMap((t) => t.summary.route.map((p) => p.name)));
  const totalDays = trips.reduce((sum, t) => sum + t.summary.stats.days, 0);

  return (
    <main className="flex min-h-dvh flex-col px-4 pt-6 pb-24">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-cream p-1">
            <LogoMark size={28} />
          </div>
          <p className="font-heading text-sm tracking-widest text-gold">YOUR TRIPS</p>
        </div>
        <h1 className="mt-2 text-3xl font-semibold">ทริปของคุณ</h1>
        {trips.length > 0 && (
          <p className="mt-1 text-cream/70">
            {trips.length} ทริป · {places.size} สถานที่ · {totalDays} วันเที่ยว
          </p>
        )}
      </div>

      {trips.length === 0 ? (
        <EmptyState />
      ) : (
        <CardStack
          height={CARD_HEIGHT}
          cards={trips.map((t, i) => (
            <TripCard key={t.slug} slug={t.slug} s={t.summary} number={trips.length - i} />
          ))}
        />
      )}

      {/* ---------- ปุ่มสร้างทริปใหม่ (ติดล่างจอ) ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-brown via-brown to-transparent px-4 pt-6 pb-5">
        <Link
          href="/plan"
          className="mx-auto block w-full max-w-md rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream"
        >
          + สร้างทริปใหม่
        </Link>
      </div>
    </main>
  );
}

// การ์ด 1 ใบ = 1 ทริป แตะเพื่อเข้าไปดูข้อมูลทริป
function TripCard({ slug, s, number }: { slug: string; s: TripSummary; number: number }) {
  const cover = getPhoto(s.cover_photo_id);
  return (
    // draggable=false: กันเบราว์เซอร์ลากลิงก์เอง จะได้ปัดการ์ดได้
    <Link href={`/t/${slug}`} draggable={false} className="relative block h-full text-cream">
      {cover && (
        <div className="absolute inset-0">
          <Photo photo={cover} className="h-full w-full" hidePlace />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-brown" />

      <span className="absolute top-[5cqw] left-[5cqw] rounded-full bg-black/30 px-[3cqw] py-[1cqw] text-[3.4cqw] backdrop-blur-sm">
        ทริปที่ {number}
      </span>
      <Stamp
        label={s.route[0]?.name ?? s.title}
        sub={formatDateRange(s.start_date, s.end_date)}
        color="#E8A93C"
        className="absolute top-[4cqw] right-[4cqw] w-[28cqw]"
      />

      <div className="absolute inset-x-0 bottom-0 p-[6cqw]">
        <h2 className="text-[10cqw] leading-tight font-bold">{s.title}</h2>
        <p className="mt-[1cqw] text-[4.2cqw] text-cream/85">{formatDateRange(s.start_date, s.end_date)}</p>
        <div className="mt-[4cqw] flex flex-wrap gap-x-[4cqw] gap-y-[1cqw] text-[3.8cqw] text-cream/90">
          <span>📍 {s.stats.places} สถานที่</span>
          <span>📷 {s.stats.photos} รูป</span>
          <span>💰 {formatBaht(s.expenses.total)}</span>
        </div>
        <p className="mt-[5cqw] text-[3.6cqw] font-medium text-gold">แตะเพื่อดูทริป →</p>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <section className="mx-auto mt-10 flex w-full max-w-md flex-col items-center rounded-3xl border-2 border-dashed border-cream/20 px-6 py-12 text-center">
      <div className="rounded-3xl bg-cream p-3 opacity-90">
        <LogoMark size={72} />
      </div>
      <p className="mt-5 font-heading text-xl font-semibold">ยังไม่มีทริป</p>
      <p className="mt-2 text-cream/70">
        เริ่มทริปแรกของคุณ แล้วหนังสือเดินทาง
        <br />
        แห่งความทรงจำจะมาอยู่ที่นี่
      </p>
    </section>
  );
}
