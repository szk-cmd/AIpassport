import type { AiAttachment, AiMessage } from "@/lib/ai";
import { runMemoryCollection, type MemoryCollectionInput } from "@/lib/agents/memory-collection";

const MAX_TEXT = 2000;
const MAX_HISTORY = 20; // ข้อความย้อนหลังที่ส่งให้ AI (ประหยัดโควตา)
const MAX_ATTACHMENTS = 4;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/trip-chat : แชทระหว่างทริป → Agent 01 ตอบ + ดึงสถานที่/ค่าใช้จ่าย
export async function POST(request: Request) {
  const input = parse(await request.json().catch(() => null));
  if (!input) return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  return Response.json(await runMemoryCollection(input));
}

// ตรวจข้อมูลจากเบราว์เซอร์ก่อนส่งให้ AI (ไม่เชื่อค่าที่ส่งมาตรงๆ)
function parse(body: unknown): MemoryCollectionInput | null {
  const b = body as Record<string, unknown> | null;
  const trip = b?.trip as Record<string, unknown> | undefined;
  const message = b?.message as Record<string, unknown> | undefined;
  if (!trip || !message || !Array.isArray(b?.history) || !Array.isArray(message.attachments)) return null;

  const isText = (v: unknown): v is string => typeof v === "string" && v.length <= MAX_TEXT;
  const isDate = (v: unknown): v is string => typeof v === "string" && DATE.test(v);
  if (!isText(trip.title) || !isDate(trip.startDate) || !isDate(trip.endDate) || !isDate(b.today)) return null;
  if (!isText(message.text)) return null;

  const history: AiMessage[] = (b.history as unknown[])
    .filter((m): m is AiMessage => {
      const x = m as Record<string, unknown>;
      return (x?.role === "user" || x?.role === "assistant") && isText(x.text) && x.text !== "";
    })
    .slice(-MAX_HISTORY);

  const attachments: AiAttachment[] = (message.attachments as unknown[])
    .filter((a): a is AiAttachment => {
      const x = a as Record<string, unknown>;
      return x?.mimeType === "image/jpeg" && typeof x.data === "string";
    })
    .slice(0, MAX_ATTACHMENTS);

  if (!message.text.trim() && attachments.length === 0) return null;

  return {
    trip: { title: trip.title, startDate: trip.startDate, endDate: trip.endDate },
    today: b.today as string,
    history,
    message: { text: message.text.trim(), attachments },
  };
}
