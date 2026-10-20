// เนื้อหาการ์ดแต่ละใบใน /t/[slug] ขนาดทุกอย่างใช้ cqw (% ของความกว้างการ์ด) จึงย่อ/ขยายตามจอ
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { QrCode } from "@/components/QrCode";
import { RouteLine, RouteMap } from "@/components/RouteMap";
import { CATEGORY_LABELS, formatBaht, formatDate, formatDateRange } from "@/lib/format";
import { getPhoto } from "@/lib/mock";
import type { DayStory, ExpenseCategory, TripSummary } from "@/lib/types";
import { CopyLinkButton } from "./CopyLinkButton";
import { seeded, Stamp, STAMP_COLORS } from "./Stamp";

// ---------- 1) ปก ----------
export function CoverCard({ s, hint = true }: { s: TripSummary; hint?: boolean }) {
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
        <p className="mt-[6cqw] text-[3.6cqw] text-gold">
          {hint ? "← ปัดซ้ายเพื่อเปิดดูทริป" : "เลื่อนลงเพื่อดูทริป ↓"}
        </p>
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

// ---------- 3) รายวัน ----------
export function DayCard({ day, index }: { day: DayStory; index: number }) {
  const place = day.places[0] ?? "";
  const photos = day.photo_ids.slice(0, 2).map(getPhoto).filter((p) => p !== undefined);

  return (
    <div className="relative flex h-full flex-col p-[7cqw]">
      <CardLabel>{formatDate(day.date)}</CardLabel>
      <h2 className="text-[7.5cqw] leading-tight font-bold">
        <span className="text-orange">DAY {index + 1}</span> · {place}
      </h2>

      <div className={`mt-[4cqw] grid gap-[2.5cqw] ${photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {photos.map((p) => (
          <Photo
            key={p.id}
            photo={p}
            showCaption
            className={`rounded-[4cqw] ${photos.length > 1 ? "aspect-[3/4]" : "aspect-[4/3]"} [&_p]:text-[3.2cqw]`}
          />
        ))}
      </div>

      <p className="mt-[4cqw] line-clamp-6 text-[4.1cqw] leading-relaxed text-brown/85">{day.story}</p>
      <p className="mt-auto pr-[30cqw] text-[3.3cqw] text-brown/55">📍 {day.places.join(" · ")}</p>

      <Stamp
        label={place}
        sub={formatDate(day.date)}
        shape={index % 2 === 0 ? "circle" : "rect"}
        color={STAMP_COLORS[index % 2]}
        className="pointer-events-none absolute right-[4cqw] bottom-[4cqw] w-[32cqw]"
      />
    </div>
  );
}

// ---------- 4) ค่าใช้จ่าย ----------
const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  transport: "✈️",
  lodging: "🏨",
  food: "🍜",
  activity: "🎟️",
  shopping: "🛍️",
  other: "🧾",
};

export function ExpensesCard({ s }: { s: TripSummary }) {
  const total = s.expenses.total;
  // รวมตามหมวด เรียงจากมากไปน้อย
  const groups = Object.entries(
    s.expenses.items.reduce<Partial<Record<ExpenseCategory, { amount: number; count: number }>>>((acc, e) => {
      const g = acc[e.category] ?? { amount: 0, count: 0 };
      acc[e.category] = { amount: g.amount + e.amount, count: g.count + 1 };
      return acc;
    }, {}),
  ).sort((a, b) => b[1].amount - a[1].amount) as [ExpenseCategory, { amount: number; count: number }][];

  return (
    <div className="flex h-full flex-col p-[7cqw]">
      <CardLabel>ค่าใช้จ่าย</CardLabel>
      <p className="mt-[1cqw] font-heading text-[14cqw] leading-none font-bold text-orange">{formatBaht(total)}</p>
      <p className="mt-[2cqw] text-[3.8cqw] text-brown/60">
        {s.expenses.items.length} รายการ · เฉลี่ยวันละ {formatBaht(Math.round(total / s.stats.days))}
      </p>

      <ul className="mt-[6cqw] flex-1 space-y-[4.5cqw] border-t-2 border-dashed border-brown/20 pt-[5cqw]">
        {groups.map(([cat, g]) => {
          const percent = Math.round((g.amount / total) * 100);
          return (
            <li key={cat}>
              <div className="flex items-baseline justify-between text-[4.2cqw]">
                <span>
                  <span aria-hidden>{CATEGORY_ICONS[cat]}</span> {CATEGORY_LABELS[cat]}
                  <span className="ml-[2cqw] text-[3.2cqw] text-brown/50">{g.count} รายการ</span>
                </span>
                <span className="font-heading font-semibold">{formatBaht(g.amount)}</span>
              </div>
              <div className="mt-[1.5cqw] flex items-center gap-[2cqw]">
                <div className="h-[1.8cqw] flex-1 rounded-full bg-brown/10">
                  <div className="h-full rounded-full bg-teal" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-[9cqw] text-right text-[3.2cqw] text-brown/55">{percent}%</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between border-t-2 border-dashed border-brown/20 pt-[4cqw] font-heading">
        <span className="text-[4.5cqw] font-semibold">รวมทั้งทริป</span>
        <span className="text-[6cqw] font-bold">{formatBaht(total)}</span>
      </div>
    </div>
  );
}

// ---------- 5) สถานที่ทั้งหมด ----------
export function PlacesCard({ s }: { s: TripSummary }) {
  const rows = Math.ceil(s.route.length / 2);

  // หาวันที่ไปแต่ละที่ (ชื่อใน route กับในเรื่องเล่าอาจสั้นยาวต่างกัน)
  const visitedOn = (name: string) =>
    s.days.find((d) => d.places.some((p) => p.includes(name) || name.includes(p)))?.date;

  return (
    <div className="flex h-full flex-col p-[7cqw]">
      <CardLabel>สถานที่ทั้งหมด</CardLabel>
      <h2 className="text-[7cqw] font-bold">
        ไปมาแล้ว <span className="text-orange">{s.route.length}</span> ที่
      </h2>

      {/* วางเป็นตาราง 2 คอลัมน์ แล้วขยับ/เอียงแต่ละอันแบบสุ่มคงที่ ให้ดูเหมือนประทับมือ */}
      <div className="relative mt-[3cqw] flex-1">
        {s.route.map((p, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const date = visitedOn(p.name);
          const jitterX = seeded(p.name, 1) * 10 - 5;
          const jitterY = seeded(p.name, 2) * 6 - 3;
          // แถวสุดท้ายที่มีอันเดียวให้อยู่กลาง
          const alone = i === s.route.length - 1 && s.route.length % 2 === 1;
          return (
            <Stamp
              key={p.name}
              label={p.name}
              sub={date ? formatDate(date) : undefined}
              shape={seeded(p.name, 4) > 0.5 ? "circle" : "rect"}
              color={STAMP_COLORS[i % 2]}
              rotate={Math.round(seeded(p.name, 5) * 30 - 15)}
              className="absolute w-[46%]"
              style={{
                left: `${(alone ? 27 : col * 52) + jitterX}%`,
                top: `${(row / rows) * 100 + jitterY}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------- 6) แชร์ ----------
export function ShareCard({ s, slug }: { s: TripSummary; slug: string }) {
  const path = `/t/${slug}`;
  const buttonClass =
    "flex items-center justify-center rounded-full py-[3.5cqw] text-[4.2cqw] font-heading font-semibold transition";

  return (
    <div className="flex h-full flex-col items-center p-[7cqw] text-center">
      <CardLabel>แชร์ทริป</CardLabel>
      <h2 className="text-[7cqw] font-bold">{s.title}</h2>

      <div className="my-auto flex flex-col items-center py-[4cqw]">
        <div className="w-[56cqw] rounded-[5cqw] bg-white p-[3cqw] shadow-md">
          <QrCode path={path} size={300} fluid light="#FFFFFF" />
        </div>
        <p className="mt-[3cqw] text-[3.8cqw] text-brown/65">ให้เพื่อนสแกนเพื่อเปิดทริปนี้</p>
      </div>

      <div className="grid w-full gap-[3cqw]">
        <CopyLinkButton path={path} className={`${buttonClass} bg-orange text-cream hover:brightness-110`} />
        <div className="grid grid-cols-2 gap-[3cqw]">
          <Link href={`${path}/social`} className={`${buttonClass} border-2 border-brown/15 hover:bg-brown/5`}>
            📱 การ์ดโซเชียล
          </Link>
          <Link href={`${path}/print`} className={`${buttonClass} border-2 border-brown/15 hover:bg-brown/5`}>
            🖼 กรอบรูป
          </Link>
        </div>
        <Link href={`${path}/order`} className={`${buttonClass} border-2 border-brown/15 hover:bg-brown/5`}>
          🖨 สั่งพิมพ์เป็นกรอบรูป
        </Link>
      </div>
      <p className="mt-[5cqw] font-heading text-[3.4cqw] tracking-wider text-brown/45">#PassportAI</p>
    </div>
  );
}

// ---------- แผนที่เส้นทาง (หน้าทริปแบบเลื่อนลง) ----------
export function MapCard({ s }: { s: TripSummary }) {
  return (
    <div className="p-[7cqw]">
      <CardLabel>เส้นทาง</CardLabel>
      <h2 className="mb-[4cqw] text-[7cqw] font-bold">
        {s.route.length} จุด · {s.stats.distance_km} กม.
      </h2>
      <RouteMap route={s.route} />
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[3.4cqw] tracking-[0.3em] text-teal">{children}</p>;
}
