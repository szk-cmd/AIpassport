"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { formatBaht, formatDateRange } from "@/lib/format";
import { MOCK_ITEMS, MOCK_TRIP } from "@/lib/mock";
import type { TripItem } from "@/lib/types";

// ต่ำกว่านี้ถือว่า AI ไม่มั่นใจ → ไฮไลต์เหลืองให้ผู้ใช้ตรวจ
const LOW_CONFIDENCE = 0.7;

const isLow = (item: TripItem) => item.confidence !== null && item.confidence < LOW_CONFIDENCE;

const fieldClass =
  "w-full rounded-lg border border-brown/15 bg-white px-3 py-2 text-brown outline-none focus:border-orange";

export function ConfirmForm() {
  const router = useRouter();
  const [items, setItems] = useState<TripItem[]>(MOCK_ITEMS);

  const photos = items.filter((i) => i.type === "photo");
  const selectedCount = photos.filter((p) => p.selected).length;
  const ticket = items.find((i) => i.type === "ticket");
  const lodging = items.find((i) => i.type === "lodging");
  const expenses = items.filter((i) => i.type === "expense");

  const total = items.reduce((sum, i) => {
    if (i.type === "ticket" || i.type === "lodging") return sum + i.data.price;
    if (i.type === "expense") return sum + i.data.amount;
    return sum;
  }, 0);

  function update(id: string, change: (item: TripItem) => TripItem) {
    setItems((prev) => prev.map((i) => (i.id === id ? change(i) : i)));
  }

  // ผู้ใช้แก้แล้ว = ถือว่าข้อมูลถูกต้อง เลิกไฮไลต์
  function setData(item: TripItem, data: Partial<TripItem["data"]>): TripItem {
    return { ...item, data: { ...item.data, ...data }, confidence: 1 } as TripItem;
  }

  function addExpense() {
    const newItem: TripItem = {
      id: `new-${Date.now()}`,
      trip_id: MOCK_TRIP.id,
      type: "expense",
      data: { label: "", category: "other", amount: 0, date: MOCK_TRIP.start_date },
      file_url: null,
      taken_at: null,
      lat: null,
      lng: null,
      selected: true,
      confidence: 1,
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-8 pb-28">
      <p className="font-heading text-sm tracking-widest text-gold">ขั้นที่ 1 จาก 3</p>
      <h1 className="mt-1 text-3xl font-semibold">ตรวจสอบข้อมูล</h1>
      <p className="mt-1 text-cream/70">
        {MOCK_TRIP.title} · {formatDateRange(MOCK_TRIP.start_date, MOCK_TRIP.end_date)}
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm text-cream/80">
        <span className="inline-block h-3 w-3 rounded-sm bg-gold" />
        สีเหลือง = ระบบไม่แน่ใจ ช่วยตรวจอีกครั้ง
      </p>

      {/* ---------- รูป ---------- */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">รูปที่คัดไว้</h2>
          <span className="text-sm text-cream/70">
            {selectedCount} จาก {photos.length} รูป
          </span>
        </div>
        <p className="mt-1 text-sm text-cream/60">แตะรูปเพื่อเลือกหรือไม่เลือก</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update(p.id, (i) => ({ ...i, selected: !i.selected }))}
              className={`relative overflow-hidden rounded-xl text-left transition ${
                p.selected ? "ring-2 ring-orange" : "opacity-40"
              }`}
              aria-pressed={p.selected}
            >
              <Photo photo={p} className="aspect-square" showCaption />
              <span
                className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  p.selected ? "bg-orange text-cream" : "bg-cream/80 text-brown"
                }`}
              >
                {p.selected ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- ตั๋ว ---------- */}
      {ticket?.type === "ticket" && (
        <Card title="ตั๋วเดินทาง" low={isLow(ticket)}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="จาก">
              <input
                className={fieldClass}
                value={ticket.data.from}
                onChange={(e) => update(ticket.id, (i) => setData(i, { from: e.target.value }))}
              />
            </Field>
            <Field label="ถึง">
              <input
                className={fieldClass}
                value={ticket.data.to}
                onChange={(e) => update(ticket.id, (i) => setData(i, { to: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="ราคา (บาท)">
            <AmountInput
              value={ticket.data.price}
              onChange={(n) => update(ticket.id, (i) => setData(i, { price: n }))}
            />
          </Field>
        </Card>
      )}

      {/* ---------- ที่พัก ---------- */}
      {lodging?.type === "lodging" && (
        <Card title="ที่พัก" low={isLow(lodging)}>
          <Field label="ชื่อที่พัก">
            <input
              className={fieldClass}
              value={lodging.data.name}
              onChange={(e) => update(lodging.id, (i) => setData(i, { name: e.target.value }))}
            />
          </Field>
          <Field label="ราคารวม (บาท)">
            <AmountInput
              value={lodging.data.price}
              onChange={(n) => update(lodging.id, (i) => setData(i, { price: n }))}
            />
          </Field>
        </Card>
      )}

      {/* ---------- ค่าใช้จ่าย ---------- */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">ค่าใช้จ่าย</h2>
        <ul className="mt-3 space-y-2">
          {expenses.map(
            (e) =>
              e.type === "expense" && (
                <li
                  key={e.id}
                  className={`rounded-xl p-3 text-brown ${isLow(e) ? "bg-[#FCE9C2] ring-2 ring-gold" : "bg-cream"}`}
                >
                  {isLow(e) && (
                    <p className="mb-2 text-xs font-semibold text-brown/80">⚠ โปรดตรวจสอบรายการนี้</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      className={`${fieldClass} flex-1`}
                      placeholder="รายการ"
                      value={e.data.label}
                      onChange={(ev) => update(e.id, (i) => setData(i, { label: ev.target.value }))}
                    />
                    <div className="w-24">
                      <AmountInput
                        value={e.data.amount}
                        onChange={(n) => update(e.id, (i) => setData(i, { amount: n }))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(e.id)}
                      className="shrink-0 rounded-lg px-2 text-brown/50 hover:bg-brown/10 hover:text-orange"
                      aria-label={`ลบ ${e.data.label}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ),
          )}
        </ul>
        <button
          type="button"
          onClick={addExpense}
          className="mt-3 w-full rounded-xl border-2 border-dashed border-cream/30 py-3 text-cream/80 hover:border-cream/60"
        >
          + เพิ่มค่าใช้จ่าย
        </button>
        <p className="mt-3 text-right text-cream/70">
          รวมทั้งทริป (ตั๋ว + ที่พัก + ค่าใช้จ่าย){" "}
          <span className="font-heading text-lg text-gold">{formatBaht(total)}</span>
        </p>
      </section>

      {/* ---------- ปุ่มไปต่อ (ติดล่างจอ) ---------- */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-brown via-brown to-transparent px-4 pt-6 pb-5">
        <button
          type="button"
          onClick={() => router.push(`/trip/${MOCK_TRIP.id}/progress`)}
          className="mx-auto block w-full max-w-md rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
        >
          ข้อมูลถูกต้อง สร้างเรื่องราวเลย
        </button>
      </div>
    </main>
  );
}

function Card({ title, low, children }: { title: string; low: boolean; children: React.ReactNode }) {
  return (
    <section
      className={`mt-6 space-y-3 rounded-2xl p-4 text-brown ${low ? "bg-[#FCE9C2] ring-2 ring-gold" : "bg-cream"}`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {low && <p className="text-xs font-semibold text-brown/80">⚠ โปรดตรวจสอบข้อมูลนี้</p>}
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-brown/70">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function AmountInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      className={`${fieldClass} text-right`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
    />
  );
}
