"use client";

import Link from "next/link";
import { Stamp, STAMP_COLORS } from "@/components/cards/Stamp";
import { LogoMark } from "@/components/Logo";
import { Photo } from "@/components/Photo";
import { formatDateRange } from "@/lib/format";
import { getPhoto, getTripBySlug, MOCK_SLUG } from "@/lib/mock";
import { activeTrips, dayCount, todayKey, useStore, type StoreData, type StoredTrip } from "@/lib/trip-store";

const STATUS_LABEL = { ended: "รอชำระเงิน", paid: "กำลังสร้างพาสปอร์ต", completed: null, active: null } as const;

function tripHref(t: StoredTrip) {
  if (t.status === "active") return `/trip/${t.id}/chat`;
  if (t.status === "ended") return `/trip/${t.id}/checkout`;
  if (t.status === "paid") return `/trip/${t.id}/progress`;
  return `/t/${t.slug}`;
}

// ประวัติทริปของผู้ใช้ (หน้าแรกหลัง login)
export function TripHistory() {
  const data = useStore();
  if (!data) return null;

  const active = activeTrips(data);
  const past = data.trips.filter((t) => t.status !== "active").sort((a, b) => b.start_date.localeCompare(a.start_date));

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-6 pb-8">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-cream p-1">
          <LogoMark size={28} />
        </div>
        <p className="font-heading text-sm tracking-widest text-gold">MY TRIPS</p>
      </div>
      <h1 className="mt-2 text-3xl font-semibold">ทริปของฉัน</h1>

      {data.trips.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ทริปที่กำลังเที่ยว ปักไว้บนสุด (ค้างไว้ได้หลายทริป สรุปเมื่อกดจบทริปเท่านั้น) */}
          {active.map((t) => (
            <ActiveCard key={t.id} trip={t} data={data} />
          ))}
          <NewTripButton />
          {past.length > 0 && <Summary trips={past} />}

          <section className="mt-8">
            <h2 className="text-lg font-semibold">ทริปที่ผ่านมา</h2>
            <ul className="mt-3 space-y-3">
              {past.map((t) => (
                <li key={t.id}>
                  <PastTripRow trip={t} data={data} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

// การ์ด "กำลังเที่ยว" ปักไว้บนสุด
function ActiveCard({ trip, data }: { trip: StoredTrip; data: StoreData }) {
  const total = dayCount(trip.start_date, trip.end_date);
  const day = Math.min(Math.max(dayCount(trip.start_date, todayKey()), 1), total);
  const overdue = todayKey() > trip.end_date;
  const last = data.messages[trip.id]?.at(-1);
  const preview = last?.text ?? (last?.photos ? `📷 ${last.photos.length} รูป` : "เริ่มเล่าเรื่องทริปได้เลย");

  return (
    <Link
      href={`/trip/${trip.id}/chat`}
      className="mt-5 block rounded-3xl border-2 border-orange bg-cream p-5 text-brown shadow-xl transition hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-full bg-orange px-3 py-1 text-xs font-semibold text-cream">
          <span className="size-2 animate-pulse rounded-full bg-cream" aria-hidden />
          กำลังเที่ยว
        </span>
        <span className="text-sm text-brown/60">{overdue ? "เลยวันจบแล้ว · รอกดจบทริป" : `วันที่ ${day} จาก ${total}`}</span>
      </div>
      <p className="mt-3 font-heading text-2xl font-semibold">{trip.title}</p>
      <p className="text-sm text-brown/60">{formatDateRange(trip.start_date, trip.end_date)}</p>
      <p className="mt-3 truncate rounded-xl bg-brown/5 px-3 py-2 text-sm text-brown/80">💬 {preview}</p>
      <p className="mt-3 text-right font-medium text-teal">เปิดแชท →</p>
    </Link>
  );
}

function NewTripButton() {
  return (
    <Link
      href="/start"
      className="mt-5 block w-full rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream shadow-lg"
    >
      + สร้างทริปใหม่
    </Link>
  );
}

// ตัวเลขสรุป + ชิปสถานที่ที่เคยไป (นับจากทริปที่สรุปแล้ว)
function Summary({ trips }: { trips: StoredTrip[] }) {
  const summaries = trips.map((t) => (t.slug ? getTripBySlug(t.slug)?.summary : undefined)).filter((s) => s !== undefined);
  const places = [...new Set(summaries.flatMap((s) => s.route.map((p) => p.name)))];
  const days = trips.reduce((sum, t) => sum + dayCount(t.start_date, t.end_date), 0);
  const stats = [
    { value: trips.length, label: "ทริป" },
    { value: places.length, label: "สถานที่" },
    { value: days, label: "วันเที่ยว" },
  ];

  return (
    <section className="mt-6">
      <div className="grid grid-cols-3 divide-x divide-cream/15 rounded-2xl bg-cream/5 py-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-heading text-3xl font-semibold text-gold">{s.value}</p>
            <p className="text-sm text-cream/70">{s.label}</p>
          </div>
        ))}
      </div>
      {places.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {places.map((p) => (
            <span key={p} className="rounded-full border border-cream/20 px-3 py-1 text-sm text-cream/85">
              📍 {p}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function PastTripRow({ trip, data }: { trip: StoredTrip; data: StoreData }) {
  const summary = trip.slug ? getTripBySlug(trip.slug)?.summary : undefined;
  const cover = summary ? getPhoto(summary.cover_photo_id) : undefined;
  const chatPhoto = data.messages[trip.id]?.flatMap((m) => m.photos ?? [])[0];
  const label = STATUS_LABEL[trip.status];

  return (
    <Link href={tripHref(trip)} className="flex items-center gap-3 rounded-2xl bg-cream p-2 pr-4 text-brown">
      <div className="size-16 shrink-0 overflow-hidden rounded-xl">
        {cover ? (
          <Photo photo={cover} hidePlace className="size-full" />
        ) : (
          <ChatThumb photo={chatPhoto} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-lg font-semibold">{trip.title}</p>
        <p className="text-sm text-brown/60">{formatDateRange(trip.start_date, trip.end_date)}</p>
      </div>
      {label ? (
        <span className="shrink-0 rounded-full bg-gold/25 px-2.5 py-1 text-xs font-medium">{label}</span>
      ) : (
        <span className="text-brown/40" aria-hidden>
          →
        </span>
      )}
    </Link>
  );
}

function ChatThumb({ photo }: { photo?: { thumb: string | null; color: string } }) {
  if (photo?.thumb) {
    // eslint-disable-next-line @next/next/no-img-element -- รูปย่อจากแชทในเครื่อง
    return <img src={photo.thumb} alt="" className="size-full object-cover" />;
  }
  return <div className="size-full" style={{ background: photo?.color ?? "#1E6B63" }} />;
}

// ผู้ใช้ใหม่ยังไม่มีทริป
function EmptyState() {
  return (
    <section className="mt-8 flex flex-col items-center text-center">
      <div className="relative h-48 w-64" aria-hidden>
        <Stamp label="ทริปแรก" sub="WELCOME" className="absolute top-0 left-2 w-32" color={STAMP_COLORS[0]} rotate={-10} />
        <Stamp
          label="รอคุณอยู่"
          shape="rect"
          className="absolute top-14 right-0 w-36"
          color={STAMP_COLORS[1]}
          rotate={8}
        />
        <Stamp label="✈" className="absolute bottom-0 left-16 w-20" color="#E8A93C" rotate={-4} />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">พาสปอร์ตเล่มแรกยังว่างอยู่</h2>
      <p className="mt-2 text-cream/70">
        สร้างทริปแล้วเล่าเรื่องระหว่างเที่ยวผ่านแชท
        <br />
        จบทริปเมื่อไร AI จะรวมเล่มให้เอง
      </p>
      <div className="mt-6 w-full">
        <NewTripButton />
      </div>
      <Link href={`/t/${MOCK_SLUG}`} className="mt-4 text-sm text-cream/70 underline hover:text-cream">
        ดูทริปตัวอย่างก่อน
      </Link>
    </section>
  );
}
