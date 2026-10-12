import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { PrintButton } from "@/components/PrintButton";
import { QrCode } from "@/components/QrCode";
import { formatDateRange } from "@/lib/format";
import { getPhoto, MOCK_SLUG, MOCK_SUMMARY } from "@/lib/mock";

export const metadata: Metadata = { title: `กรอบรูป ${MOCK_SUMMARY.title} – PassportAI` };

// ตั้งค่ากระดาษ A4 แนวตั้ง และซ่อนทุกอย่างยกเว้นแผ่นกรอบรูปตอนพิมพ์
const printCss = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  .no-print { display: none !important; }
  .print-area { padding: 0 !important; max-width: none !important; }
  .a4-sheet { width: 210mm !important; box-shadow: none !important; border-radius: 0 !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

// MOCK: ยังไม่อ่าน slug จาก URL ใช้ทริปตัวอย่างเสมอ
export default function PrintPage() {
  const s = MOCK_SUMMARY;
  const [main, ...rest] = s.print.photo_ids.map(getPhoto);

  return (
    <main className="print-area mx-auto w-full max-w-2xl px-4 py-8">
      <style>{printCss}</style>

      <div className="no-print mb-6">
        <Link href={`/t/${MOCK_SLUG}`} className="text-sm text-cream/70 hover:text-cream">
          ← กลับหน้าทริป
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">กรอบรูปสำหรับพิมพ์</h1>
        <p className="mt-1 text-cream/70">กระดาษ A4 แนวตั้ง ตัวอักษรใหญ่ อ่านง่ายสำหรับผู้ใหญ่ที่บ้าน</p>
      </div>

      {/* แผ่น A4: ทุกขนาดใช้หน่วย cqw (% ของความกว้างแผ่น) จึงย่อ/ขยายได้ทั้งแผ่น */}
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
                  <QrCode path={`/t/${MOCK_SLUG}`} size={300} fluid />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print mx-auto mt-6 max-w-md">
        <PrintButton />
      </div>
    </main>
  );
}
