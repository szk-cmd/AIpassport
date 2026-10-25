import { publishTrip } from "@/lib/agents/preserve";
import { bad, isUuid, serverError } from "@/lib/api-helpers";
import type { TripSummary } from "@/lib/types";

// POST /api/trips/[id]/publish : ผู้ใช้ยืนยันใน review → Agent 05 สร้าง slug ปิดทริปเป็น completed
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { summary?: unknown } | null;
  if (!isUuid(id) || !body?.summary || typeof body.summary !== "object") return bad();
  try {
    return Response.json({ slug: await publishTrip(id, body.summary as Partial<TripSummary>) });
  } catch (error) {
    return serverError(error);
  }
}
