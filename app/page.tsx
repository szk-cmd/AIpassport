import Link from "next/link";
import { LogoTile, Wordmark } from "@/components/Logo";
import { Photo } from "@/components/Photo";
import { formatBaht, formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";

const FEATURES = [
  { icon: "photo", label: "รูปและตั๋ว" },
  { icon: "coins", label: "ค่าใช้จ่าย" },
  { icon: "story", label: "เรื่องเล่า" },
  { icon: "cloud", label: "เก็บไว้ตลอดไป" },
] as const;

export default function HomePage() {
  const s = MOCK_SUMMARY;
  const cover = getPhoto(s.cover_photo_id);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-14 pb-10 text-center">
      {/* ---------- แบรนด์ ---------- */}
      <LogoTile size={128} />
      <h1 className="mt-6">
        <Wordmark className="text-5xl" />
      </h1>
      <p className="mt-2 text-xs tracking-[0.4em] text-cream/60">YOUR TRIP, FOREVER</p>
      <p className="mt-6 text-lg leading-relaxed text-cream/85">
        ให้ AI เปลี่ยนทริปของคุณ
        <br />
        ให้เป็น “หนังสือเดินทางแห่งความทรงจำ”
      </p>

      {/* ---------- ปุ่มเริ่ม ---------- */}
      <div className="mt-8 w-full space-y-3">
        <Link
          href="/new"
          className="block w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream shadow-lg transition hover:brightness-110"
        >
          ลองใช้งานเลย ไม่ต้องสมัคร
        </Link>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-cream/25 py-4 font-medium text-cream/50"
        >
          เข้าสู่ระบบ
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">เร็วๆ นี้</span>
        </button>
      </div>

      {/* ---------- จุดเด่น ---------- */}
      <ul className="mt-10 grid w-full grid-cols-4 divide-x divide-cream/10">
        {FEATURES.map((f) => (
          <li key={f.label} className="flex flex-col items-center gap-2 px-1">
            <FeatureIcon name={f.icon} />
            <span className="text-xs text-cream/70">{f.label}</span>
          </li>
        ))}
      </ul>

      {/* ---------- ตัวอย่างผลลัพธ์ ---------- */}
      <section className="mt-12 w-full text-left">
        <p className="text-center text-xs tracking-[0.3em] text-cream/50">ตัวอย่างหนังสือเดินทาง</p>
        <Link
          href={`/t/${MOCK_SLUG}`}
          className="mt-3 block overflow-hidden rounded-3xl bg-cream text-brown shadow-2xl transition hover:-translate-y-0.5"
        >
          <div className="relative">
            {cover && <Photo photo={cover} className="h-44" />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="absolute top-0 left-0 p-4 text-cream">
              <p className="text-[10px] tracking-[0.3em] opacity-80">TRIP SUMMARY</p>
              <p className="font-heading text-2xl font-semibold">{s.title}</p>
              <p className="text-sm opacity-85">{formatDateRange(s.start_date, s.end_date)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-brown/10 py-4 text-center">
            <div>
              <p className="font-heading text-xl font-semibold">{s.stats.places}</p>
              <p className="text-xs text-brown/60">สถานที่</p>
            </div>
            <div>
              <p className="font-heading text-xl font-semibold">{formatBaht(s.expenses.total)}</p>
              <p className="text-xs text-brown/60">ใช้จ่าย</p>
            </div>
            <div>
              <p className="font-heading text-xl font-semibold">{s.stats.photos}</p>
              <p className="text-xs text-brown/60">รูป</p>
            </div>
          </div>
          <p className="border-t border-brown/10 py-3 text-center text-sm font-medium text-teal">
            ดูตัวอย่างเต็ม →
          </p>
        </Link>
      </section>
    </main>
  );
}

// ไอคอนเส้นบางๆ แบบในภาพแบรนด์
function FeatureIcon({ name }: { name: (typeof FEATURES)[number]["icon"] }) {
  const paths: Record<typeof name, React.ReactNode> = {
    photo: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 16l-5-5-8 8" />
      </>
    ),
    coins: (
      <>
        <ellipse cx="12" cy="6" rx="7" ry="2.5" />
        <path d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
        <path d="M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
        <path d="M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
      </>
    ),
    story: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    cloud: <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.5 4.25 4.25 0 0 0 7 18z" />,
  };

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E8A93C"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
