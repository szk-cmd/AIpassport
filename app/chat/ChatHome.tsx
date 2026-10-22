"use client";

import { MessageCircle, Plane, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ButtonLink, Card, EmptyState, ICON, ListItem } from "@/components/ui";
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

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 pt-8 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="font-sans text-title font-semibold">แชท</h1>
          {active.length > 1 && (
            <ButtonLink href="/start" size="sm" variant="ghost" icon={Plus}>
              ทริปใหม่
            </ButtonLink>
          )}
        </div>

        {active.length > 1 ? (
          <Card padded={false} className="mt-6 overflow-hidden">
            <ul className="divide-y divide-line">
              {active.map((t) => (
                <li key={t.id}>
                  <ChatRow trip={t} data={data} />
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="ยังไม่มีทริปที่กำลังเที่ยว"
            description="สร้างทริปแล้วเล่าเรื่อง ส่งรูป หรือจดค่าใช้จ่ายระหว่างเที่ยวได้ที่นี่"
            action={
              <ButtonLink href="/start" block icon={Plus}>
                สร้างทริปใหม่
              </ButtonLink>
            }
            className="mt-8"
          />
        )}
      </main>
    </div>
  );
}

function ChatRow({ trip, data }: { trip: StoredTrip; data: StoreData }) {
  const last = data.messages[trip.id]?.at(-1);
  const preview = last?.text ?? (last?.photos ? `ส่งรูป ${last.photos.length} รูป` : "เริ่มเล่าเรื่องทริปได้เลย");
  const time = last ? new Date(last.at).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "";

  return (
    <ListItem
      href={`/trip/${trip.id}/chat`}
      leading={
        <span className="flex size-12 items-center justify-center rounded-full bg-brown text-white">
          <Plane {...ICON} />
        </span>
      }
      title={trip.title}
      subtitle={preview}
      trailing={time}
    />
  );
}
