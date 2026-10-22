"use client";

import { ChevronRight, MapPin, MessageCircle, Plus, Stamp as StampIcon } from "lucide-react";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { ButtonLink, Card, Chip, EmptyState, ICON, ListItem, StatRow, StatTile } from "@/components/ui";
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
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 pt-8 pb-8">
        <h1 className="font-sans text-title font-semibold">ทริปของฉัน</h1>

        {data.trips.length === 0 ? (
          <EmptyState
            icon={StampIcon}
            title="พาสปอร์ตเล่มแรกยังว่างอยู่"
            description="สร้างทริปแล้วเล่าเรื่องระหว่างเที่ยวผ่านแชท จบทริปเมื่อไร AI จะรวมเล่มให้เอง"
            action={
              <div className="space-y-2">
                <ButtonLink href="/start" block icon={Plus}>
                  สร้างทริปใหม่
                </ButtonLink>
                <ButtonLink href={`/t/${MOCK_SLUG}`} block variant="ghost">
                  ดูทริปตัวอย่างก่อน
                </ButtonLink>
              </div>
            }
            className="mt-8"
          />
        ) : (
          <>
            {/* ทริปที่กำลังเที่ยว ปักไว้บนสุด (ค้างไว้ได้หลายทริป สรุปเมื่อกดจบทริปเท่านั้น) */}
            {active.length > 0 && (
              <section className="mt-6 space-y-4">
                {active.map((t) => (
                  <ActiveCard key={t.id} trip={t} data={data} />
                ))}
              </section>
            )}

            <ButtonLink href="/start" block icon={Plus} className="mt-6">
              สร้างทริปใหม่
            </ButtonLink>

            {past.length > 0 && <Summary trips={past} />}

            {past.length > 0 && (
              <section className="mt-12">
                <h2 className="font-sans text-heading font-semibold">ทริปที่ผ่านมา</h2>
                <Card padded={false} className="mt-4 overflow-hidden">
                  <ul className="divide-y divide-line">
                    {past.map((t) => (
                      <li key={t.id}>
                        <PastTripRow trip={t} data={data} />
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// การ์ดปกทริปที่กำลังเที่ยว (ที่เดียวในหน้านี้ที่ใช้น้ำตาลแบรนด์)
function ActiveCard({ trip, data }: { trip: StoredTrip; data: StoreData }) {
  const total = dayCount(trip.start_date, trip.end_date);
  const day = Math.min(Math.max(dayCount(trip.start_date, todayKey()), 1), total);
  const overdue = todayKey() > trip.end_date;
  const last = data.messages[trip.id]?.at(-1);
  const preview = last?.text ?? (last?.photos ? `ส่งรูป ${last.photos.length} รูป` : "เริ่มเล่าเรื่องทริปได้เลย");

  return (
    <Link
      href={`/trip/${trip.id}/chat`}
      className="block rounded-card bg-brown p-6 text-white shadow-soft transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center justify-between text-caption">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-semibold">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          กำลังเที่ยว
        </span>
        <span className="text-white/60">{overdue ? "เลยวันจบแล้ว · รอกดจบทริป" : `วันที่ ${day} จาก ${total}`}</span>
      </div>
      <p className="mt-4 text-heading font-semibold">{trip.title}</p>
      <p className="text-label text-white/60">{formatDateRange(trip.start_date, trip.end_date)}</p>
      <div className="mt-4 flex items-center gap-2 text-label text-white/80">
        <MessageCircle {...ICON} size={16} className="shrink-0 text-white/50" />
        <span className="min-w-0 flex-1 truncate">{preview}</span>
        <ChevronRight {...ICON} className="shrink-0 text-white/50" />
      </div>
    </Link>
  );
}

// ตัวเลขสรุป + ชิปสถานที่ที่เคยไป (นับจากทริปที่สรุปแล้ว)
function Summary({ trips }: { trips: StoredTrip[] }) {
  const summaries = trips.map((t) => (t.slug ? getTripBySlug(t.slug)?.summary : undefined)).filter((s) => s !== undefined);
  const places = [...new Set(summaries.flatMap((s) => s.route.map((p) => p.name)))];
  const days = trips.reduce((sum, t) => sum + dayCount(t.start_date, t.end_date), 0);

  return (
    <section className="mt-12">
      <StatRow>
        <StatTile value={trips.length} label="ทริป" />
        <StatTile value={places.length} label="สถานที่" />
        <StatTile value={days} label="วันเที่ยว" />
      </StatRow>
      {places.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {places.map((p) => (
            <Chip key={p} icon={MapPin}>
              {p}
            </Chip>
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
    <ListItem
      href={tripHref(trip)}
      leading={
        <span className="block size-12 overflow-hidden rounded-control">
          {cover ? <Photo photo={cover} hidePlace className="size-full" /> : <ChatThumb photo={chatPhoto} />}
        </span>
      }
      title={trip.title}
      subtitle={formatDateRange(trip.start_date, trip.end_date)}
      trailing={label && <span className="font-semibold text-warning">{label}</span>}
    />
  );
}

function ChatThumb({ photo }: { photo?: { thumb: string | null; color: string } }) {
  if (photo?.thumb) {
    // eslint-disable-next-line @next/next/no-img-element -- รูปย่อจากแชทในเครื่อง
    return <img src={photo.thumb} alt="" className="size-full object-cover" />;
  }
  return <span className="block size-full" style={{ background: photo?.color ?? "#1E6B63" }} />;
}
