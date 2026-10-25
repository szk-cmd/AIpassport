import { connection } from "next/server";
import { bad, isUuid, serverError } from "@/lib/api-helpers";
import { getOutput } from "@/lib/trips-server";

// GET /api/trips/[id]/output : trip_summary ที่ Agent 04 สรุปไว้ (หน้า review แก้ก่อนยืนยัน)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!isUuid(id)) return bad();
  try {
    const summary = await getOutput(id);
    return summary ? Response.json({ summary }) : bad("ยังสรุปทริปไม่เสร็จ", 404);
  } catch (error) {
    return serverError(error);
  }
}
