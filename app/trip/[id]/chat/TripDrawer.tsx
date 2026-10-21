"use client";

import Link from "next/link";
import { formatDateRange } from "@/lib/format";
import { activeTrip, type StoreData, type StoredTrip } from "@/lib/trip-store";

type Props = { open: boolean; onClose: () => void; data: StoreData; currentId: string };

function href(t: StoredTrip) {
  if (t.status === "completed") return `/t/${t.slug}`;
  return `/trip/${t.id}/chat`; // แชทยังเปิดอ่านได้ทุกสถานะ
}

// ลิ้นชักรายการทริป (ปุ่ม ☰ ในแชท)
export function TripDrawer({ open, onClose, data, currentId }: Props) {
  const active = activeTrip(data);
  const others = data.trips.filter((t) => t !== active).sort((a, b) => b.start_date.localeCompare(a.start_date));

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="ปิด"
      />
      <aside
        className={`absolute inset-y-0 left-0 flex w-4/5 max-w-xs flex-col bg-cream text-brown shadow-2xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brown/10 px-4 py-4">
          <p className="font-heading text-lg font-semibold">ทริปของฉัน</p>
          <button type="button" onClick={onClose} tabIndex={open ? 0 : -1} className="text-2xl" aria-label="ปิด">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {active ? (
            <>
              <p className="px-2 text-xs font-semibold tracking-wider text-orange">กำลังเที่ยว</p>
              <DrawerItem trip={active} current={active.id === currentId} onClose={onClose} open={open} />
            </>
          ) : (
            <Link
              href="/start"
              tabIndex={open ? 0 : -1}
              className="block rounded-xl bg-orange px-4 py-3 text-center font-semibold text-cream"
            >
              + สร้างทริปใหม่
            </Link>
          )}

          {others.length > 0 && (
            <>
              <p className="mt-5 px-2 text-xs font-semibold tracking-wider text-brown/50">ทริปที่ผ่านมา</p>
              {others.map((t) => (
                <DrawerItem key={t.id} trip={t} current={t.id === currentId} onClose={onClose} open={open} />
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function DrawerItem({ trip, current, onClose, open }: { trip: StoredTrip; current: boolean; onClose: () => void; open: boolean }) {
  return (
    <Link
      href={href(trip)}
      onClick={onClose}
      tabIndex={open ? 0 : -1}
      className={`mt-1 block rounded-xl px-3 py-2.5 ${current ? "bg-orange/15" : "hover:bg-brown/5"}`}
    >
      <p className="truncate font-medium">{trip.title}</p>
      <p className="text-xs text-brown/60">{formatDateRange(trip.start_date, trip.end_date)}</p>
    </Link>
  );
}
