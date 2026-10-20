"use client";

import Link from "next/link";
import { useState } from "react";

// ราคายังไม่ได้ตั้ง ใส่ [฿__] ไว้ก่อน
const SIZES = [
  { id: "a4", label: "A4", note: "21 × 29.7 ซม.", price: "[฿__]" },
  { id: "8x10", label: "8 × 10 นิ้ว", note: "20 × 25 ซม.", price: "[฿__]" },
] as const;

const FRAMES = [
  { id: "wood", label: "ไม้ธรรมชาติ", color: "linear-gradient(135deg, #C9965F, #9A6B3E 60%, #B88552)" },
  { id: "black", label: "ดำ", color: "#1C1714" },
  { id: "white", label: "ขาว", color: "#FDFBF7" },
] as const;

type Props = { slug: string; children: React.ReactNode };

// เลือกขนาด + สีกรอบ ดูตัวอย่างสด ยังไม่มีระบบจ่ายเงิน
export function OrderForm({ slug, children }: Props) {
  const [sizeId, setSizeId] = useState<(typeof SIZES)[number]["id"]>("a4");
  const [frameId, setFrameId] = useState<(typeof FRAMES)[number]["id"]>("wood");
  const [comingSoon, setComingSoon] = useState(false);
  const size = SIZES.find((s) => s.id === sizeId)!;
  const frame = FRAMES.find((f) => f.id === frameId)!;

  const optionClass = (on: boolean) =>
    `rounded-xl border-2 px-3 py-2 text-left transition ${
      on ? "border-orange bg-orange/10" : "border-brown/15 bg-white hover:border-orange/50"
    }`;

  return (
    <div className="mt-6 space-y-6">
      {/* ตัวอย่างกรอบรูป: เอาแผ่นจากหน้า print มาใส่กรอบตามสีที่เลือก */}
      <div className="mx-auto w-4/5 p-[5%] shadow-2xl" style={{ background: frame.color }}>
        <div className="shadow-inner">{children}</div>
      </div>

      <section className="space-y-5 rounded-2xl bg-cream p-5 text-brown">
        <div>
          <p className="font-medium">ขนาด</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSizeId(s.id)}
                aria-pressed={s.id === sizeId}
                className={optionClass(s.id === sizeId)}
              >
                <span className="block font-heading font-semibold">{s.label}</span>
                <span className="block text-xs text-brown/60">{s.note}</span>
                <span className="mt-1 block text-sm font-semibold text-orange">{s.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-medium">สีกรอบ</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrameId(f.id)}
                aria-pressed={f.id === frameId}
                className={`${optionClass(f.id === frameId)} flex flex-col items-center`}
              >
                <span className="size-8 rounded-full border border-brown/20" style={{ background: f.color }} />
                <span className="mt-1 text-sm">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-brown/15 pt-3">
          <span className="text-sm text-brown/70">
            {size.label} · กรอบ{frame.label}
          </span>
          <span className="font-heading text-2xl font-semibold text-orange">{size.price}</span>
        </div>

        <button
          type="button"
          onClick={() => setComingSoon(true)}
          className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
        >
          สั่งพิมพ์
        </button>
        {comingSoon && (
          <p className="rounded-lg bg-[#FCE9C2] px-3 py-2 text-center text-sm">ฟีเจอร์นี้เปิดให้บริการเร็วๆ นี้</p>
        )}

        <Link
          href={`/t/${slug}/print`}
          className="block w-full rounded-full border-2 border-brown/20 py-3 text-center font-heading font-semibold hover:bg-brown/5"
        >
          ⬇ ดาวน์โหลด PDF ไปพิมพ์เอง
        </Link>
      </section>

      <Link href={`/t/${slug}`} className="block text-center text-sm text-cream/70 underline hover:text-cream">
        ข้ามไปก่อน กลับไปดูพาสปอร์ต
      </Link>
    </div>
  );
}
