import { Stamp, STAMP_COLORS } from "@/components/cards/Stamp";
import { Photo } from "@/components/Photo";
import { formatDateRange } from "@/lib/format";
import type { TripSummary } from "@/lib/types";
import { CornerQr, orderedPhotos, Sheet, type TemplateProps } from "./shared";

// พาสปอร์ต: หน้าข้อมูลพาสปอร์ต + ตราประทับสถานที่ + แถบ MRZ ด้านล่าง
export function Passport({ s, slug, text, heroId }: TemplateProps) {
  const [hero] = orderedPhotos(s, heroId);
  const stamps = stampsOf(s).slice(0, 3);
  const fields = [
    { label: "ชื่อทริป · TRIP", value: s.print.headline, big: true },
    { label: "วันที่ · DATES", value: formatDateRange(s.start_date, s.end_date) },
    { label: "ระยะเวลา · DURATION", value: `${s.stats.days} วัน · ${s.stats.places} สถานที่` },
    { label: "ระยะทาง · DISTANCE", value: `${s.stats.distance_km.toLocaleString("th-TH")} กม.` },
  ];

  return (
    <Sheet className="bg-[#F4EFE4]">
      {/* ลายเส้นจางๆ แบบกระดาษพาสปอร์ต */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "repeating-radial-gradient(circle at 80% 30%, #1E6B63 0 0.3cqw, transparent 0.3cqw 2.4cqw)",
        }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between bg-teal px-[5cqw] py-[2.5cqw] text-cream">
          <span className="font-heading text-[3.6cqw] font-semibold">หนังสือเดินทางแห่งความทรงจำ</span>
          <span className="font-heading text-[3.6cqw] font-semibold tracking-[0.3em]">PASSPORT</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-[5cqw] pt-[5cqw]">
          <div className="flex shrink-0 gap-[4cqw]">
            {hero && (
              <Photo
                photo={hero}
                hidePlace
                className="aspect-[3/4] w-[36cqw] shrink-0 rounded-[1cqw] border-[0.5cqw] border-white shadow-md"
              />
            )}
            <dl className="min-w-0 space-y-[2.2cqw]">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-[2.6cqw] font-semibold tracking-wide text-teal">{f.label}</dt>
                  <dd
                    className={`font-heading leading-tight font-semibold ${f.big ? "text-[6.4cqw] font-bold" : "text-[4.4cqw]"}`}
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-[4cqw] line-clamp-3 shrink-0 border-l-[0.8cqw] border-orange pl-[3cqw] font-heading text-[4.8cqw] leading-snug font-medium">
            {text}
          </p>

          <div className="flex min-h-0 flex-1 justify-between gap-[2cqw] pb-[3cqw]">
            <div className="flex flex-1 items-center justify-around">
              {stamps.map((st, i) => (
                <Stamp
                  key={st.label}
                  label={st.label}
                  sub={st.sub}
                  shape={i === 1 ? "rect" : "circle"}
                  color={STAMP_COLORS[i % 2]}
                  className={i === 1 ? "w-[30cqw]" : "w-[25cqw]"}
                />
              ))}
            </div>
            <div className="self-end">
              <CornerQr slug={slug} light="#F4EFE4" label={false} />
            </div>
          </div>
        </div>

        {/* แถบ MRZ ตัวพิมพ์เครื่องแบบพาสปอร์ตจริง */}
        <div className="shrink-0 overflow-hidden border-t-[0.4cqw] border-brown/30 bg-white px-[5cqw] py-[2.5cqw] font-mono text-[3cqw] leading-relaxed font-semibold whitespace-pre">
          {mrzLines(s, slug).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

// สถานที่แรกของแต่ละวันก่อน (ตราจะได้กระจายทุกวัน) แล้วค่อยต่อด้วยที่เหลือ ไม่ซ้ำ
// พร้อมวันที่ไปแบบตราประทับ เช่น "14 NOV"
function stampsOf(s: TripSummary) {
  const all = s.days.flatMap((d) =>
    d.places.map((place, i) => ({
      label: place,
      sub: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase(),
      first: i === 0,
    })),
  );
  const ordered = [...all.filter((x) => x.first), ...all.filter((x) => !x.first)];
  return ordered.filter((x, i) => ordered.findIndex((y) => y.label === x.label) === i);
}

// 2 บรรทัด บรรทัดละ 44 ตัว เติมด้วย "<" เหมือน MRZ จริง (ใช้ slug เพราะ MRZ เป็นอักษรอังกฤษเท่านั้น)
function mrzLines(s: TripSummary, slug: string) {
  const pad = (t: string) => t.toUpperCase().replace(/[^A-Z0-9<]/g, "<").padEnd(44, "<").slice(0, 44);
  const ymd = (d: string) => d.replaceAll("-", "");
  return [
    pad(`P<THA${slug}<<PASSPORTAI`),
    pad(`${ymd(s.start_date)}<${ymd(s.end_date)}<D${s.stats.days}<P${s.stats.places}<KM${s.stats.distance_km}`),
  ];
}
