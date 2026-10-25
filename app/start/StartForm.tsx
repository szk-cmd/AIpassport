"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, DateField, Input, TopBar } from "@/components/ui";
import { packagePrice, PRICE_PER_DAY } from "@/lib/config";
import { formatBaht } from "@/lib/format";
import { createTrip, dayCount, newId, todayKey } from "@/lib/trip-store";

// สร้างทริปที่กำลังจะเที่ยว แล้วไปเล่าเรื่องต่อในแชท
// สร้างได้เลยแม้มีทริปอื่นค้างอยู่ (ทริปเดิมค้างแชทไว้ ยังไม่สรุปจนกว่าจะกดจบทริป)
export function StartForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayKey());
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const dateError = startDate && endDate && endDate < startDate;
  const canSubmit = title.trim() !== "" && startDate !== "" && endDate !== "" && !dateError;
  const days = startDate && endDate && !dateError ? dayCount(startDate, endDate) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    const id = newId();
    setSaving(true);
    setError(false);
    try {
      // บันทึกลงฐานข้อมูล (server เพิ่มข้อความต้อนรับในแชทให้) แล้วไปที่แชท
      await createTrip({
        id,
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        planned_days: dayCount(startDate, endDate),
      });
      router.push(`/trip/${id}/chat`);
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <TopBar backHref="/" title="ทริปของฉัน" />
      <main className="mx-auto w-full max-w-md px-4 pt-2 pb-8">
        <h1 className="font-sans text-title font-semibold">สร้างทริปใหม่</h1>
        <p className="mt-2 text-body text-ink-muted">ตั้งชื่อกับวันเที่ยว แล้วเล่าเรื่องระหว่างทางผ่านแชทได้เลย</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="ชื่อทริป"
            placeholder="เช่น เชียงใหม่ 3 วัน"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <DateField label="วันเริ่ม" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <DateField
              label="วันจบ (โดยประมาณ)"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={dateError ? "วันจบต้องไม่อยู่ก่อนวันเริ่ม" : undefined}
            />
          </div>

          {/* ราคาประมาณการ: เสนอเป็นแพ็กเกจตามจำนวนวัน ยังไม่เก็บเงิน */}
          {days && (
            <Card>
              <div className="flex items-baseline justify-between">
                <span className="text-body">แพ็กเกจ {days} วัน</span>
                <span className="text-title font-semibold">{formatBaht(packagePrice(days))}</span>
              </div>
              <p className="mt-2 text-label text-ink-muted">
                ต่อทริปเกินกำหนด คิดเพิ่มวันละ {formatBaht(PRICE_PER_DAY)} · ยังไม่เก็บเงินตอนนี้ ชำระตอนจบทริป
              </p>
            </Card>
          )}

          <Button type="submit" block disabled={!canSubmit || saving}>
            เริ่มทริป
          </Button>
          {error && <p className="text-center text-label text-danger">สร้างทริปไม่สำเร็จ ลองใหม่อีกครั้งนะ</p>}
        </form>
      </main>
    </div>
  );
}
