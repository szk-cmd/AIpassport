import { Photo } from "@/components/Photo";
import { formatDateRange } from "@/lib/format";
import { CornerQr, photosOf, Sheet, type TemplateProps } from "./shared";

// คลาสสิก: รูปใหญ่ 1 + รูปเล็กสูงสุด 4 ชื่อทริปและวันที่ด้านล่าง
export function Classic({ s, slug, text, photoIds, hidden }: TemplateProps) {
  const [hero, ...rest] = photosOf(photoIds);
  const small = rest.slice(0, 4);
  const show = (key: TemplateProps["hidden"][number]) => !hidden.includes(key);

  return (
    <Sheet className="bg-cream">
      <div className="flex h-full flex-col border-[2.5cqw] border-brown p-[3cqw]">
        <div className="flex h-full flex-col border-[0.4cqw] border-gold p-[3.5cqw]">
          {hero && <Photo photo={hero} hidePlace className="min-h-0 flex-1 rounded-[1.2cqw]" />}

          {small.length > 0 && (
            // รูปเล็กน้อยกว่า 4 ยังขนาดเท่าเดิม จัดไว้ตรงกลาง
            <div className="mt-[2cqw] flex shrink-0 justify-center gap-[2cqw]">
              {small.map((p) => (
                <Photo key={p.id} photo={p} hidePlace className="aspect-square w-[calc((100%-6cqw)/4)] rounded-[1cqw]" />
              ))}
            </div>
          )}

          {show("text") && (
            <p className="mt-[3.5cqw] line-clamp-3 shrink-0 text-center font-heading text-[5cqw] leading-snug font-medium">
              “{text}”
            </p>
          )}

          <div className="mt-[3.5cqw] flex shrink-0 items-end justify-between gap-[3cqw] border-t-[0.4cqw] border-brown/25 pt-[3cqw]">
            <div className="min-w-0">
              <h2 className="font-heading text-[8cqw] leading-tight font-bold">{s.print.headline}</h2>
              {show("date") && <p className="text-[4cqw] font-medium">{formatDateRange(s.start_date, s.end_date)}</p>}
            </div>
            {show("qr") && <CornerQr slug={slug} />}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
