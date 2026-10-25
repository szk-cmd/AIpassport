// อัปโหลดไฟล์ตรงจากเบราว์เซอร์เข้า Supabase Storage (bucket trip-files)
// ไม่ส่งไฟล์ผ่าน API route ของเรา เพราะ Vercel รับ request ได้ไม่เกิน ~4.5MB
import { browserSupabase } from "./supabase";

export const BUCKET = "trip-files";

// คืน URL สาธารณะของไฟล์ หรือ null ถ้าอัปโหลดไม่ได้ (ไม่มี env / เน็ตหลุด) ให้ผู้เรียกทำงานต่อได้
export async function uploadTripFile(tripId: string, file: Blob): Promise<string | null> {
  const supabase = browserSupabase();
  if (!supabase) return null;

  const ext = file.type === "application/pdf" ? "pdf" : "jpg";
  const path = `${tripId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) {
    console.warn("[upload]", error.message);
    return null;
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
