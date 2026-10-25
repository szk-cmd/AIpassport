// Agent 05 — Memory Preservation (ฝั่ง server ไม่เรียก AI)
// หลังผู้ใช้ยืนยันใน review: บันทึกสิ่งที่ผู้ใช้แก้ สร้าง slug (QR สร้างจากลิงก์ /t/[slug] ในหน้าเว็บ) แล้วปิดทริปเป็น completed
import "server-only";
import { MAX_TEXT_LENGTH } from "../config";
import { db, getOutput, getTrip, saveOutput } from "../trips-server";
import type { TripSummary } from "../types";
import { PipelineError } from "./pipeline";

const MAX_FIELD = 4000;

// ผู้ใช้แก้ได้เฉพาะ: หัวข้อ/เรื่องเล่ารายวัน, ข้อความบนกรอบรูป, ชื่อและราคาค่าใช้จ่าย
// ส่วนอื่น (รูป เส้นทาง สถิติ) ใช้ของที่ server สรุปไว้ ไม่เชื่อค่าจากเบราว์เซอร์
function applyEdits(base: TripSummary, edited: Partial<TripSummary>): TripSummary {
  const text = (v: unknown, fallback: string, max = MAX_FIELD) =>
    typeof v === "string" ? v.slice(0, max) : fallback;
  const days = base.days.map((d, i) => ({
    ...d,
    title: text(edited.days?.[i]?.title, d.title, 200),
    story: text(edited.days?.[i]?.story, d.story),
  }));
  const items = base.expenses.items.map((e, i) => {
    const amount = Number(edited.expenses?.items?.[i]?.amount);
    return {
      ...e,
      label: text(edited.expenses?.items?.[i]?.label, e.label, 200),
      amount: Number.isFinite(amount) && amount >= 0 ? amount : e.amount,
    };
  });
  return {
    ...base,
    days,
    print: { ...base.print, short_text: text(edited.print?.short_text, base.print.short_text, MAX_TEXT_LENGTH) },
    expenses: { items, total: items.reduce((sum, e) => sum + e.amount, 0) },
  };
}

function newSlug() {
  return `trip-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

export async function publishTrip(tripId: string, edited: Partial<TripSummary>): Promise<string> {
  const trip = await getTrip(tripId);
  if (!trip) throw new PipelineError(404, "ไม่พบทริปนี้");
  if (trip.status === "completed" && trip.slug) return trip.slug; // กดยืนยันซ้ำ
  if (trip.status !== "paid") throw new PipelineError(409, "ทริปนี้ยังไม่พร้อมยืนยัน");
  const base = await getOutput(tripId);
  if (!base) throw new PipelineError(409, "ยังสรุปทริปไม่เสร็จ");

  const slug = newSlug();
  await saveOutput(tripId, { ...applyEdits(base, edited), share: { slug } });
  const { error: se } = await db().from("shares").insert({ slug, trip_id: tripId });
  if (se) throw new Error(`[publish] ${se.message}`);
  const { error: te } = await db().from("trips").update({ status: "completed", slug }).eq("id", tripId);
  if (te) throw new Error(`[publish] ${te.message}`);
  return slug;
}
