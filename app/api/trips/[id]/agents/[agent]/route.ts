import { PIPELINE, runAgent, type AgentId } from "@/lib/agents/pipeline";
import { bad, isUuid, serverError } from "@/lib/api-helpers";

// 1 request = 1 agent (ห้ามรันทั้ง pipeline ใน request เดียว)
// Agent 01 ดูรูปย่อได้ถึง 150 รูป และลองใหม่ได้ 1 ครั้ง จึงเผื่อเวลา 120 วิ (Vercel Hobby สูงสุด 300)
export const maxDuration = 120;

// POST /api/trips/[id]/agents/[agent] : รัน agent 01-04 ของทริปนี้ คืนสถานะหลังทำเสร็จ
export async function POST(_request: Request, { params }: { params: Promise<{ id: string; agent: string }> }) {
  const { id, agent } = await params;
  if (!isUuid(id) || !PIPELINE.includes(agent as AgentId)) return bad();
  try {
    return Response.json(await runAgent(id, agent as AgentId));
  } catch (error) {
    return serverError(error);
  }
}
