import { connection } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/health : ลองอ่านตาราง trips เพื่อเช็กว่าต่อฐานข้อมูลได้
export async function GET() {
  await connection(); // เช็กใหม่ทุกครั้ง ไม่ใช้ผลที่ build ไว้ล่วงหน้า

  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("trips").select("id").limit(1);
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
