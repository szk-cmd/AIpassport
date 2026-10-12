import type { Metadata } from "next";
import Link from "next/link";
import { MOCK_SLUG, MOCK_TRIP } from "@/lib/mock";

export const metadata: Metadata = { title: "Dev – PassportAI" };

const id = MOCK_TRIP.id;

const GROUPS = [
  {
    title: "Flow ผู้ใช้",
    links: [
      { href: "/", label: "0. หน้าแรก", note: "/" },
      { href: "/new", label: "1. เริ่มทริปใหม่", note: "/new" },
      { href: `/trip/${id}/confirm`, label: "2. ตรวจสอบข้อมูล", note: "/trip/[id]/confirm" },
      { href: `/trip/${id}/progress`, label: "3. กำลังสร้าง", note: "/trip/[id]/progress" },
      { href: `/trip/${id}/review`, label: "4. ตรวจทาน", note: "/trip/[id]/review" },
    ],
  },
  {
    title: "Output 3 แบบ",
    links: [
      { href: `/t/${MOCK_SLUG}`, label: "Digital History", note: "/t/[slug]" },
      { href: `/t/${MOCK_SLUG}/print`, label: "กรอบรูป A4", note: "/t/[slug]/print" },
      { href: `/t/${MOCK_SLUG}/social`, label: "การ์ดโซเชียล", note: "/t/[slug]/social" },
    ],
  },
  {
    title: "ระบบ",
    links: [{ href: "/api/health", label: "เช็กฐานข้อมูล", note: "/api/health" }],
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
