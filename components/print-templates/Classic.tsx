import { Photo } from "@/components/Photo";
import { formatDateRange } from "@/lib/format";
import { CornerQr, orderedPhotos, Sheet, type TemplateProps } from "./shared";

// คลาสสิก: รูปใหญ่ 1 + รูปเล็ก 4 ชื่อทริปและวันที่ด้านล่าง
export function Classic({ s, slug, text, heroId }: TemplateProps) {
  const [hero, ...rest] = orderedPhotos(s, heroId);
  const small = rest.slice(0, 4);

  return (
    <Sheet className="bg-cream">
      <div className="flex h-full flex-col border-[2.5cqw] border-brown p-[3cqw]">
        <div className="flex h-full flex-col border-[0.4cqw] border-gold p-[3.5cqw]">
          {hero && <Photo photo={hero} hidePlace className="min-h-0 flex-1 rounded-[1.2cqw]" />}

          <div className="mt-[2cqw] grid shrink-0 grid-cols-4 gap-[2cqw]">
            {small.map((p) => (
              <Photo key={p.id} photo={p} hidePlace className="aspect-square rounded-[1cqw]" />
            ))}
          </div>

          <p className="mt-[3.5cqw] line-clamp-3 shrink-0 text-center font-heading text-[5cqw] leading-snug font-medium">
            “{text}”
          </p>

          <div className="mt-[3.5cqw] flex shrink-0 items-end justify-between gap-[3cqw] border-t-[0.4cqw] border-brown/25 pt-[3cqw]">
            <div className="min-w-0">
              <h2 className="font-heading text-[8cqw] leading-tight font-bold">{s.print.headline}</h2>
              <p className="text-[4cqw] font-medium">{formatDateRange(s.start_date, s.end_date)}</p>
            </div>
            <CornerQr slug={slug} />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
