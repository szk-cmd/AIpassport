import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { QrCode } from "@/components/QrCode";
import { RouteMap } from "@/components/RouteMap";
import { CATEGORY_LABELS, formatBaht, formatDate, formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";
import type { ExpenseCategory } from "@/lib/types";

export const metadata: Metadata = { title: `${MOCK_SUMMARY.title} – PassportAI` };

// MOCK: ยังไม่อ่าน slug จาก URL ใช้ทริปตัวอย่างเสมอ
export default function DigitalHistoryPage() {
  const s = MOCK_SUMMARY;
  const cover = getPhoto(s.cover_photo_id);

  // รวมค่าใช้จ่ายตามหมวด เรียงจากมากไปน้อย
  const byCategory = Object.entries(
    s.expenses.items.reduce<Partial<Record<ExpenseCategory, number>>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]) as [ExpenseCategory, number][];

  const stats = [
    { value: s.stats.days, label: "วัน" },
    { value: s.stats.places, label: "สถานที่" },
    { value: s.stats.distance_km, label: "กม." },
    { value: s.stats.photos, label: "รูป" },
  ];

  return (
    <main className="mx-auto w-full max-w-md pb-12">
      {/* ---------- ปก ---------- */}
      <header className="relative">
        {cover && <Photo photo={cover} className="h-80" />}
        <div className="absolute inset-0 bg-gradient-to-t from-brown via-brown/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <p className="inline-block rounded border border-gold px-2 py-0.5 font-heading text-xs tracking-widest text-gold">
            PASSPORT AI · DIGITAL HISTORY
          </p>
          <h1 className="mt-2 text-4xl font-bold">{s.title}</h1>
          <p className="mt-1 text-cream/80">{formatDateRange(s.start_date, s.end_date)}</p>
        </div>
      </header>

      <div className="px-4">
        {/* ---------- สถิติ ---------- */}
        <section className="mt-4 grid grid-cols-4 gap-2 text-center">
          {stats.map((st) => (
            <div key={st.label} className="rounded-xl bg-cream/10 py-3">
              <p className="font-heading text-2xl font-semibold text-gold">{st.value}</p>
              <p className="text-xs text-cream/70">{st.label}</p>
            </div>
          ))}
        </section>

        {/* ---------- รูปเด่น ---------- */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">รูปเด่น</h2>
          <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {s.highlight_photo_ids.map((id) => {
              const p = getPhoto(id);
              return (
                p && (
                  <Photo
                    key={id}
                    photo={p}
                    showCaption
                    className="aspect-[4/5] w-56 shrink-0 snap-start rounded-2xl"
                  />
                )
              );
            })}
          </div>
        </section>

        {/* ---------- Timeline รายวัน ---------- */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">เรื่องเล่ารายวัน</h2>
          <ol className="mt-4">
            {s.days.map((day, i) => (
              <li key={day.date} className="relative border-l-2 border-gold/40 pb-8 pl-6 last:pb-0">
                <span className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-brown bg-gold" />
                <p className="text-sm text-gold">
                  วันที่ {i + 1} · {formatDate(day.date)}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{day.title}</h3>
                <p className="mt-2 leading-relaxed text-cream/85">{day.story}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {day.photo_ids.map((id) => {
                    const p = getPhoto(id);
                    return p && <Photo key={id} photo={p} className="aspect-square rounded-lg" />;
                  })}
                </div>
                <p className="mt-2 text-xs text-cream/60">📍 {day.places.join(" · ")}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- แผนที่ ---------- */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">เส้นทาง</h2>
          <div className="mt-3">
            <RouteMap route={s.route} />
          </div>
        </section>

        {/* ---------- ค่าใช้จ่าย ---------- */}
        <section className="mt-10 rounded-2xl bg-cream p-5 text-brown">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">ค่าใช้จ่าย</h2>
            <p className="font-heading text-2xl font-semibold text-orange">{formatBaht(s.expenses.total)}</p>
          </div>
          <ul className="mt-4 space-y-3">
            {byCategory.map(([cat, amount]) => (
              <li key={cat}>
                <div className="flex justify-between text-sm">
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <span>{formatBaht(amount)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-brown/10">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${(amount / s.expenses.total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-brown/60">
            เฉลี่ยวันละ {formatBaht(Math.round(s.expenses.total / s.stats.days))}
          </p>
        </section>

        {/* ---------- QR + output อื่น ---------- */}
        <section className="mt-10 flex flex-col items-center text-center">
          <QrCode path={`/t/${MOCK_SLUG}`} size={168} className="rounded-xl p-2" />
          <p className="mt-3 text-cream/80">สแกนเพื่อเปิดหนังสือเดินทางเล่มนี้</p>
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Link
              href={`/t/${MOCK_SLUG}/print`}
              className="rounded-full border border-cream/40 py-3 font-medium hover:bg-cream/10"
            >
              🖼 กรอบรูปพิมพ์
            </Link>
            <Link
              href={`/t/${MOCK_SLUG}/social`}
              className="rounded-full bg-orange py-3 font-medium text-cream"
            >
              📱 การ์ดโซเชียล
            </Link>
          </div>
        </section>

        <p className="mt-10 text-center font-heading text-xs tracking-widest text-cream/40">
          สร้างด้วย PassportAI · #PassportAI
        </p>
      </div>
    </main>
  );
}
