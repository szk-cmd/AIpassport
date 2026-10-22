import { QrCode } from "@/components/QrCode";
import { RouteMapImage } from "@/components/RouteMap";
import { getPhoto } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";

// ข้อมูลบนกรอบที่ผู้ใช้เปิด/ปิดได้ (แต่ละ template ประกาศว่ารองรับอะไรบ้างใน index.ts)
export type InfoKey = "date" | "text" | "captions" | "stats" | "stamps" | "map" | "qr";

export const INFO_LABELS: Record<InfoKey, string> = {
  date: "วันที่",
  text: "ข้อความสั้น",
  captions: "คำบรรยายใต้รูป",
  stats: "สถิติทริป",
  stamps: "ตราประทับ",
  map: "แผนที่เส้นทาง",
  qr: "QR โค้ด",
};

// ข้อมูลที่ปิดไว้ตั้งแต่แรก (ผู้ใช้กดเปิดเองถ้าอยากเพิ่ม)
export const DEFAULT_HIDDEN: InfoKey[] = ["map"];

// ทุก template รับ props ชุดเดียวกัน ใช้ทั้งตัวอย่างในหน้าสั่งพิมพ์และหน้า print (PDF)
export type TemplateProps = {
  s: TripSummary;
  slug: string;
  text: string; // ข้อความสั้น 2-3 บรรทัด (ผู้ใช้แก้ได้)
  photoIds: string[]; // รูปในกรอบตามลำดับที่ผู้ใช้เลือก รูปแรก = รูปใหญ่
  hidden: InfoKey[]; // ข้อมูลที่ผู้ใช้ปิดไว้
};

export const MAX_TEXT_LENGTH = 100;

type PhotoItem = NonNullable<ReturnType<typeof getPhoto>>;

// รูปทั้งหมดที่ AI คัดไว้ของทริปนี้ เรียงจากรูปกรอบรูป → รูปเด่น → รูปรายวัน ไม่ซ้ำกัน
export function aiPhotoIds(s: TripSummary) {
  return [...new Set([...s.print.photo_ids, ...s.highlight_photo_ids, ...s.days.flatMap((d) => d.photo_ids)])];
}

export function photosOf(ids: string[]): PhotoItem[] {
  return ids.map(getPhoto).filter((p): p is PhotoItem => p !== undefined);
}

// แผ่น A4 แนวตั้ง: ขนาดทุกอย่างข้างในใช้หน่วย cqw (% ของความกว้างแผ่น) จึงย่อ/ขยายได้ทั้งแผ่น
// class a4-sheet ให้ CSS ตอนพิมพ์ในหน้า print ขยายเป็น 210mm พอดี
export function Sheet({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`a4-sheet @container relative aspect-[210/297] w-full overflow-hidden text-brown ${className}`}>
      {children}
    </div>
  );
}

// แผนที่เส้นทางของทริป (ภาพ SVG พิมพ์ได้คมชัด) พร้อมคำบรรยายสั้นใต้แผนที่
export function TripMap({ s, className = "", caption = true }: { s: TripSummary; className?: string; caption?: boolean }) {
  if (s.route.length === 0) return null;
  return (
    <figure className={className}>
      <RouteMapImage route={s.route} className="block h-full w-full rounded-[1cqw] object-cover" />
      {caption && (
        <figcaption className="mt-[1cqw] text-center text-[2.6cqw] font-medium">
          {s.route.length} จุด · {s.stats.distance_km.toLocaleString("th-TH")} กม.
        </figcaption>
      )}
    </figure>
  );
}

// QR เล็กมุมล่าง สแกนแล้วเปิดเรื่องราวทั้งหมดของทริป
export function CornerQr({ slug, light = "#F7F2EA", label = true }: { slug: string; light?: string; label?: boolean }) {
  return (
    <div className="flex shrink-0 items-end gap-[1.5cqw]">
      {label && (
        <p className="text-right text-[2.6cqw] leading-snug font-medium">
          สแกนดู
          <br />
          เรื่องราว
        </p>
      )}
      <div className="w-[13cqw]">
        <QrCode path={`/t/${slug}`} size={300} fluid light={light} />
      </div>
    </div>
  );
}
