"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORY_LABELS, formatBaht, formatDate } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";
import type { DayStory, ExpenseLine, TripSummary } from "@/lib/types";

const fieldClass =
  "w-full rounded-lg border border-brown/15 bg-white px-3 py-2 text-brown outline-none focus:border-orange";

export function ReviewForm() {
  // MOCK: เก็บการแก้ไขไว้ใน state ของหน้านี้เท่านั้น ยังไม่บันทึกลง DB
  const [summary, setSummary] = useState<TripSummary>(MOCK_SUMMARY);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const total = summary.expenses.items.reduce((sum, e) => sum + e.amount, 0);

  function updateDay(index: number, change: Partial<DayStory>) {
    setSummary((s) => ({
      ...s,
      days: s.days.map((d, i) => (i === index ? { ...d, ...change } : d)),
    }));
  }

  function updateExpense(index: number, change: Partial<ExpenseLine>) {
    setSummary((s) => ({
      ...s,
      expenses: {
        ...s.expenses,
        items: s.expenses.items.map((e, i) => (i === index ? { ...e, ...change } : e)),
      },
    }));
  }

  function handleConfirm() {
    setSaving(true);
    // MOCK: ของจริงจะบันทึก summary แล้วเรียก agent 05 สร้าง slug + QR
    setTimeout(() => setDone(true), 800);
  }

  if (done) return <ReadyScreen slug={MOCK_SLUG} title={summary.title} />;

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-8 pb-28">
      <p className="font-heading text-sm tracking-widest text-gold">ขั้นที่ 3 จาก 3</p>
      <h1 className="mt-1 text-3xl font-semibold">ตรวจทานก่อนยืนยัน</h1>
      <p className="mt-2 text-cream/70">แก้เรื่องเล่าหรือค่าใช้จ่ายได้ตามใจ แล้วกดยืนยันด้านล่าง</p>

      {/* ---------- เรื่องเล่ารายวัน ---------- */}
      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-semibold">เรื่องเล่า</h2>
        {summary.days.map((day, i) => {
          const firstPhoto = getPhoto(day.photo_ids[0]);
          return (
            <article key={day.date} className="overflow-hidden rounded-2xl bg-cream text-brown">
              {firstPhoto && <Photo photo={firstPhoto} className="h-32" />}
              <div className="space-y-2 p-4">
                <p className="text-sm text-teal">
                  วันที่ {i + 1} · {formatDate(day.date)}
                </p>
                <input
                  className={`${fieldClass} font-heading font-semibold`}
                  value={day.title}
                  onChange={(e) => updateDay(i, { title: e.target.value })}
                  aria-label={`หัวข้อวันที่ ${i + 1}`}
                />
                <textarea
                  className={`${fieldClass} min-h-36 leading-relaxed`}
                  value={day.story}
                  onChange={(e) => updateDay(i, { story: e.target.value })}
                  aria-label={`เรื่องเล่าวันที่ ${i + 1}`}
                />
              </div>
            </article>
          );
        })}
      </section>

      {/* ---------- ข้อความสั้นบนกรอบรูป ---------- */}
      <section className="mt-6 rounded-2xl bg-cream p-4 text-brown">
        <h2 className="text-lg font-semibold">ข้อความบนกรอบรูป</h2>
        <p className="text-sm text-brown/60">สั้นๆ อ่านง่าย สำหรับพิมพ์ให้ผู้ใหญ่ที่บ้าน</p>
        <textarea
          className={`${fieldClass} mt-2 min-h-20`}
          value={summary.print.short_text}
          onChange={(e) =>
            setSummary((s) => ({ ...s, print: { ...s.print, short_text: e.target.value } }))
          }
          aria-label="ข้อความบนกรอบรูป"
        />
      </section>

      {/* ---------- ค่าใช้จ่าย ---------- */}
      <section className="mt-6 rounded-2xl bg-cream p-4 text-brown">
        <h2 className="text-lg font-semibold">ค่าใช้จ่าย</h2>
        <ul className="mt-3 space-y-3">
          {summary.expenses.items.map((e, i) => (
            <li key={i}>
              <p className="text-xs text-brown/60">{CATEGORY_LABELS[e.category]}</p>
              <div className="mt-1 flex gap-2">
                <input
                  className={`${fieldClass} flex-1`}
                  value={e.label}
                  onChange={(ev) => updateExpense(i, { label: ev.target.value })}
                  aria-label="รายการ"
                />
                <div className="w-24 shrink-0">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className={`${fieldClass} text-right`}
                    value={e.amount}
                    onChange={(ev) => updateExpense(i, { amount: Number(ev.target.value) || 0 })}
                    aria-label={`ราคา ${e.label}`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-brown/15 pt-3">
          <span className="font-medium">รวมทั้งทริป</span>
          <span className="font-heading text-2xl font-semibold text-orange">{formatBaht(total)}</span>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-brown via-brown to-transparent px-4 pt-6 pb-5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="mx-auto block w-full max-w-md rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream disabled:opacity-60"
        >
          {saving ? "กำลังสร้างหนังสือเดินทาง..." : "ยืนยัน สร้างหนังสือเดินทาง"}
        </button>
      </div>
    </main>
  );
}

// หลังยืนยัน: ไปดูพาสปอร์ตเป็นทางหลัก สั่งพิมพ์เป็นทางเลือก ไม่บังคับ
function ReadyScreen({ slug, title }: { slug: string; title: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
      <span className="text-6xl" aria-hidden>
        🛂
      </span>
      <h1 className="mt-4 text-3xl font-semibold">พาสปอร์ตพร้อมแล้ว</h1>
      <p className="mt-2 text-cream/70">{title}</p>
      <div className="mt-8 grid w-full gap-3">
        <Link
          href={`/t/${slug}`}
          className="rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
        >
          ดูพาสปอร์ต
        </Link>
        <Link
          href={`/t/${slug}/order`}
          className="rounded-full border-2 border-cream/30 py-3 font-heading font-semibold hover:bg-cream/10"
        >
          🖨 สั่งพิมพ์กรอบรูป
        </Link>
      </div>
    </main>
  );
}
