import { bad, isUuid, serverError } from "@/lib/api-helpers";
import { createTrip } from "@/lib/trips-server";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/trips : สร้างทริปใหม่ (สถานะ active) + ข้อความต้อนรับในแชท
export async function POST(request: Request) {
  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const ok =
    b &&
    isUuid(b.id) &&
    typeof b.title === "string" &&
    b.title.trim() !== "" &&
    b.title.length <= 200 &&
    typeof b.start_date === "string" &&
    DATE.test(b.start_date) &&
    typeof b.end_date === "string" &&
    DATE.test(b.end_date) &&
    b.end_date >= b.start_date &&
    Number.isInteger(b.planned_days) &&
    (b.planned_days as number) > 0;
  if (!ok) return bad();
  try {
    await createTrip({
      id: b.id as string,
      title: (b.title as string).trim(),
      start_date: b.start_date as string,
      end_date: b.end_date as string,
      planned_days: b.planned_days as number,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
