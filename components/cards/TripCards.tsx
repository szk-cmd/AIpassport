// การ์ดแต่ละใบใน /t/[slug] (ระบบดีไซน์ใหม่: การ์ดขาว มุม 16 เงาเบา ไม่มีเส้นประ ไม่มี emoji)
import {
  BedDouble,
  Image as ImageIcon,
  MapPin,
  Plane,
  Printer,
  Receipt,
  ShoppingBag,
  Smartphone,
  Ticket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Photo } from "@/components/Photo";
import { QrCode } from "@/components/QrCode";
import { RouteLine, RouteMap } from "@/components/RouteMap";
import { ButtonLink, Card, Chip, ICON, StatRow, StatTile } from "@/components/ui";
import { CATEGORY_LABELS, formatBaht, formatDate, formatDateRange } from "@/lib/format";
import { photoOf } from "@/lib/summary";
import type { DayStory, ExpenseCategory, TripSummary } from "@/lib/types";
import { CopyLinkButton } from "./CopyLinkButton";
import { seeded, Stamp } from "./Stamp";

// ตราประทับใช้น้ำตาลแบรนด์ (ตามระบบดีไซน์)
const STAMP_INK = "#2B2019";

function CardHeading({ title, meta }: { title: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-sans text-heading font-semibold text-ink">{title}</h2>
      {meta && <p className="text-label text-ink-muted">{meta}</p>}
    </div>
  );
}

