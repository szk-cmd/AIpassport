import { QrCode } from "@/components/QrCode";
import { getPhoto } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";

// ทุก template รับ props ชุดเดียวกัน ใช้ทั้งตัวอย่างในหน้าสั่งพิมพ์และหน้า print (PDF)
export type TemplateProps = {
  s: TripSummary;
  slug: string;
  text: string; // ข้อความสั้น 2-3 บรรทัด (ผู้ใช้แก้ได้)
  heroId: string; // รูปเด่น (สลับได้จากรูปที่ AI คัด)
};

export const MAX_TEXT_LENGTH = 100;

type PhotoItem = NonNullable<ReturnType<typeof getPhoto>>;

// รูปทั้งหมดที่ AI คัดไว้ของทริปนี้ เรียงจากรูปกรอบรูป → รูปเด่น → รูปรายวัน ไม่ซ้ำกัน
export function aiPhotoIds(s: TripSummary) {
  return [...new Set([...s.print.photo_ids, ...s.highlight_photo_ids, ...s.days.flatMap((d) => d.photo_ids)])];
}

// รูปเด่นขึ้นก่อน ตามด้วยรูปอื่นที่ AI คัดไว้
export function orderedPhotos(s: TripSummary, heroId: string): PhotoItem[] {
  const ids = aiPhotoIds(s);
  const rest = ids.filter((id) => id !== heroId);
  return [heroId, ...rest].map(getPhoto).filter((p): p is PhotoItem => p !== undefined);
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
