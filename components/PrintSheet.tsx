import { Photo } from "@/components/Photo";
import { QrCode } from "@/components/QrCode";
import { formatDateRange } from "@/lib/format";
import { getPhoto } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";

// แผ่นกรอบรูป A4 แนวตั้ง ใช้ทั้งหน้า print และตัวอย่างในหน้าสั่งพิมพ์
export function PrintSheet({ s, slug }: { s: TripSummary; slug: string }) {
  const [main, ...rest] = s.print.photo_ids.map(getPhoto);

  // ทุกขนาดใช้หน่วย cqw (% ของความกว้างแผ่น) จึงย่อ/ขยายได้ทั้งแผ่น
  return (
    <div
      className="a4-sheet @container mx-auto aspect-[210/297] w-full overflow-hidden rounded-sm bg-cream text-brown shadow-2xl"
    >
      <div className="flex h-full flex-col border-[2.5cqw] border-brown p-[4cqw]">
        <div className="flex h-full flex-col border-[0.4cqw] border-gold p-[4cqw]">
          <p className="text-center font-heading text-[2.6cqw] tracking-[0.3em] text-teal">
            หนังสือเดินทางแห่งความทรงจำ
          </p>
          <h2 className="mt-[1.5cqw] text-center font-heading text-[8cqw] leading-tight font-bold">
            {s.print.headline}
          </h2>
          <p className="text-center text-[3.6cqw] text-brown/70">
            {formatDateRange(s.start_date, s.end_date)}
          </p>

          {main && <Photo photo={main} className="mt-[3cqw] h-[38cqw] shrink-0 rounded-[1.5cqw]" />}
          <div className="mt-[2cqw] grid shrink-0 grid-cols-2 gap-[2cqw]">
            {rest.map((p) => p && <Photo key={p.id} photo={p} className="h-[20cqw] rounded-[1.5cqw]" />)}
          </div>

          <p className="mt-[3cqw] flex-1 text-center font-heading text-[5.2cqw] leading-snug font-medium">
            “{s.print.short_text}”
          </p>

          <div className="flex items-end justify-between">
            <div>
              <p className="font-heading text-[3.4cqw] font-semibold text-orange">PassportAI</p>
              <p className="text-[2.6cqw] text-brown/60">#PassportAI</p>
            </div>
            <div className="flex items-end gap-[2cqw]">
              <p className="text-right text-[2.8cqw] leading-snug text-brown/70">
                สแกนเพื่อดู
                <br />
                เรื่องราวทั้งหมด
              </p>
              <div className="w-[16cqw]">
                <QrCode path={`/t/${slug}`} size={300} fluid />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
