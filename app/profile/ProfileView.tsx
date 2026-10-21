"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, resetStore, useSession, useStore } from "@/lib/trip-store";

const buttonClass = "block w-full rounded-xl px-4 py-3.5 text-left hover:bg-brown/5";

export function ProfileView() {
  const user = useSession();
  const data = useStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-10 pb-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-cream font-heading text-3xl font-bold text-orange">
          {user?.[0]?.toUpperCase()}
        </div>
        <p className="mt-3 font-heading text-2xl font-semibold">{user}</p>
        <span className="mt-1 rounded-full bg-gold/20 px-3 py-0.5 text-xs text-gold">บัญชีทดสอบ</span>
        {data && <p className="mt-2 text-sm text-cream/60">{data.trips.length} ทริป</p>}
      </div>

      <section className="mt-8 divide-y divide-brown/10 rounded-2xl bg-cream text-brown">
        <p className="px-4 pt-4 pb-2 text-xs font-semibold tracking-wider text-brown/50">ข้อมูลทดสอบ</p>
        <button type="button" onClick={() => resetStore()} className={buttonClass}>
          🔄 รีเซ็ตข้อมูลเดโม
          <span className="block text-xs text-brown/50">กลับไปเป็นทริปตัวอย่างตั้งต้น</span>
        </button>
        <button type="button" onClick={() => resetStore(true)} className={buttonClass}>
          🧹 ล้างทริปทั้งหมด
          <span className="block text-xs text-brown/50">ลองดูหน้าตาแบบผู้ใช้ใหม่</span>
        </button>
        <Link href="/dev" className={buttonClass}>
          🛠 หน้ารวมลิงก์ (dev)
        </Link>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 w-full rounded-full border-2 border-cream/25 py-3 font-semibold hover:bg-cream/10"
      >
        ออกจากระบบ
      </button>
    </main>
  );
}
