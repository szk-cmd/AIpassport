import { connection } from "next/server";
import { aiInfo, chat } from "@/lib/ai";

// GET /api/ai-test : ส่ง "สวัสดี" ให้ AI แล้วแสดงคำตอบ เช็กว่าต่อ AI ได้
export async function GET() {
  await connection(); // เรียกใหม่ทุกครั้ง ไม่ใช้ผลที่ build ไว้ล่วงหน้า

  const { provider, model } = aiInfo();
  const started = Date.now();
  const reply = await chat([{ role: "user", text: "สวัสดี" }], [], {
    system: "ทดสอบการเชื่อมต่อ ตอบทักทายสั้นๆ เป็นภาษาไทย 1 ประโยค",
  });
  return Response.json({
    provider, // mock = ยังไม่ได้เรียก AI จริง (ไม่มี key หรือ AI_PROVIDER=mock)
    model,
    message: "สวัสดี",
    reply,
    ms: Date.now() - started,
  });
}