// ---------- 1) ปก (การ์ดปกทริป ใช้น้ำตาลแบรนด์) ----------
export function CoverCard({ s }: { s: TripSummary }) {
  const cover = photoOf(s, s.cover_photo_id);
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-brown text-white shadow-soft">
      {cover && (
        <div className="absolute inset-0">
          <Photo photo={cover} className="h-full w-full" hidePlace />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-brown/10 via-transparent to-brown" />

      <Stamp label="PassportAI" sub="YOUR TRIP, FOREVER" color="#FFFFFF" rotate={-14} className="absolute top-6 right-6 w-24 opacity-80" />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h1 className="font-sans text-title font-semibold">{s.title}</h1>
        <p className="text-label text-white/70">{formatDateRange(s.start_date, s.end_date)}</p>
      </div>
    </div>
  );
}

// ---------- 2) สรุปตัวเลข ----------
export function StatsCard({ s }: { s: TripSummary }) {
  return (
    <Card>
      <CardHeading title="สรุปทริป" />
      <StatRow className="mt-6">
        <StatTile value={s.stats.days} label="วัน" />
        <StatTile value={s.stats.places} label="สถานที่" />
        <StatTile value={s.stats.photos} label="รูป" />
        <StatTile value={formatBaht(s.expenses.total)} label="ค่าใช้จ่าย" />
      </StatRow>

      <div className="mt-6 flex items-center gap-4 rounded-control bg-surface p-4">
        <div className="shrink-0">
          <RouteLine route={s.route} width={80} height={60} color="#57534E" />
        </div>
        <dl className="space-y-1 text-label">
          <div className="flex gap-2">
            <dt className="text-ink-muted">ระยะทางรวม</dt>
            <dd className="font-semibold">{s.stats.distance_km} กม.</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-muted">เฉลี่ยวันละ</dt>
            <dd className="font-semibold">{formatBaht(Math.round(s.expenses.total / s.stats.days))}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

// ---------- 3) รายวัน ----------
export function DayCard({ s, day, index }: { s: TripSummary; day: DayStory; index: number }) {
  const place = day.places[0] ?? "";
  const photos = day.photo_ids
    .slice(0, 2)
    .map((id) => photoOf(s, id))
    .filter((p) => p !== undefined);

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <CardHeading title={day.title} meta={`วันที่ ${index + 1} · ${formatDate(day.date)}`} />
        </div>
        <Stamp
          label={place}
          sub={formatDate(day.date)}
          shape={index % 2 === 0 ? "circle" : "rect"}
          color={STAMP_INK}
          className="pointer-events-none -mt-2 -mr-2 w-20 shrink-0"
        />
      </div>

      <div className={`mt-4 grid gap-2 ${photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {photos.map((p) => (
          <Photo
            key={p.id}
            photo={p}
            showCaption
            className={`rounded-control ${photos.length > 1 ? "aspect-[3/4]" : "aspect-[4/3]"}`}
          />
        ))}
      </div>

      <p className="mt-4 text-body text-ink-muted">{day.story}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {day.places.map((p) => (
          <Chip key={p} icon={MapPin}>
            {p}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

// ---------- 4) ค่าใช้จ่าย ----------
const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  transport: Plane,
  lodging: BedDouble,
  food: UtensilsCrossed,
  activity: Ticket,
  shopping: ShoppingBag,
  other: Receipt,
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
    <Card>
      <CardHeading title="ค่าใช้จ่าย" />
      <p className="mt-4 text-title font-semibold tabular-nums">{formatBaht(total)}</p>
      <p className="text-caption text-ink-muted">
        {s.expenses.items.length} รายการ · เฉลี่ยวันละ {formatBaht(Math.round(total / s.stats.days))}
      </p>

      <ul className="mt-6 space-y-4">
        {groups.map(([cat, g]) => {
          const percent = Math.round((g.amount / total) * 100);
          const Icon = CATEGORY_ICONS[cat];
          return (
            <li key={cat}>
              <div className="flex items-center gap-3 text-body">
                <Icon {...ICON} className="shrink-0 text-ink-muted" />
                <span className="flex-1">
                  {CATEGORY_LABELS[cat]}
                  <span className="ml-2 text-caption text-ink-muted">{g.count} รายการ</span>
                </span>
                <span className="font-semibold tabular-nums">{formatBaht(g.amount)}</span>
              </div>
              <div className="mt-2 ml-8 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-surface">
                  <div className="h-full rounded-full bg-ink-muted" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-9 text-right text-caption text-ink-muted tabular-nums">{percent}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ---------- 5) สถานที่ทั้งหมด (ตราประทับ) ----------
export function PlacesCard({ s }: { s: TripSummary }) {
  const rows = Math.ceil(s.route.length / 2);

  // หาวันที่ไปแต่ละที่ (ชื่อใน route กับในเรื่องเล่าอาจสั้นยาวต่างกัน)
  const visitedOn = (name: string) =>
    s.days.find((d) => d.places.some((p) => p.includes(name) || name.includes(p)))?.date;

  return (
    <Card>
      <CardHeading title={`ไปมาแล้ว ${s.route.length} ที่`} meta="ตราประทับทุกสถานที่ในทริปนี้" />

      {/* วางเป็นตาราง 2 คอลัมน์ แล้วขยับ/เอียงแต่ละอันแบบสุ่มคงที่ ให้ดูเหมือนประทับมือ */}
      <div className="relative mt-6" style={{ height: `${rows * 9}rem` }}>
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
              color={STAMP_INK}
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
    </Card>
  );
}

// ---------- 6) แชร์ ----------
export function ShareCard({ s, slug }: { s: TripSummary; slug: string }) {
  const path = `/t/${slug}`;

  return (
    <Card>
      <CardHeading title="แชร์ทริป" meta={s.title} />

      <div className="mt-6 flex flex-col items-center">
        <div className="w-48 rounded-control bg-card p-2 shadow-soft">
          <QrCode path={path} size={300} fluid light="#FFFFFF" dark="#1C1917" />
        </div>
        <p className="mt-2 text-caption text-ink-muted">ให้เพื่อนสแกนเพื่อเปิดทริปนี้</p>
      </div>

      <div className="mt-6 space-y-2">
        <CopyLinkButton path={path} />
        <ButtonLink href={`${path}/social`} block variant="secondary" icon={Smartphone}>
          การ์ดโซเชียล
        </ButtonLink>
        <ButtonLink href={`${path}/print`} block variant="secondary" icon={ImageIcon}>
          กรอบรูป
        </ButtonLink>
        <ButtonLink href={`${path}/order`} block variant="ghost" icon={Printer}>
          สั่งพิมพ์เป็นกรอบรูป
        </ButtonLink>
      </div>
      <p className="mt-4 text-center text-caption text-ink-faint">#PassportAI</p>
    </Card>
  );
}

// ---------- แผนที่เส้นทาง ----------
export function MapCard({ s }: { s: TripSummary }) {
  return (
    <Card>
      <CardHeading title="เส้นทาง" meta={`${s.route.length} จุด · ${s.stats.distance_km} กม.`} />
      <div className="mt-4">
        <RouteMap route={s.route} />
      </div>
    </Card>
  );
}
