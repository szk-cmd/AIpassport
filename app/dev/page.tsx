import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_IDS } from "@/lib/demo-ids";
import { MOCK_SLUG, MOCK_TRIP } from "@/lib/mock";
import { DEMO_ACTIVE_ID, DEMO_IDLE_ID } from "@/lib/mock-active";

export const metadata: Metadata = { title: "Dev – PassportAI" };

// หน้า confirm ยังเป็นตัวอย่างเดิม (ไม่อยู่ใน flow) progress/review ใช้ทริปเดโมจริงในฐานข้อมูล
const id = DEMO_IDS.chiangmai;

const GROUPS = [
  {
    title: "Flow ผู้ใช้",
    links: [
      { href: "/", label: "0. หน้าแรก (login test/1234 → ทริปของฉัน)", note: "/" },
      { href: "/start", label: "1. สร้างทริปใหม่", note: "/start" },
      { href: "/chat", label: "2. แท็บแชท (รายการทริปที่กำลังเที่ยว)", note: "/chat" },
      { href: `/trip/${DEMO_ACTIVE_ID}/chat`, label: "2a. แชทหัวหิน (วันที่ 2)", note: "/trip/[id]/chat" },
      { href: `/trip/${DEMO_IDLE_ID}/chat`, label: "2b. แชทเขาใหญ่ (ค้างไว้ เลยวันจบ)", note: "/trip/[id]/chat" },
      { href: `/trip/${DEMO_ACTIVE_ID}/photos`, label: "3. จบทริป → เพิ่มรูปย้อนหลัง", note: "/trip/[id]/photos" },
      { href: `/trip/${DEMO_ACTIVE_ID}/checkout`, label: "3b. สรุปค่าบริการ (ต้องกดจบทริปก่อน)", note: "/trip/[id]/checkout" },
      { href: `/trip/${id}/confirm`, label: "4. ตรวจสอบข้อมูล", note: "/trip/[id]/confirm" },
      { href: `/trip/${id}/progress`, label: "5. กำลังสร้าง", note: "/trip/[id]/progress" },
      { href: `/trip/${id}/review`, label: "6. ตรวจทาน", note: "/trip/[id]/review" },
    ],
  },
  {
    title: "Output 3 แบบ",
    links: [
      { href: `/t/${MOCK_SLUG}`, label: "Digital History", note: "/t/[slug]" },
      { href: `/t/${MOCK_SLUG}/print`, label: "กรอบรูป A4", note: "/t/[slug]/print" },
      { href: `/t/${MOCK_SLUG}/social`, label: "การ์ดโซเชียล", note: "/t/[slug]/social" },
      { href: `/t/${MOCK_SLUG}/order`, label: "สั่งพิมพ์กรอบรูป", note: "/t/[slug]/order" },
    ],
  },
  {
    title: "ระบบ",
    links: [
      { href: "/api/health", label: "เช็กฐานข้อมูล", note: "/api/health" },
      { href: "/api/ai-test", label: "เช็ก AI (ส่ง “สวัสดี”)", note: "/api/ai-test" },
    ],
  },
];

export default function DevPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="font-heading text-sm tracking-widest text-gold">DEV</p>
      <h1 className="mt-1 text-3xl font-semibold">ทุกหน้าใน PassportAI</h1>
      <p className="mt-2 text-cream/70">ทุกหน้าใช้ข้อมูลตัวอย่าง &quot;{MOCK_TRIP.title}&quot;</p>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-8">
          <h2 className="text-lg font-semibold text-gold">{g.title}</h2>
          <ul className="mt-3 space-y-2">
            {g.links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-brown transition hover:bg-gold/80"
                >
                  <span className="font-medium">{l.label}</span>
                  <span className="font-mono text-xs text-brown/50">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
