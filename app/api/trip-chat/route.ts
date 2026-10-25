import type { AiMessage } from "@/lib/ai";
import { runMemoryCollection, type MemoryCollectionInput } from "@/lib/agents/memory-collection";
import { fetchTripImage, isTripFileUrl } from "@/lib/storage-server";

// Vercel Hobby ตั้งได้สูงสุด 300 วิ แชทหนึ่งข้อความเรียก AI 2 ครั้งพร้อมกัน (+ลองใหม่เมื่อคนใช้เยอะ)
// 60 วิพอ และผู้ใช้ไม่ต้องรอนานเกินไปถ้า AI ค้าง
export const maxDuration = 60;

const MAX_TEXT = 2000;
const MAX_HISTORY = 20; // ข้อความย้อนหลังที่ส่งให้ AI (ประหยัดโควตา)
const MAX_ATTACHMENTS = 4;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/trip-chat : แชทระหว่างทริป → Agent 01 ตอบ + ดึงสถานที่/ค่าใช้จ่าย (request นี้ทำแค่ Agent 01)
// รูปไม่ได้ส่งมากับ request: เบราว์เซอร์อัปโหลดเข้า Storage แล้วส่งมาแค่ลิงก์ ฝั่งนี้ค่อยดึงรูปมาให้ AI
export async function POST(request: Request) {
  const parsed = parse(await request.json().catch(() => null));
  if (!parsed) return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const images = await Promise.all(parsed.imageUrls.map(fetchTripImage));
  const attachments = images.filter((a) => a !== null);
  const input: MemoryCollectionInput = { ...parsed.input, message: { ...parsed.input.message, attachments } };
  return Response.json(await runMemoryCollection(input));
}

// ตรวจข้อมูลจากเบราว์เซอร์ก่อนส่งให้ AI (ไม่เชื่อค่าที่ส่งมาตรงๆ)
function parse(body: unknown): { input: MemoryCollectionInput; imageUrls: string[] } | null {
  const b = body as Record<string, unknown> | null;
  const trip = b?.trip as Record<string, unknown> | undefined;
  const message = b?.message as Record<string, unknown> | undefined;
  if (!trip || !message || !Array.isArray(b?.history) || !Array.isArray(message.imageUrls)) return null;

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

  // รับเฉพาะลิงก์ไฟล์ใน bucket ของเรา
  const imageUrls = (message.imageUrls as unknown[])
    .filter((u): u is string => typeof u === "string" && isTripFileUrl(u))
    .slice(0, MAX_ATTACHMENTS);

  if (!message.text.trim() && imageUrls.length === 0) return null;

  return {
    input: {
      trip: { title: trip.title, startDate: trip.startDate, endDate: trip.endDate },
      today: b.today as string,
      history,
      message: { text: message.text.trim(), attachments: [] },
    },
    imageUrls,
  };
}
