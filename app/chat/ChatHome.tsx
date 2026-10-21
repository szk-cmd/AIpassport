"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { activeTrip, useStore } from "@/lib/trip-store";

// แท็บแชท: มีทริปที่กำลังเที่ยวอยู่ → ไปแชทนั้นเลย, ไม่มี → หน้าว่างพร้อมปุ่มสร้างทริป
export function ChatHome() {
  const data = useStore();
  const router = useRouter();
  const active = data ? activeTrip(data) : undefined;

  useEffect(() => {
    if (active) router.replace(`/trip/${active.id}/chat`);
  }, [active, router]);

  if (!data || active) return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-6xl" aria-hidden>
        💬
      </span>
      <h1 className="mt-4 text-2xl font-semibold">ยังไม่มีทริปที่กำลังเที่ยว</h1>
      <p className="mt-2 text-cream/70">สร้างทริปแล้วเล่าเรื่อง ส่งรูป หรือจดค่าใช้จ่ายระหว่างเที่ยวได้ที่นี่</p>
      <Link
        href="/start"
        className="mt-6 block w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
      >
        + สร้างทริปใหม่
      </Link>
    </main>
  );
}
