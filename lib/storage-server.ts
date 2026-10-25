// ดึงรูปจาก Supabase Storage ฝั่ง server เพื่อส่งให้ AI ดู (เบราว์เซอร์ส่งมาแค่ลิงก์)
import "server-only";
import type { AiAttachment } from "./ai";

const BUCKET = "trip-files";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

// รับเฉพาะลิงก์ไฟล์สาธารณะใน bucket ของเราเท่านั้น กันไม่ให้ใครสั่ง server ไปโหลดลิงก์อื่น
export function isTripFileUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  return url.startsWith(`${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`);
}

// คืน null ถ้าโหลดไม่ได้ ไม่ใช่รูป หรือใหญ่เกิน (ให้แชทตอบต่อได้โดยไม่มีรูป)
export async function fetchTripImage(url: string): Promise<AiAttachment | null> {
  if (!isTripFileUrl(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const type = res.headers.get("content-type")?.split(";")[0];
    if (!res.ok || (type !== "image/jpeg" && type !== "image/png" && type !== "image/webp")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > MAX_IMAGE_BYTES) return null;
    return { mimeType: type, data: bytes.toString("base64") };
  } catch (error) {
    console.warn("[storage] โหลดรูปไม่สำเร็จ", error);
    return null;
  }
}
