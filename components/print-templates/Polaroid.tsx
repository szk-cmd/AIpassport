import { seeded } from "@/components/cards/Stamp";
import { Photo } from "@/components/Photo";
import { formatDateRange } from "@/lib/format";
import { CornerQr, photosOf, Sheet, type TemplateProps } from "./shared";

// โพลารอยด์: รูป 4-6 รูปเอียงเล็กน้อย มีคำบรรยายใต้รูป
export function Polaroid({ s, slug, text, photoIds, hidden }: TemplateProps) {
  const photos = photosOf(photoIds).slice(0, 6);
  const show = (key: TemplateProps["hidden"][number]) => !hidden.includes(key);
  const threeCols = photos.length > 4;

  return (
    <Sheet className="bg-[#EFE6D8]">
      <div className="flex h-full flex-col p-[6cqw]">
        <div className="shrink-0 text-center">
          <h2 className="font-heading text-[8cqw] leading-tight font-bold">{s.print.headline}</h2>
          {show("date") && <p className="text-[4cqw] font-medium">{formatDateRange(s.start_date, s.end_date)}</p>}
        </div>

        <div
          className={`my-auto grid content-center gap-x-[4cqw] gap-y-[5cqw] py-[4cqw] ${
            threeCols ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {photos.map((p, i) => (
            <figure
              key={p.id}
              className="bg-white p-[2cqw] pb-[1.5cqw] shadow-[0_0.6cqw_1.6cqw_rgba(43,32,25,0.3)]"
              // เอียงสลับซ้าย-ขวา มุมคงที่จาก id รูป
              style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1.5 + seeded(p.id) * 2.5)}deg)` }}
            >
              <Photo photo={p} hidePlace className={threeCols ? "aspect-square" : "aspect-[4/3]"} />
              {show("captions") && (
                <figcaption
                  className={`mt-[1.5cqw] line-clamp-2 text-center font-heading leading-tight font-medium ${
                    threeCols ? "min-h-[7.5cqw] text-[3cqw]" : "min-h-[9cqw] text-[3.6cqw]"
                  }`}
                >
                  {p.data.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="flex shrink-0 items-end justify-between gap-[3cqw]">
          {show("text") ? (
            <p className="line-clamp-3 font-heading text-[4.6cqw] leading-snug font-medium">“{text}”</p>
          ) : (
            <span />
          )}
          {show("qr") && <CornerQr slug={slug} light="#EFE6D8" />}
        </div>
      </div>
    </Sheet>
  );
}
