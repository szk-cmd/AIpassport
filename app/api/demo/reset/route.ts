import { bad, serverError } from "@/lib/api-helpers";
import { resetAccount } from "@/lib/seed";

export const maxDuration = 60; // ลบไฟล์ใน Storage หลายไฟล์อาจใช้เวลา

// POST /api/demo/reset : ปุ่มในหน้าโปรไฟล์ ล้างข้อมูลบัญชีทดสอบทั้งหมด (demo = seed ทริปเดโมกลับมา, empty = ไม่ seed)
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { mode?: string } | null;
  const mode = body?.mode;
  if (mode !== "demo" && mode !== "empty") return bad();
  try {
    await resetAccount(mode);
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
