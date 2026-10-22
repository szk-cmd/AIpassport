import { BookOpen, Camera, ChevronRight, Cloud, Wallet } from "lucide-react";
import Link from "next/link";
import { LogoTile, Wordmark } from "@/components/Logo";
import { Photo } from "@/components/Photo";
import { ICON, StatRow, StatTile } from "@/components/ui";
import { formatBaht, formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";
import { HomeGate } from "./HomeGate";
import { LoginForm } from "./LoginForm";

const FEATURES = [
  { icon: Camera, label: "รูปและตั๋ว" },
  { icon: Wallet, label: "ค่าใช้จ่าย" },
  { icon: BookOpen, label: "เรื่องเล่า" },
  { icon: Cloud, label: "เก็บไว้ตลอดไป" },
] as const;

// หน้าแรก: ยังไม่ login = หน้าแบรนด์ + ฟอร์มเข้าสู่ระบบ, login แล้ว = ประวัติทริป
export default function HomePage() {
  return <HomeGate landing={<Landing />} />;
}

// หน้า login ใช้พื้นน้ำตาลแบรนด์ (หน้าเดียวในแอปที่พื้นเข้ม)
function Landing() {
  const s = MOCK_SUMMARY;
  const cover = getPhoto(s.cover_photo_id);

  return (
    <div className="min-h-dvh bg-brown text-white">
      <main className="mx-auto flex w-full max-w-md flex-col px-6 pt-16 pb-12">
        {/* ---------- แบรนด์ ---------- */}
        <LogoTile size={72} />
        <h1 className="mt-6">
          <Wordmark className="text-title" />
        </h1>
        <p className="mt-2 text-body text-white/70">
          ให้ AI เปลี่ยนทริปของคุณให้เป็น “หนังสือเดินทางแห่งความทรงจำ”
        </p>

        {/* ---------- เข้าสู่ระบบ ---------- */}
        <LoginForm />

        {/* ---------- จุดเด่น ---------- */}
        <ul className="mt-12 grid grid-cols-4 gap-2">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Icon {...ICON} />
              </span>
              <span className="text-caption text-white/60">{label}</span>
            </li>
          ))}
        </ul>

        {/* ---------- ตัวอย่างผลลัพธ์ ---------- */}
        <section className="mt-12">
          <p className="text-label text-white/60">ตัวอย่างหนังสือเดินทาง</p>
          <Link
            href={`/t/${MOCK_SLUG}`}
            className="mt-4 block overflow-hidden rounded-card bg-card text-ink shadow-soft transition-transform active:scale-[0.99]"
          >
            {cover && <Photo photo={cover} hidePlace className="h-44" />}
            <div className="p-6">
              <p className="text-heading font-semibold">{s.title}</p>
              <p className="text-label text-ink-muted">{formatDateRange(s.start_date, s.end_date)}</p>
              <StatRow className="mt-6">
                <StatTile value={s.stats.places} label="สถานที่" />
                <StatTile value={formatBaht(s.expenses.total)} label="ใช้จ่าย" />
                <StatTile value={s.stats.photos} label="รูป" />
              </StatRow>
              <p className="mt-6 flex items-center gap-1 text-label font-semibold text-brand">
                ดูตัวอย่างเต็ม
                <ChevronRight {...ICON} size={16} />
              </p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
