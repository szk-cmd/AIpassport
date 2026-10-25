import { bad, isUuid, serverError } from "@/lib/api-helpers";
import { patchTrip } from "@/lib/trips-server";

// PATCH /api/trips/[id] : จบทริป / ต่อทริป / ชำระเงิน (แก้ได้เฉพาะช่องที่อนุญาตใน patchTrip)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!isUuid(id) || !body || typeof body !== "object") return bad();
  try {
    await patchTrip(id, body as Record<string, unknown>);
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
