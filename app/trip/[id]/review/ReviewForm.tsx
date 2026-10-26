"use client";

import { BookOpen, CircleCheck, Plus, Printer, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import {
  Button,
  ButtonLink,
  Card,
  ICON,
  IconButton,
  Input,
  TextArea,
} from "@/components/ui";
import { CATEGORY_LABELS, formatBaht, formatDate } from "@/lib/format";
import { photoOf } from "@/lib/summary";
import { refreshStore, useStore } from "@/lib/trip-store";
import type {
  DayStory,
  ExpenseCategory,
  ExpenseLine,
  TripSummary,
} from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];
const selectClass =
  "h-12 w-full rounded-control bg-surface px-3 text-body text-ink outline-none focus:ring-2 focus:ring-brand";

export function ReviewForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  // ผลสรุปจริงของทริปนี้ (trip_outputs) แก้ในหน้านี้ก่อน แล้วค่อยบันทึกตอนกดยืนยัน
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  // ทริปที่ยืนยันไปแล้ว = โหมดแก้ไข (บันทึกทับ ใช้ลิงก์เดิม)
  const editing =
    useStore()?.trips.find((t) => t.id === id)?.status === "completed";

  useEffect(() => {
    fetch(`/api/trips/${id}/output`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { summary: TripSummary }) => setSummary(data.summary))
      // ยังสรุปไม่เสร็จ → กลับไปหน้าความคืบหน้า
      .catch(() => router.replace(`/trip/${id}/progress`));
  }, [id, router]);

  if (slug && summary)
    return <ReadyScreen slug={slug} title={summary.title} edited={editing} />;
  if (!summary) {
    return <div className="min-h-dvh bg-canvas" aria-busy="true" />;
  }

  const total = summary.expenses.items.reduce((sum, e) => sum + e.amount, 0);

  function updateDay(index: number, change: Partial<DayStory>) {
    setSummary(
      (s) =>
        s && {
          ...s,
          days: s.days.map((d, i) => (i === index ? { ...d, ...change } : d)),
        },
    );
  }

  function updateExpense(index: number, change: Partial<ExpenseLine>) {
    setSummary(
      (s) =>
        s && {
          ...s,
          expenses: {
            ...s.expenses,
            items: s.expenses.items.map((e, i) =>
              i === index ? { ...e, ...change } : e,
            ),
          },
        },
    );
  }

  // เพิ่มค่าใช้จ่ายที่ลืมใส่ระหว่างทริป (วันแรกของทริปเป็นค่าเริ่มต้น เปลี่ยนวันได้)
  function addExpense() {
    setSummary(
      (s) =>
        s && {
          ...s,
          expenses: {
            ...s.expenses,
            items: [
              ...s.expenses.items,
              {
                label: "",
                amount: 0,
                category: "other",
                date: s.days[0]?.date ?? s.start_date,
              },
            ],
          },
        },
    );
  }

  function removeExpense(index: number) {
    setSummary(
      (s) =>
        s && {
          ...s,
          expenses: {
            ...s.expenses,
            items: s.expenses.items.filter((_, i) => i !== index),
          },
        },
    );
  }

  // Agent 05: บันทึกสิ่งที่แก้ สร้าง slug ปิดทริป
  async function handleConfirm() {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/trips/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { slug: string };
      await refreshStore();
      setSlug(data.slug);
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 pt-8 pb-32">
        <h1 className="font-sans text-title font-semibold">
          {editing ? "แก้ไขทริป" : "ตรวจทานก่อนยืนยัน"}
        </h1>
        <p className="mt-2 text-body text-ink-muted">
          {editing
            ? "แก้เรื่องเล่า ข้อความบนกรอบรูป หรือเพิ่ม/ลบค่าใช้จ่าย แล้วกดบันทึก ลิงก์แชร์ยังเป็นลิงก์เดิม"
            : "ขั้นสุดท้าย แก้เรื่องเล่า เพิ่มหรือแก้ค่าใช้จ่ายได้ตามใจ แล้วกดยืนยันด้านล่าง"}
        </p>

        {/* ---------- เรื่องเล่ารายวัน ---------- */}
        <section className="mt-12">
          <h2 className="font-sans text-heading font-semibold">เรื่องเล่า</h2>
          <div className="mt-4 space-y-4">
            {summary.days.map((day, i) => {
              const firstPhoto = photoOf(summary, day.photo_ids[0]);
              return (
                <Card key={day.date} padded={false} className="overflow-hidden">
                  {firstPhoto && (
                    <Photo photo={firstPhoto} hidePlace className="h-32" />
                  )}
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
          <h2 className="font-sans text-heading font-semibold">
            ข้อความบนกรอบรูป
          </h2>
          <Card className="mt-4">
            <TextArea
              value={summary.print.short_text}
              onChange={(e) =>
                setSummary(
                  (s) =>
                    s && {
                      ...s,
                      print: { ...s.print, short_text: e.target.value },
                    },
                )
              }
              aria-label="ข้อความบนกรอบรูป"
              hint="สั้นๆ อ่านง่าย สำหรับพิมพ์ให้ผู้ใหญ่ที่บ้าน"
            />
          </Card>
        </section>

        {/* ---------- ค่าใช้จ่าย ---------- */}
        <section className="mt-12">
          <h2 className="font-sans text-heading font-semibold">ค่าใช้จ่าย</h2>
          <Card className="mt-4">
            {summary.expenses.items.length === 0 && (
              <p className="text-label text-ink-muted">
                ยังไม่มีค่าใช้จ่าย กดเพิ่มรายการด้านล่างได้
              </p>
            )}
            <ul className="space-y-6">
              {summary.expenses.items.map((e, i) => (
                <li key={i} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        value={e.label}
                        placeholder="เช่น ข้าวซอย, ค่ารถ"
                        onChange={(ev) =>
                          updateExpense(i, { label: ev.target.value })
                        }
                        aria-label="รายการ"
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={e.amount || ""}
                        placeholder="บาท"
                        onChange={(ev) =>
                          updateExpense(i, {
                            amount: Number(ev.target.value) || 0,
                          })
                        }
                        aria-label={`ราคา ${e.label}`}
                        className="text-right tabular-nums"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={e.category}
                      onChange={(ev) =>
                        updateExpense(i, {
                          category: ev.target.value as ExpenseCategory,
                        })
                      }
                      aria-label="หมวด"
                      className={selectClass}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={e.date}
                      onChange={(ev) =>
                        updateExpense(i, { date: ev.target.value })
                      }
                      aria-label="วัน"
                      className={selectClass}
                    >
                      {summary.days.map((d, n) => (
                        <option key={d.date} value={d.date}>
                          วันที่ {n + 1} · {formatDate(d.date)}
                        </option>
                      ))}
                    </select>
                    <IconButton
                      label={`ลบ ${e.label || "รายการนี้"}`}
                      onClick={() => removeExpense(i)}
                    >
                      <Trash2 {...ICON} />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              block
              icon={Plus}
              onClick={addExpense}
              className="mt-6"
            >
              เพิ่มค่าใช้จ่าย
            </Button>
            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-body font-semibold">รวมทั้งทริป</span>
              <span className="text-title font-semibold">
                {formatBaht(total)}
              </span>
            </div>
          </Card>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas/90 px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-md">
        <Button
          block
          onClick={handleConfirm}
          disabled={saving}
          className="mx-auto max-w-md"
        >
          {saving
            ? editing
              ? "กำลังบันทึก..."
              : "กำลังสร้างหนังสือเดินทาง..."
            : editing
              ? "บันทึกการแก้ไข"
              : "ยืนยัน สร้างหนังสือเดินทาง"}
        </Button>
        {error && (
          <p className="mt-2 text-center text-label text-danger">
            บันทึกไม่สำเร็จ ลองกดยืนยันอีกครั้งนะ
          </p>
        )}
      </div>
    </div>
  );
}

// หลังยืนยัน: ไปดูพาสปอร์ตเป็นทางหลัก สั่งพิมพ์เป็นทางเลือก ไม่บังคับ
function ReadyScreen({
  slug,
  title,
  edited,
}: {
  slug: string;
  title: string;
  edited?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 py-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck size={32} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-6 font-sans text-title font-semibold">
          {edited ? "บันทึกการแก้ไขแล้ว" : "พาสปอร์ตพร้อมแล้ว"}
        </h1>
        <p className="mt-2 text-body text-ink-muted">{title}</p>
        <div className="mt-8 space-y-2">
          <ButtonLink href={`/t/${slug}`} block icon={BookOpen}>
            ดูพาสปอร์ต
          </ButtonLink>
          <ButtonLink
            href={`/t/${slug}/order`}
            block
            variant="secondary"
            icon={Printer}
          >
            สั่งพิมพ์กรอบรูป
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
