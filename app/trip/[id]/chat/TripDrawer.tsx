"use client";

import { Plus } from "lucide-react";
import { ButtonLink, cx, ListItem, Sheet } from "@/components/ui";
import { formatDateRange } from "@/lib/format";
import { activeTrips, type StoreData, type StoredTrip } from "@/lib/trip-store";

type Props = { open: boolean; onClose: () => void; data: StoreData; currentId: string };

function href(t: StoredTrip) {
  if (t.status === "completed") return `/t/${t.slug}`;
  return `/trip/${t.id}/chat`; // แชทยังเปิดอ่านได้ทุกสถานะ
}

// ลิ้นชักรายการทริป (ปุ่มเมนูในแชท)
export function TripDrawer({ open, onClose, data, currentId }: Props) {
  const active = activeTrips(data);
  const others = data.trips
    .filter((t) => t.status !== "active")
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  return (
    <Sheet open={open} onClose={onClose} title="ทริปของฉัน">
      <ButtonLink href="/start" onClick={onClose} block variant="secondary" icon={Plus}>
        สร้างทริปใหม่
      </ButtonLink>

      {active.length > 0 && (
        <TripGroup label="กำลังเที่ยว" trips={active} currentId={currentId} onClose={onClose} />
      )}
      {others.length > 0 && (
        <TripGroup label="ทริปที่ผ่านมา" trips={others} currentId={currentId} onClose={onClose} />
      )}
    </Sheet>
  );
}

function TripGroup({
  label,
  trips,
  currentId,
  onClose,
}: {
  label: string;
  trips: StoredTrip[];
  currentId: string;
  onClose: () => void;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-1 font-sans text-caption font-semibold text-ink-muted">{label}</h3>
      <ul className="-mx-4">
        {trips.map((t) => (
          // ปิดลิ้นชักเมื่อเลือกทริป (คลิกที่แถวทั้งแถว)
          <li key={t.id} onClick={onClose}>
            <ListItem
              href={href(t)}
              title={t.title}
              subtitle={formatDateRange(t.start_date, t.end_date)}
              className={cx(t.id === currentId && "bg-surface")}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
