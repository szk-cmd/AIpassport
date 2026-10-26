import { bad, isUuid, serverError } from "@/lib/api-helpers";
import type { ChatMessage } from "@/lib/trip-store";
import { addMessages } from "@/lib/trips-server";

const MAX_TEXT = 4000;
const MAX_PHOTOS = 10;
const MAX_THUMB = 200_000; // รูปย่อ 320px เป็น data URL ไม่ควรเกินนี้

function validMessage(m: unknown): m is ChatMessage {
  const x = m as Record<string, unknown>;
  if (!x || !isUuid(x.id) || (x.from !== "user" && x.from !== "bot") || typeof x.at !== "string") return false;
  if (x.text !== undefined && (typeof x.text !== "string" || x.text.length > MAX_TEXT)) return false;
  if (x.storyDate !== undefined && (typeof x.storyDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.storyDate))) return false;
  if (x.photos !== undefined) {
    if (!Array.isArray(x.photos) || x.photos.length > MAX_PHOTOS) return false;
    for (const p of x.photos as Record<string, unknown>[]) {
      if (typeof p?.caption !== "string" || typeof p.color !== "string") return false;
      if (p.thumb != null && (typeof p.thumb !== "string" || p.thumb.length > MAX_THUMB)) return false;
    }
  }
  return true;
}

// POST /api/trips/[id]/messages : บันทึกข้อความแชท (รูปที่แนบมาเป็นลิงก์บน Storage แล้ว ไม่ใช่ไฟล์)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { messages?: unknown[] } | null;
  if (!isUuid(id) || !Array.isArray(body?.messages) || !body.messages.every(validMessage)) return bad();
  try {
    await addMessages(id, body.messages as ChatMessage[]);
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
