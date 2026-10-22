"use client";

import { BookOpen, CircleCheck, Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { Button, ButtonLink, Card, Input, TextArea } from "@/components/ui";
import { CATEGORY_LABELS, formatBaht, formatDate } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";
import { updateTrip } from "@/lib/trip-store";
import type { DayStory, ExpenseLine, TripSummary } from "@/lib/types";

export function ReviewForm() {
  const { id } = useParams<{ id: string }>();
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
    // ตอนนี้ทุกทริปชี้ไปพาสปอร์ตตัวอย่าง
    updateTrip(id, { status: "completed", slug: MOCK_SLUG });
    setTimeout(() => setDone(true), 800);
  }

  if (done) return <ReadyScreen slug={MOCK_SLUG} title={summary.title} />;

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 pt-8 pb-32">
        <h1 className="font-sans text-title font-semibold">ตรวจทานก่อนยืนยัน</h1>
        <p className="mt-2 text-body text-ink-muted">
          ขั้นสุดท้าย แก้เรื่องเล่าหรือค่าใช้จ่ายได้ตามใจ แล้วกดยืนยันด้านล่าง
        </p>

        {/* ---------- เรื่องเล่ารายวัน ---------- */}
        <section className="mt-12">
          <h2 className="font-sans text-heading font-semibold">เรื่องเล่า</h2>
          <div className="mt-4 space-y-4">
            {summary.days.map((day, i) => {
              const firstPhoto = getPhoto(day.photo_ids[0]);
              return (
                <Card key={day.date} padded={false} className="overflow-hidden">
                  {firstPhoto && <Photo photo={firstPhoto} hidePlace className="h-32" />}
                  <div className="space-y-4 p-6">
                    <p className="text-label text-ink-muted">
                      วันที่ {i + 1} · {formatDate(day.date)}
                    </p>
                    <Input
                      value={day.title}
                      onChange={(e) => updateDay(i, { title: e.target.value })}
                      aria-label={`หัวข้อวันที่ ${i + 1}`}
                      className="font-semibold"
                    />
                    <TextArea
                      value={day.story}
                      onChange={(e) => updateDay(i, { story: e.target.value })}
                      aria-label={`เรื่องเล่าวันที่ ${i + 1}`}
                      className="min-h-36"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ---------- ข้อความสั้นบนกรอบรูป ---------- */}
        <section className="mt-12">
          <h2 className="font-sans text-heading font-semibold">ข้อความบนกรอบรูป</h2>
          <Card className="mt-4">
            <TextArea
              value={summary.print.short_text}
              onChange={(e) => setSummary((s) => ({ ...s, print: { ...s.print, short_text: e.target.value } }))}
              aria-label="ข้อความบนกรอบรูป"
              hint="สั้นๆ อ่านง่าย สำหรับพิมพ์ให้ผู้ใหญ่ที่บ้าน"
            />
          </Card>
        </section>

        {/* ---------- ค่าใช้จ่าย ---------- */}
        <section className="mt-12">
          <h2 className="font-sans text-heading font-semibold">ค่าใช้จ่าย</h2>
          <Card className="mt-4">
            <ul className="space-y-4">
              {summary.expenses.items.map((e, i) => (
                <li key={i}>
                  <p className="mb-2 text-caption text-ink-muted">{CATEGORY_LABELS[e.category]}</p>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        value={e.label}
                        onChange={(ev) => updateExpense(i, { label: ev.target.value })}
                        aria-label="รายการ"
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={e.amount}
                        onChange={(ev) => updateExpense(i, { amount: Number(ev.target.value) || 0 })}
                        aria-label={`ราคา ${e.label}`}
                        className="text-right tabular-nums"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-body font-semibold">รวมทั้งทริป</span>
              <span className="text-title font-semibold">{formatBaht(total)}</span>
            </div>
          </Card>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas/90 px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-md">
        <Button block onClick={handleConfirm} disabled={saving} className="mx-auto max-w-md">
          {saving ? "กำลังสร้างหนังสือเดินทาง..." : "ยืนยัน สร้างหนังสือเดินทาง"}
        </Button>
      </div>
    </div>
  );
}

// หลังยืนยัน: ไปดูพาสปอร์ตเป็นทางหลัก สั่งพิมพ์เป็นทางเลือก ไม่บังคับ
function ReadyScreen({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 py-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck size={32} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-6 font-sans text-title font-semibold">พาสปอร์ตพร้อมแล้ว</h1>
        <p className="mt-2 text-body text-ink-muted">{title}</p>
        <div className="mt-8 space-y-2">
          <ButtonLink href={`/t/${slug}`} block icon={BookOpen}>
            ดูพาสปอร์ต
          </ButtonLink>
          <ButtonLink href={`/t/${slug}/order`} block variant="secondary" icon={Printer}>
            สั่งพิมพ์กรอบรูป
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
