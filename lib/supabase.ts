import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client ฝั่ง browser: ใช้ anon key ซึ่งเปิดเผยได้ (ขึ้นต้นด้วย NEXT_PUBLIC_)
// สร้างตอนใช้ครั้งแรก ไม่สร้างตอน import (ตอน build/render ฝั่ง server ไม่ต้องมี env ก็ไม่พัง)
// คืน null ถ้ายังไม่ได้ตั้งค่า env
let client: SupabaseClient | null = null;

export function browserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}
