// กันไม่ให้ไฟล์นี้ถูก import เข้าโค้ดฝั่ง browser (build จะ error ทันที)
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client ฝั่ง server: ใช้ service role key ซึ่งข้ามสิทธิ์ทุกอย่าง ห้ามหลุดไป browser
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ใน .env.local",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
