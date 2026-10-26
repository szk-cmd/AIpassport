// Agent 05 — Memory Preservation (ฝั่ง server ไม่เรียก AI)
// หลังผู้ใช้ยืนยันใน review: บันทึกสิ่งที่ผู้ใช้แก้ สร้าง slug (QR สร้างจากลิงก์ /t/[slug] ในหน้าเว็บ) แล้วปิดทริปเป็น completed
import "server-only";
import { MAX_TEXT_LENGTH } from "../config";
import { db, getOutput, getTrip, saveOutput } from "../trips-server";
import type { ExpenseCategory, ExpenseLine, TripSummary } from "../types";
import { PipelineError } from "./pipeline";

const MAX_FIELD = 4000;
const MAX_EXPENSES = 200;
const MAX_AMOUNT = 10_000_000;
const CATEGORIES: ExpenseCategory[] = [
  "transport",
  "lodging",
  "food",
  "activity",
  "shopping",
  "other",
];

// ค่าใช้จ่ายที่ผู้ใช้แก้/เพิ่ม/ลบในหน้า review (ตรวจทุกช่อง ไม่เชื่อค่าจากเบราว์เซอร์)
function cleanExpenses(base: TripSummary, edited: unknown): ExpenseLine[] {
  if (!Array.isArray(edited)) return base.expenses.items;
  const firstDay = base.days[0]?.date ?? base.start_date;
  return edited.slice(0, MAX_EXPENSES).flatMap((raw): ExpenseLine[] => {
    const e = raw as Partial<ExpenseLine> | null;
    const amount = Number(e?.amount);
    const label =
      typeof e?.label === "string" ? e.label.trim().slice(0, 200) : "";
    if (!label || !Number.isFinite(amount) || amount < 0 || amount > MAX_AMOUNT)
      return [];
    const date =
      typeof e?.date === "string" &&
      e.date >= base.start_date &&
      e.date <= base.end_date
        ? e.date
        : firstDay;
    const category = CATEGORIES.includes(e?.category as ExpenseCategory)
      ? (e!.category as ExpenseCategory)
      : "other";
    return [{ label, amount: Math.round(amount * 100) / 100, category, date }];
  });
}

// ผู้ใช้แก้ได้เฉพาะ: หัวข้อ/เรื่องเล่ารายวัน, ข้อความบนกรอบรูป, ค่าใช้จ่าย (แก้/เพิ่ม/ลบ)
// ส่วนอื่น (รูป เส้นทาง สถิติ) ใช้ของที่ server สรุปไว้ ไม่เชื่อค่าจากเบราว์เซอร์
function applyEdits(
  base: TripSummary,
  edited: Partial<TripSummary>,
): TripSummary {
  const text = (v: unknown, fallback: string, max = MAX_FIELD) =>
    typeof v === "string" ? v.slice(0, max) : fallback;
  const days = base.days.map((d, i) => ({
    ...d,
    title: text(edited.days?.[i]?.title, d.title, 200),
    story: text(edited.days?.[i]?.story, d.story),
  }));
  const items = cleanExpenses(base, edited.expenses?.items).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return {
    ...base,
    days,
    print: {
      ...base.print,
      short_text: text(
        edited.print?.short_text,
        base.print.short_text,
        MAX_TEXT_LENGTH,
      ),
    },
    expenses: { items, total: items.reduce((sum, e) => sum + e.amount, 0) },
  };
}

function newSlug() {
  return `trip-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

export async function publishTrip(
  tripId: string,
  edited: Partial<TripSummary>,
): Promise<string> {
  const trip = await getTrip(tripId);
  if (!trip) throw new PipelineError(404, "ไม่พบทริปนี้");
  const base = await getOutput(tripId);
  if (!base) throw new PipelineError(409, "ยังสรุปทริปไม่เสร็จ");

  // แก้ไขทริปที่ยืนยันไปแล้ว: บันทึกสิ่งที่แก้ทับ ใช้ลิงก์เดิม (ไม่คิดเงินเพิ่ม ไม่เรียก AI ใหม่)
  if (trip.status === "completed" && trip.slug) {
    await saveOutput(tripId, {
      ...applyEdits(base, edited),
      share: { slug: trip.slug },
    });
    return trip.slug;
  }
  if (trip.status !== "paid")
    throw new PipelineError(409, "ทริปนี้ยังไม่พร้อมยืนยัน");

  const slug = newSlug();
  await saveOutput(tripId, { ...applyEdits(base, edited), share: { slug } });
  const { error: se } = await db()
    .from("shares")
    .insert({ slug, trip_id: tripId });
  if (se) throw new Error(`[publish] ${se.message}`);
  const { error: te } = await db()
    .from("trips")
    .update({ status: "completed", slug })
    .eq("id", tripId);
  if (te) throw new Error(`[publish] ${te.message}`);
  return slug;
}
