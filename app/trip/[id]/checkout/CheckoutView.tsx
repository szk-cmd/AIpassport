"use client";

import { FlaskConical, Lock, Receipt } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  EmptyState,
  ICON,
} from "@/components/ui";
import { tripBill } from "@/lib/config";
import { formatBaht, formatDateRange } from "@/lib/format";
import {
  dayCount,
  isRetroTrip,
  todayKey,
  updateTrip,
  useStore,
  type StoredTrip,
} from "@/lib/trip-store";

// สรุปค่าบริการหลังจบทริป + ตัวอย่างปกแบบเบลอ, บัญชีทดสอบกดชำระแล้วถือว่าสำเร็จทันที
export function CheckoutView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useStore();
  const [paying, setPaying] = useState(false);
  if (!data) return null;

  const trip = data.trips.find((t) => t.id === id);
  if (!trip || trip.status !== "ended") return <NotReady trip={trip} />;

  // ทริปย้อนหลังกดจบวันนี้ แต่คิดเงินตามวันของทริปจริง (ไม่นับวันที่ผ่านมาหลังทริปจบ)
  const endDay = isRetroTrip(trip)
    ? trip.end_date
    : trip.ended_at
      ? todayKey(new Date(trip.ended_at))
      : todayKey();
  const bill = tripBill(
    trip.planned_days,
    Math.max(1, dayCount(trip.start_date, endDay)),
  );
  // ปกใช้รูปแรกที่ส่งในแชท ไม่ต้องรอ AI สรุปเสร็จ
  const cover = data.messages[id]?.flatMap((m) => m.photos ?? [])[0];

  function handlePay() {
    setPaying(true);
    // ชำระเงินจำลอง: ยังไม่มี payment gateway
    updateTrip(id, {
      status: "paid",
      paid_amount: bill.total,
      paid_at: new Date().toISOString(),
    });
    setTimeout(() => router.push(`/trip/${id}/progress`), 600);
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto w-full max-w-md px-4 pt-8 pb-8">
        <h1 className="font-sans text-title font-semibold">
          พาสปอร์ตของคุณพร้อมแล้ว
        </h1>
        <p className="mt-2 text-body text-ink-muted">
          ชำระเงินเพื่อเปิดดูและแชร์ได้เลย
        </p>

        {/* ตัวอย่างปกแบบเบลอ (การ์ดปกทริป ใช้น้ำตาลแบรนด์) */}
        <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-card bg-brown shadow-soft">
          {cover?.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- รูปย่อจากแชทในเครื่อง
            <img
              src={cover.thumb}
              alt=""
              className="absolute inset-0 size-full scale-110 object-cover blur-lg"
            />
          ) : (
            <div
              className="absolute inset-0 blur-lg"
              style={{
                background: `linear-gradient(160deg, ${cover?.color ?? "#1E6B63"}, #2B2019)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-brown/40 via-transparent to-brown/80" />
          <div className="absolute inset-x-0 top-0 p-6 text-white">
            <p className="text-heading font-semibold">{trip.title}</p>
            <p className="text-label text-white/70">
              {formatDateRange(trip.start_date, endDay)}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center text-white">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/15">
              <Lock {...ICON} />
            </span>
            <p className="mt-2 text-body font-semibold">ชำระเงินเพื่อเปิดดู</p>
          </div>
        </div>

        <Card className="mt-6">
          <div className="space-y-2">
            <Line
              label={`แพ็กเกจ ${bill.plannedDays} วัน`}
              value={formatBaht(bill.packagePrice)}
            />
            {bill.extraDays > 0 && (
              <Line
                label={`ต่อทริปเพิ่ม ${bill.extraDays} วัน`}
                value={formatBaht(bill.extraPrice)}
              />
            )}
            {bill.actualDays < bill.plannedDays && (
              <p className="text-caption text-ink-muted">
                เที่ยวจริง {bill.actualDays} วัน (จบก่อนกำหนด
                คิดตามแพ็กเกจที่ตั้งไว้)
              </p>
            )}
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-body font-semibold">รวม</span>
            <span className="text-title font-semibold">
              {formatBaht(bill.total)}
            </span>
          </div>
        </Card>

        <Button block onClick={handlePay} disabled={paying} className="mt-6">
          {paying ? "กำลังชำระเงิน..." : `ชำระเงิน ${formatBaht(bill.total)}`}
        </Button>
        <p className="mt-3 text-center">
          <Chip icon={FlaskConical}>บัญชีทดสอบ · ชำระเงินจำลอง</Chip>
        </p>
      </main>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-body">
      <span className="text-ink-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

// เข้าหน้านี้ผิดสถานะ (ยังเที่ยวอยู่ / จ่ายแล้ว / เสร็จแล้ว) พาไปหน้าที่ถูก
function NotReady({ trip }: { trip?: StoredTrip }) {
  const link = !trip
    ? { href: "/", label: "กลับหน้าแรก", text: "ไม่พบทริปนี้" }
    : trip.status === "active"
      ? {
          href: `/trip/${trip.id}/chat`,
          label: "กลับไปที่แชท",
          text: "ทริปนี้ยังไม่จบ",
        }
      : trip.status === "paid"
        ? {
            href: `/trip/${trip.id}/progress`,
            label: "ดูความคืบหน้า",
            text: "ชำระเงินแล้ว",
          }
        : {
            href: `/t/${trip.slug}`,
            label: "ดูพาสปอร์ต",
            text: "พาสปอร์ตเสร็จแล้ว",
          };
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <EmptyState
        icon={Receipt}
        title={link.text}
        action={
          <ButtonLink href={link.href} block variant="secondary">
            {link.label}
          </ButtonLink>
        }
        className="pt-24"
      />
    </div>
  );
}
