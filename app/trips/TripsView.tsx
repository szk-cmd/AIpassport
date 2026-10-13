"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { Photo } from "@/components/Photo";
import { formatBaht, formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";

// MOCK: ทริปที่เคยสร้าง (ของจริงจะเก็บ trip id ไว้ใน localStorage ของเครื่องนี้ เพราะไม่มี login)
const MOCK_TRIPS = [{ summary: MOCK_SUMMARY, slug: MOCK_SLUG }];

export function TripsView() {
  // /trips?demo=empty ใช้ดูหน้าตอนผู้ใช้ยังไม่มีทริป
  const trips = useSearchParams().get("demo") === "empty" ? [] : MOCK_TRIPS;

  const places = Array.from(new Set(trips.flatMap((t) => t.summary.route.map((p) => p.name))));
  const totalDays = trips.reduce((sum, t) => sum + t.summary.stats.days, 0);

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-8 pb-28">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-cream p-1">
          <LogoMark size={28} />
        </div>
        <p className="font-heading text-sm tracking-widest text-gold">YOUR TRIPS</p>
      </div>
      <h1 className="mt-2 text-3xl font-semibold">ทริปของคุณ</h1>

      {trips.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ---------- สรุปรวมทุกทริป ---------- */}
          <section className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { value: trips.length, label: "ทริป" },
              { value: places.length, label: "สถานที่" },
              { value: totalDays, label: "วันเที่ยว" },
            ].map((st) => (
              <div key={st.label} className="rounded-xl bg-cream/10 py-3">
                <p className="font-heading text-2xl font-semibold text-gold">{st.value}</p>
                <p className="text-xs text-cream/70">{st.label}</p>
              </div>
            ))}
          </section>

          {/* ---------- ที่ที่เคยไป ---------- */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold">ที่ที่เคยไปมาแล้ว</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {places.map((name) => (
                <li key={name} className="rounded-full border border-cream/25 px-3 py-1 text-sm text-cream/85">
                  📍 {name}
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- รายการทริป ---------- */}
          <section className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">ทริปทั้งหมด</h2>
            {trips.map(({ summary: s, slug }) => {
              const cover = getPhoto(s.cover_photo_id);
              return (
                <Link
                  key={slug}
                  href={`/t/${slug}`}
                  className="block overflow-hidden rounded-2xl bg-cream text-brown shadow-lg transition hover:-translate-y-0.5"
                >
                  {cover && <Photo photo={cover} className="h-36" />}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-heading text-xl font-semibold">{s.title}</p>
                        <p className="text-sm text-brown/60">{formatDateRange(s.start_date, s.end_date)}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-teal/15 px-2.5 py-0.5 text-xs text-teal">
                        เสร็จแล้ว
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-brown/70">
                      {s.stats.places} สถานที่ · {s.stats.photos} รูป · {formatBaht(s.expenses.total)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        </>
      )}

      {/* ---------- ปุ่มสร้างทริปใหม่ (ติดล่างจอ) ---------- */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-brown via-brown to-transparent px-4 pt-6 pb-5">
        <Link
          href="/plan"
          className="mx-auto block w-full max-w-md rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream"
        >
          + สร้างทริปใหม่
        </Link>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <section className="mt-10 flex flex-col items-center rounded-3xl border-2 border-dashed border-cream/20 px-6 py-12 text-center">
      <div className="rounded-3xl bg-cream p-3 opacity-90">
        <LogoMark size={72} />
      </div>
      <p className="mt-5 font-heading text-xl font-semibold">ยังไม่มีทริป</p>
      <p className="mt-2 text-cream/70">
        เริ่มทริปแรกของคุณ แล้วหนังสือเดินทาง
        <br />
        แห่งความทรงจำจะมาอยู่ที่นี่
      </p>
    </section>
  );
}
