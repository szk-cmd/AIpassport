import { bad, isUuid, serverError } from "@/lib/api-helpers";
import { patchMessage } from "@/lib/trips-server";
import type { Extracted } from "@/lib/types";

// PATCH /api/messages/[id] : เก็บสถานที่/ค่าใช้จ่ายที่ Agent 01 ดึงจากข้อความ
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { extracted?: Extracted } | null;
  const e = body?.extracted;
  if (!isUuid(id) || !e || !Array.isArray(e.places) || !Array.isArray(e.expenses)) return bad();
  try {
    await patchMessage(id, { extracted: e });
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
