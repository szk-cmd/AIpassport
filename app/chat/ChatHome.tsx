"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { activeTrips, useStore, type StoreData, type StoredTrip } from "@/lib/trip-store";

// แท็บแชท: ทริปที่กำลังเที่ยว 1 ทริป → ไปแชทนั้นเลย, หลายทริป → รายการแชทแบบ LINE,
// ไม่มี → หน้าว่างพร้อมปุ่มสร้างทริป
export function ChatHome() {
  const data = useStore();
  const router = useRouter();
  const active = data ? activeTrips(data) : [];
  const only = active.length === 1 ? active[0].id : null;

  useEffect(() => {
    if (only) router.replace(`/trip/${only}/chat`);
  }, [only, router]);

  if (!data || only) return null;

  if (active.length > 1) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pt-6 pb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold">แชท</h1>
          <Link href="/start" className="text-sm font-medium text-gold hover:underline">
            + ทริปใหม่
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-cream/10">
          {active.map((t) => (
            <li key={t.id}>
              <ChatRow trip={t} data={data} />
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-6xl" aria-hidden>
        💬
      </span>
      <h1 className="mt-4 text-2xl font-semibold">ยังไม่มีทริปที่กำลังเที่ยว</h1>
      <p className="mt-2 text-cream/70">สร้างทริปแล้วเล่าเรื่อง ส่งรูป หรือจดค่าใช้จ่ายระหว่างเที่ยวได้ที่นี่</p>
      <Link
        href="/start"
        className="mt-6 block w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
      >
        + สร้างทริปใหม่
      </Link>
    </main>
  );
}

function ChatRow({ trip, data }: { trip: StoredTrip; data: StoreData }) {
  const last = data.messages[trip.id]?.at(-1);
  const preview = last?.text ?? (last?.photos ? `📷 ${last.photos.length} รูป` : "เริ่มเล่าเรื่องทริปได้เลย");
  const time = last ? new Date(last.at).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "";

  return (
    <Link href={`/trip/${trip.id}/chat`} className="flex items-center gap-3 py-3 hover:bg-cream/5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-2xl" aria-hidden>
        ✈️
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-heading text-lg font-semibold">{trip.title}</p>
          <span className="shrink-0 text-xs text-cream/50">{time}</span>
        </div>
        <p className="truncate text-sm text-cream/60">{preview}</p>
      </div>
    </Link>
  );
}
