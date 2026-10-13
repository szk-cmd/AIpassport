"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const SWIPE_DISTANCE = 100; // ลากเกินกี่ px ถึงนับว่าปัด
const SWIPE_VELOCITY = 500; // หรือสะบัดเร็วเกินนี้
const PEEK = 3; // จำนวนการ์ดที่ซ้อนให้เห็นด้านหลัง (รวมใบบนสุด)

// การ์ดเกือบเต็มจอ แนวตั้ง สูงไม่เกิน 780px (เผื่อที่ให้หัวหน้าและปุ่มด้านล่าง)
const DEFAULT_HEIGHT = "min(calc(100dvh - 175px), 780px)";
const stackSize = (height: string) => ({
  height,
  width: `min(calc(100vw - 32px), calc(${height} * 0.62))`,
});

type Props = {
  cards: React.ReactNode[];
  height?: string; // ความสูงการ์ด (CSS) เช่น "min(calc(100dvh - 300px), 640px)"
};

// ระยะที่การ์ดบินออกไปทางซ้ายจนพ้นจอ (การ์ดที่ปัดออกมีได้หลังผู้ใช้กดเท่านั้น จึงอยู่ในเบราว์เซอร์เสมอ)
const flyDistance = () => (typeof window === "undefined" ? 1200 : window.innerWidth * 1.2);

// กองการ์ดแบบ Tinder: ปัดซ้าย = ใบถัดไป, ปัดขวา = ย้อนกลับ
export function CardStack({ cards, height = DEFAULT_HEIGHT }: Props) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const last = cards.length - 1;

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // วาดใบก่อนหน้า 1 ใบ (ไว้บินกลับเข้ามา) + ใบปัจจุบัน + ใบถัดไปที่ซ้อนอยู่
  const visible: number[] = [];
  for (let i = index - 1; i < index + PEEK; i++) if (i >= 0 && i <= last) visible.push(i);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
      {/* mb เผื่อขอบการ์ดใบหลังที่โผล่ลงมาใต้ใบบน */}
      <div className="relative mb-7" style={stackSize(height)} aria-roledescription="กองการ์ด">
        {visible
          .slice()
          .reverse() // ใบล่างวาดก่อน ใบบนสุดอยู่บนสุด
          .map((i) => (
            <StackCard
              key={i}
              position={i - index}
              reduce={reduce}
              canNext={index < last}
              canPrev={index > 0}
              onNext={next}
              onPrev={prev}
            >
              {cards[i]}
            </StackCard>
          ))}
      </div>

      {/* ---------- ปุ่มและตัวบอกตำแหน่ง ---------- */}
      <div className="flex items-center gap-5">
        <NavButton label="การ์ดก่อนหน้า" disabled={index === 0} onClick={prev}>
          ←
        </NavButton>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`ไปการ์ดที่ ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-orange" : "w-2 bg-cream/30 hover:bg-cream/60"}`}
              />
            ))}
          </div>
          <p className="font-heading text-sm text-cream/70" aria-live="polite">
            {index + 1} / {cards.length}
          </p>
        </div>
        <NavButton label="การ์ดถัดไป" disabled={index === last} onClick={next}>
          →
        </NavButton>
      </div>
    </div>
  );
}

type StackCardProps = {
  position: number; // -1 = ปัดออกไปแล้ว, 0 = บนสุด, 1+ = ซ้อนอยู่ข้างหลัง
  reduce: boolean;
  canNext: boolean;
  canPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
};

function StackCard({ position, reduce, canNext, canPrev, onNext, onPrev, children }: StackCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-16, 0, 16]); // เอียงตามทิศที่ลาก
  const isTop = position === 0;
  const dragged = useRef(false); // ลากแล้วปล่อย ไม่นับเป็นการแตะลิงก์ในการ์ด

  function handleDragEnd(_: unknown, info: PanInfo) {
    const swipedLeft = info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY;
    const swipedRight = info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY;

    if (swipedLeft && canNext) {
      onNext(); // การ์ดจะบินออกเพราะ position กลายเป็น -1
    } else {
      if (swipedRight && canPrev) onPrev(); // ใบก่อนหน้าบินกลับเข้ามาทับ
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 }); // เด้งกลับที่เดิม
    }
  }

  // ตำแหน่งของการ์ดแต่ละสถานะ
  const target =
    position < 0
      ? reduce
        ? { x: 0, y: 0, scale: 1, opacity: 0 } // reduced motion: จางหายแทนบินออก
        : { x: -flyDistance(), y: 0, scale: 1, opacity: 1 }
      : { x: 0, y: position * 14, scale: 1 - position * 0.05, opacity: position >= PEEK ? 0 : 1 };

  return (
    <motion.div
      className="absolute inset-0 touch-pan-y select-none"
      style={{
        x,
        rotate,
        zIndex: 10 - position,
        originY: 1, // ย่อจากขอบล่าง ให้เห็นขอบการ์ดใบหลังโผล่ใต้ใบบน
        pointerEvents: position < 0 ? "none" : undefined,
      }}
      initial={position >= PEEK - 1 ? { ...target, opacity: 0 } : false}
      animate={target}
      transition={
        reduce
          ? { duration: 0.25 }
          : { type: "spring", stiffness: 260, damping: 28, opacity: { duration: 0.2 } }
      }
      drag={isTop ? "x" : false}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onPointerDown={() => (dragged.current = false)}
      onDragStart={() => (dragged.current = true)}
      onClickCapture={(e) => {
        if (dragged.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      aria-hidden={!isTop}
    >
      <div
        className={`@container h-full w-full overflow-hidden rounded-[28px] bg-cream text-brown ${
          isTop ? "shadow-2xl shadow-black/50" : "shadow-lg shadow-black/30"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-lg text-cream transition hover:bg-cream/10 disabled:opacity-25"
    >
      {children}
    </button>
  );
}
