// Agent 04 — Travel Passport Builder (ฝั่ง server ไม่เรียก AI)
// รวมผลของ Agent 01-03 เป็น trip_summary ชุดเดียวสำหรับ output ทั้ง 3 แบบ
import "server-only";
import type { SummaryPhoto, TripSummary } from "../types";
import type { CollectOutput, IntelligenceOutput, StoryOutput } from "./shared";

const PLACEHOLDER_COLOR = "#57534E";

export function buildSummary(
  trip: { id: string; title: string },
  collected: CollectOutput,
  story: StoryOutput,
  intel: IntelligenceOutput,
): TripSummary {
  const selected = collected.selected;
  const storyByDate = new Map(story.days.map((d) => [d.date, d]));
  const used = new Set(selected);

  // รูปทั้งหมดที่ summary อ้างถึง หน้า output หารูปจากตรงนี้เท่านั้น
  const photos: SummaryPhoto[] = collected.photos
    .filter((p) => used.has(p.id))
    .map((p) => ({
      id: p.id,
      file_url: p.file_url,
      data: {
        caption: p.caption,
        place: collected.days.find((d) => d.date === p.date)?.places[0] ?? "",
        color: p.color ?? PLACEHOLDER_COLOR,
      },
    }));

  const total = intel.expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    trip_id: trip.id,
    title: trip.title,
    start_date: collected.startDate,
    end_date: collected.endDate,
    cover_photo_id: selected[0] ?? "",
    highlight_photo_ids: selected.slice(0, 4),
    days: collected.days.map((d, i) => ({
      date: d.date,
      title: storyByDate.get(d.date)?.title ?? `วันที่ ${i + 1}`,
      story: storyByDate.get(d.date)?.story ?? "",
      places: d.places,
      photo_ids: d.photoIds,
    })),
    route: intel.route,
    expenses: { total, items: intel.expenses },
    stats: intel.stats,
    print: { headline: story.headline, short_text: story.short_text, photo_ids: selected.slice(0, 3) },
    social: { headline: story.headline, photo_id: selected[0] ?? "" },
    share: null,
    photos,
  };
}
