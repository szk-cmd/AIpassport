import { Photo } from "@/components/Photo";
import { formatDateRange } from "@/lib/format";
import { CornerQr, photosOf, Sheet, TripMap, type TemplateProps } from "./shared";

// มินิมอล: รูปเดียวเต็มกรอบ ชื่อสถานที่และวันที่ตัวบาง แต่ใหญ่และเข้มพออ่านง่าย
export function Minimal({ s, slug, text, photoIds, hidden }: TemplateProps) {
  const [hero] = photosOf(s, photoIds);
  const show = (key: TemplateProps["hidden"][number]) => !hidden.includes(key);

  return (
    <Sheet className="bg-white">
      <div className="flex h-full flex-col p-[6cqw]">
        <div className="relative flex min-h-0 flex-1 flex-col">
          {hero && <Photo photo={hero} hidePlace className="min-h-0 flex-1" />}
          {show("map") && (
            <div className="absolute right-[3cqw] bottom-[3cqw] w-[30cqw] bg-white p-[1cqw] shadow-lg">
              <TripMap s={s} className="w-full" caption={false} />
            </div>
          )}
        </div>

        <div className="mt-[5cqw] flex shrink-0 items-end justify-between gap-[4cqw]">
          <div className="min-w-0">
            <h2 className="font-heading text-[9cqw] leading-tight font-light">{hero?.data.place ?? s.print.headline}</h2>
            {show("date") && (
              <p className="mt-[0.5cqw] font-heading text-[4.2cqw] font-light tracking-[0.15em]">
                {formatDateRange(s.start_date, s.end_date)}
              </p>
            )}
            {show("text") && <p className="mt-[3cqw] line-clamp-3 text-[4.2cqw] leading-snug">{text}</p>}
          </div>
          {show("qr") && <CornerQr slug={slug} light="#FFFFFF" label={false} />}
        </div>
      </div>
    </Sheet>
  );
}
