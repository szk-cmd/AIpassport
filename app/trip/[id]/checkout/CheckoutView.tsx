"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { tripBill } from "@/lib/config";
import { formatBaht, formatDateRange } from "@/lib/format";
import { dayCount, todayKey, updateTrip, useStore, type StoredTrip } from "@/lib/trip-store";

// สรุปค่าบริการหลังจบทริป + ตัวอย่างปกแบบเบลอ, บัญชีทดสอบกดชำระแล้วถือว่าสำเร็จทันที
export function CheckoutView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useStore();
  const [paying, setPaying] = useState(false);
  if (!data) return null;

  const trip = data.trips.find((t) => t.id === id);
  if (!trip || trip.status !== "ended") return <NotReady trip={trip} />;

  const endDay = trip.ended_at ? todayKey(new Date(trip.ended_at)) : todayKey();
  const bill = tripBill(trip.planned_days, Math.max(1, dayCount(trip.start_date, endDay)));
  // ปกใช้รูปแรกที่ส่งในแชท ไม่ต้องรอ AI สรุปเสร็จ
  const cover = data.messages[id]?.flatMap((m) => m.photos ?? [])[0];

  function handlePay() {
    setPaying(true);
    // ชำระเงินจำลอง: ยังไม่มี payment gateway
    updateTrip(id, { status: "paid", paid_amount: bill.total, paid_at: new Date().toISOString() });
    setTimeout(() => router.push(`/trip/${id}/progress`), 600);
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="font-heading text-sm tracking-widest text-gold">สรุปค่าบริการ</p>
      <h1 className="mt-1 text-2xl font-semibold">พาสปอร์ตของคุณพร้อมแล้ว</h1>
      <p className="mt-2 text-cream/70">ชำระเงินเพื่อเปิดดูและแชร์ได้เลย</p>

      {/* ตัวอย่างปกแบบเบลอ */}
      <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-3xl bg-teal shadow-2xl">
        {cover?.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- รูปย่อจากแชทในเครื่อง
          <img src={cover.thumb} alt="" className="absolute inset-0 size-full scale-110 object-cover blur-lg" />
        ) : (
          <div
            className="absolute inset-0 blur-lg"
            style={{ background: `linear-gradient(160deg, ${cover?.color ?? "#1E6B63"}, #2B2019)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
        <div className="absolute inset-x-0 top-0 p-6 text-cream">
          <p className="text-[10px] tracking-[0.3em] opacity-80">PASSPORT AI</p>
          <p className="mt-1 font-heading text-3xl font-semibold drop-shadow">{trip.title}</p>
          <p className="text-sm opacity-85">{formatDateRange(trip.start_date, endDay)}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center text-cream">
          <span className="text-4xl" aria-hidden>
            🔒
          </span>
          <p className="mt-2 font-heading text-lg font-semibold">ชำระเงินเพื่อเปิดดู</p>
        </div>
      </div>

      <section className="mt-6 space-y-2 rounded-2xl bg-cream p-5 text-brown">
        <Line label={`แพ็กเกจ ${bill.plannedDays} วัน`} value={formatBaht(bill.packagePrice)} />
        {bill.extraDays > 0 && <Line label={`ต่อทริปเพิ่ม ${bill.extraDays} วัน`} value={formatBaht(bill.extraPrice)} />}
        {bill.actualDays < bill.plannedDays && (
          <p className="text-xs text-brown/60">
            เที่ยวจริง {bill.actualDays} วัน (จบก่อนกำหนด คิดตามแพ็กเกจที่ตั้งไว้)
          </p>
        )}
        <div className="flex items-baseline justify-between border-t border-brown/15 pt-3">
          <span className="font-medium">รวม</span>
          <span className="font-heading text-3xl font-semibold text-orange">{formatBaht(bill.total)}</span>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="mt-3 w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream disabled:opacity-60"
        >
          {paying ? "กำลังชำระเงิน..." : `ชำระเงิน ${formatBaht(bill.total)}`}
        </button>
        <p className="text-center">
          <span className="inline-block rounded-full bg-gold/25 px-3 py-0.5 text-xs text-brown/80">
            บัญชีทดสอบ · ชำระเงินจำลอง
          </span>
        </p>
      </section>
    </main>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-brown/80">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// เข้าหน้านี้ผิดสถานะ (ยังเที่ยวอยู่ / จ่ายแล้ว / เสร็จแล้ว) พาไปหน้าที่ถูก
function NotReady({ trip }: { trip?: StoredTrip }) {
  const link = !trip
    ? { href: "/", label: "กลับหน้าแรก", text: "ไม่พบทริปนี้" }
    : trip.status === "active"
      ? { href: `/trip/${trip.id}/chat`, label: "กลับไปที่แชท", text: "ทริปนี้ยังไม่จบ" }
      : trip.status === "paid"
        ? { href: `/trip/${trip.id}/progress`, label: "ดูความคืบหน้า", text: "ชำระเงินแล้ว" }
        : { href: `/t/${trip.slug}`, label: "ดูพาสปอร์ต", text: "พาสปอร์ตเสร็จแล้ว" };
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <p className="text-xl">{link.text}</p>
      <Link href={link.href} className="mt-4 inline-block text-cream/70 underline">
        {link.label}
      </Link>
    </main>
  );
}
