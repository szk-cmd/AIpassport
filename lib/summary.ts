// ตัวช่วยอ่าน trip_summary ใช้ได้ทั้งฝั่ง server และ browser
import { getPhoto } from "./mock";
import type { SummaryPhoto, TripSummary } from "./types";

// หารูปจาก id: ทริปจริงใช้รูปใน summary.photos เท่านั้น (ไม่ย้อนไปหาข้อมูลเดโม)
// ทริปเดโมชุดเดิม (ไม่มี summary.photos) ใช้รูปตัวอย่างจาก lib/mock.ts
export function photoOf(s: TripSummary, id: string): SummaryPhoto | undefined {
  if (s.photos) return s.photos.find((p) => p.id === id);
  return getPhoto(id);
}
