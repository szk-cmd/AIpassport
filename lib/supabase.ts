import { createClient } from "@supabase/supabase-js";

// Client ฝั่ง browser: ใช้ anon key ซึ่งเปิดเผยได้ (ขึ้นต้นด้วย NEXT_PUBLIC_)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
