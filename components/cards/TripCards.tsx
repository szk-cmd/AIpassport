// เนื้อหาการ์ดแต่ละใบใน /t/[slug] ขนาดทุกอย่างใช้ cqw (% ของความกว้างการ์ด) จึงย่อ/ขยายตามจอ
import { Photo } from "@/components/Photo";
import { RouteLine } from "@/components/RouteMap";
import { formatBaht, formatDateRange } from "@/lib/format";
import { getPhoto } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";
import { Stamp } from "./Stamp";

// ---------- 1) ปก ----------
export function CoverCard({ s }: { s: TripSummary }) {
  const cover = getPhoto(s.cover_photo_id);
  return (
    <div className="relative h-full text-cream">
      {cover && (
        <div className="absolute inset-0">
          <Photo photo={cover} className="h-full w-full" hidePlace />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-brown" />

      <Stamp
        label="PassportAI"
        sub="YOUR TRIP, FOREVER"
        color="#E8A93C"
        rotate={-14}
        className="absolute top-[5cqw] right-[5cqw] w-[30cqw]"
      />

      <div className="absolute inset-x-0 bottom-0 p-[7cqw]">
        <p className="text-[3.4cqw] tracking-[0.35em] text-cream/75">TRIP SUMMARY</p>
        <h1 className="mt-[1cqw] text-[11cqw] leading-tight font-bold">{s.title}</h1>
        <p className="mt-[1cqw] text-[4.6cqw] text-cream/85">{formatDateRange(s.start_date, s.end_date)}</p>
        <p className="mt-[6cqw] text-[3.6cqw] text-gold">← ปัดซ้ายเพื่อเปิดดูทริป</p>
      </div>
    </div>
  );
}

// ---------- 2) สรุปตัวเลข ----------
export function StatsCard({ s }: { s: TripSummary }) {
  const stats = [
    { value: s.stats.days, label: "วัน" },
    { value: s.stats.places, label: "สถานที่" },
    { value: s.stats.photos, label: "รูป" },
    { value: formatBaht(s.expenses.total), label: "ค่าใช้จ่าย" },
  ];
  return (
    <div className="flex h-full flex-col p-[7cqw]">
      <CardLabel>สรุปทริป</CardLabel>
      <h2 className="text-[7cqw] font-bold">{s.title}</h2>

      <div className="my-[6cqw] grid flex-1 grid-cols-2 grid-rows-2 gap-[4cqw]">
        {stats.map((st) => {
          const long = String(st.value).length > 4; // เช่น ฿4,130 ให้ตัวเล็กลงไม่ล้นกล่อง
          return (
            <div key={st.label} className="flex flex-col justify-center rounded-[4cqw] bg-brown/5 px-[4cqw]">
              <p
                className={`font-heading leading-none font-bold text-orange ${long ? "text-[8.5cqw]" : "text-[15cqw]"}`}
              >
                {st.value}
              </p>
              <p className="mt-[2cqw] text-[4cqw] text-brown/70">{st.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-[4cqw] border-t border-brown/10 pt-[5cqw]">
        <div className="w-[26cqw] shrink-0">
          <RouteLine route={s.route} width={120} height={90} color="#1E6B63" />
        </div>
        <div className="text-[3.8cqw] leading-relaxed text-brown/75">
          <p>
            ระยะทางรวม <b className="text-brown">{s.stats.distance_km} กม.</b>
          </p>
          <p>
            เฉลี่ยวันละ <b className="text-brown">{formatBaht(Math.round(s.expenses.total / s.stats.days))}</b>
          </p>
        </div>
      </div>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[3.4cqw] tracking-[0.3em] text-teal">{children}</p>;
}
