"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_TRIP } from "@/lib/mock";

// ข้อความภาษาคน ไม่บอกชื่อ agent (เรียงตามลำดับงานใน CLAUDE.md)
const STEPS = [
  "กำลังอ่านรูป ตั๋ว และใบเสร็จของคุณ...",
  "กำลังคัดรูปที่สวยที่สุด...",
  "กำลังเขียนเรื่องเล่าและสรุปค่าใช้จ่าย...",
  "กำลังรวมเล่มหนังสือเดินทาง...",
];

const STEP_MS = 2000; // MOCK: ของจริงจะ polling สถานะจาก DB ทุก 2 วิ

export function ProgressView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length;
  const reviewUrl = `/trip/${MOCK_TRIP.id}/review`;

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length));
    }, STEP_MS);
    return () => clearInterval(timer);
  }, []);

  // เสร็จแล้วพาไปหน้าตรวจทานอัตโนมัติ
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.push(reviewUrl), 1500);
    return () => clearTimeout(timer);
  }, [done, router, reviewUrl]);

  const percent = Math.round((step / STEPS.length) * 100);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <p className="font-heading text-sm tracking-widest text-gold">ขั้นที่ 2 จาก 3</p>
      <h1 className="mt-1 text-3xl font-semibold">{MOCK_TRIP.title}</h1>

      {/* ตราประทับหมุน */}
      <div className="my-10 flex justify-center">
        <div
          className={`flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed font-heading text-4xl ${
            done ? "border-teal bg-teal text-cream" : "animate-spin border-gold text-gold [animation-duration:6s]"
          }`}
          aria-hidden
        >
          {done ? "✓" : "✈"}
        </div>
      </div>

      <p className="text-center font-heading text-xl" aria-live="polite">
        {done ? "เสร็จแล้ว! กำลังพาไปตรวจทาน..." : STEPS[step]}
      </p>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-cream/15">
        <div
          className="h-full rounded-full bg-orange transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-8 space-y-3">
        {STEPS.map((text, i) => (
          <li
            key={text}
            className={`flex items-center gap-3 ${i < step ? "text-cream" : i === step ? "text-gold" : "text-cream/35"}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                i < step ? "bg-teal text-cream" : "border border-current"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            {text.replace("กำลัง", "").replace("...", "")}
          </li>
        ))}
      </ol>

      {done && (
        <Link
          href={reviewUrl}
          className="mt-10 block rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream"
        >
          ไปตรวจทานเลย
        </Link>
      )}
    </main>
  );
}
