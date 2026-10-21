"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { packagePrice, PRICE_PER_DAY } from "@/lib/config";
import { formatBaht } from "@/lib/format";
import { activeTrip, dayCount, newId, todayKey, updateStore, useStore } from "@/lib/trip-store";

const inputClass =
  "mt-1 w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-brown outline-none focus:border-orange";

// สร้างทริปที่กำลังจะเที่ยว แล้วไปเล่าเรื่องต่อในแชท (มีได้ทีละ 1 ทริป)
export function StartForm() {
  const router = useRouter();
  const data = useStore();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayKey());
  const [endDate, setEndDate] = useState("");

  if (!data) return null;
  const active = activeTrip(data);

  if (active) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold">มีทริปที่กำลังเที่ยวอยู่แล้ว</h1>
        <p className="mt-2 text-cream/70">จบทริป “{active.title}” ก่อน แล้วค่อยสร้างทริปใหม่</p>
        <Link
          href={`/trip/${active.id}/chat`}
          className="mt-6 block rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
        >
          ไปที่แชททริปนี้
        </Link>
      </main>
    );
  }

  const dateError = startDate && endDate && endDate < startDate;
  const canSubmit = title.trim() !== "" && startDate !== "" && endDate !== "" && !dateError;
  const days = startDate && endDate && !dateError ? dayCount(startDate, endDate) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const id = newId();
    const now = new Date().toISOString();
    updateStore((d) => ({
      trips: [
        ...d.trips,
        {
          id,
          title: title.trim(),
          start_date: startDate,
          end_date: endDate,
          planned_days: dayCount(startDate, endDate),
          status: "active",
          ended_at: null,
          paid_amount: null,
          paid_at: null,
          created_at: now,
          slug: null,
        },
      ],
      messages: {
        ...d.messages,
        [id]: [
          {
            id: newId(),
            from: "bot",
            text: `เริ่มทริป “${title.trim()}” แล้ว! ส่งรูป เล่าเรื่อง หรือถ่ายใบเสร็จมาได้ตลอดทริป เดี๋ยวผมจดให้ทั้งหมด`,
            at: now,
          },
        ],
      },
    }));
    router.push(`/trip/${id}/chat`);
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <Link href="/" className="text-sm text-cream/70 hover:text-cream">
        ← ทริปของฉัน
      </Link>
      <h1 className="mt-2 text-3xl font-semibold">สร้างทริปใหม่</h1>
      <p className="mt-2 text-cream/70">ตั้งชื่อกับวันเที่ยว แล้วเล่าเรื่องระหว่างทางผ่านแชทได้เลย</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl bg-cream p-5 text-brown">
        <label className="block">
          <span className="font-medium">ชื่อทริป</span>
          <input
            className={inputClass}
            placeholder="เช่น เชียงใหม่ 3 วัน"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-medium">วันเริ่ม</span>
            <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="font-medium">วันจบ (โดยประมาณ)</span>
            <input
              type="date"
              className={inputClass}
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>
        {dateError && <p className="text-sm text-orange">วันจบต้องไม่อยู่ก่อนวันเริ่ม</p>}

        {/* ราคาประมาณการ: เสนอเป็นแพ็กเกจตามจำนวนวัน ยังไม่เก็บเงิน */}
        {days && (
          <div className="rounded-xl bg-teal/10 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">แพ็กเกจ {days} วัน</span>
              <span className="font-heading text-2xl font-semibold text-teal">{formatBaht(packagePrice(days))}</span>
            </div>
            <p className="mt-1 text-sm text-brown/70">
              ต่อทริปเกินกำหนด คิดเพิ่มวันละ {formatBaht(PRICE_PER_DAY)} · ยังไม่เก็บเงินตอนนี้ ชำระตอนจบทริป
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream transition disabled:opacity-40"
        >
          เริ่มทริป
        </button>
      </form>
    </main>
  );
}
