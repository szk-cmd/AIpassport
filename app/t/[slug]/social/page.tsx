import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { RouteLine } from "@/components/RouteMap";
import { formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";

export const metadata: Metadata = { title: `การ์ดโซเชียล ${MOCK_SUMMARY.title} – PassportAI` };

// การ์ดออกแบบที่ขนาดจริง (px) แล้วย่อด้วย CSS เพื่อแสดงตัวอย่างบนจอ
const PREVIEW_SCALE = 0.3;

// MOCK: ยังไม่อ่าน slug จาก URL ใช้ทริปตัวอย่างเสมอ
export default function SocialPage() {
  const s = MOCK_SUMMARY;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <Link href={`/t/${MOCK_SLUG}`} className="text-sm text-cream/70 hover:text-cream">
        ← กลับหน้าทริป
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">การ์ดโซเชียล</h1>
      <p className="mt-1 text-cream/70">เลือกขนาดที่ต้องการ แล้วแชร์ลง IG / Facebook / TikTok</p>

      <Preview label="Story · 1080×1920" width={1080} height={1920}>
        <StoryCard s={s} />
      </Preview>

      <Preview label="Post · 1080×1080" width={1080} height={1080}>
        <SquareCard s={s} />
      </Preview>

      <Preview label="พื้นโปร่งใส · วางทับรูปตัวเอง" width={1080} height={1920} checker>
        <TransparentCard s={s} />
      </Preview>

      <p className="mt-8 text-center text-sm text-cream/50">ปุ่มดาวน์โหลดรูปจะเพิ่มในสัปดาห์ที่ 3</p>
    </main>
  );
}

function Preview({
  label,
  width,
  height,
  checker = false,
  children,
}: {
  label: string;
  width: number;
  height: number;
  checker?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 flex flex-col items-center">
      <p className="mb-2 self-start font-medium">{label}</p>
      <div
        className="overflow-hidden rounded-xl shadow-2xl"
        style={{
          width: width * PREVIEW_SCALE,
          height: height * PREVIEW_SCALE,
          // ลายตารางหมากรุกบอกว่าตรงนี้โปร่งใส
          background: checker ? "repeating-conic-gradient(#555 0% 25%, #777 0% 50%) 0 0 / 24px 24px" : undefined,
        }}
      >
        <div style={{ width, height, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

function Logo({ size = 44 }: { size?: number }) {
  return (
    <p className="font-heading font-semibold tracking-wide" style={{ fontSize: size }}>
      <span className="text-orange">Passport</span>AI
    </p>
  );
}

function Stats({ s, size = 1 }: { s: TripSummary; size?: number }) {
  const items = [
    { value: s.stats.days, label: "วัน" },
    { value: s.stats.places, label: "สถานที่" },
    { value: s.stats.distance_km, label: "กม." },
  ];
  return (
    <div className="flex" style={{ gap: 72 * size }}>
      {items.map((it) => (
        <div key={it.label}>
          <p style={{ fontSize: 34 * size }} className="opacity-70">
            {it.label}
          </p>
          <p style={{ fontSize: 96 * size, lineHeight: 1.1 }} className="font-heading font-semibold">
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// 1080×1920: รูปเต็มจอ + ข้อมูลด้านล่าง
function StoryCard({ s }: { s: TripSummary }) {
  const photo = getPhoto(s.social.photo_id);
  return (
    <div className="relative h-full w-full bg-brown text-cream">
      {photo && (
        <div className="absolute inset-0">
          <Photo photo={photo} className="h-full w-full" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brown/40 to-brown" />
      <div className="absolute inset-0 flex flex-col justify-between p-[88px]">
        <Logo />
        <div>
          <RouteLine route={s.route} width={420} height={420} color="#E8A93C" />
          <h2 className="mt-12 text-[120px] leading-tight font-bold">{s.social.headline}</h2>
          <p className="mt-2 text-[44px] opacity-80">{formatDateRange(s.start_date, s.end_date)}</p>
          <div className="mt-16">
            <Stats s={s} />
          </div>
          <p className="mt-16 text-[40px] text-gold">#PassportAI</p>
        </div>
      </div>
    </div>
  );
}

// 1080×1080: พื้นสีครีม เส้นทางใหญ่ minimal
function SquareCard({ s }: { s: TripSummary }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-cream p-[80px] text-brown">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[88px] leading-tight font-bold">{s.social.headline}</h2>
          <p className="text-[38px] opacity-70">{formatDateRange(s.start_date, s.end_date)}</p>
        </div>
        <Logo size={38} />
      </div>
      <div className="flex justify-center">
        <RouteLine route={s.route} width={440} height={340} />
      </div>
      <div className="flex items-end justify-between">
        <Stats s={s} size={0.8} />
        <p className="text-[34px] text-teal">#PassportAI</p>
      </div>
    </div>
  );
}

// 1080×1920 พื้นโปร่งใส: มีแค่ตัวหนังสือและเส้นทาง ไว้วางทับรูปของผู้ใช้เอง
function TransparentCard({ s }: { s: TripSummary }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-end pb-[220px] text-center text-white">
      <RouteLine route={s.route} width={380} height={380} color="#FFFFFF" />
      <h2 className="mt-12 text-[96px] leading-tight font-bold drop-shadow-lg">{s.social.headline}</h2>
      <div className="mt-10 drop-shadow-lg">
        <Stats s={s} size={0.9} />
      </div>
      <div className="mt-14 flex items-center gap-6 text-[38px] drop-shadow-lg">
        <span className="font-heading font-semibold">PassportAI</span>
        <span className="opacity-80">#PassportAI</span>
      </div>
    </div>
  );
}
