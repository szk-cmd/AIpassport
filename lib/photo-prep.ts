// เตรียมรูปในเบราว์เซอร์ก่อนอัปโหลด: อ่าน EXIF → ย่อรูป → จับกลุ่มเป็นทริปตามวันที่
// ใช้ฝั่ง client เท่านั้น (ต้องมี canvas / createImageBitmap)
import { AI_IMAGE_MAX_SIDE, MAX_FILE_MB } from "./config";

const MAX_SIDE = 1200; // ด้านยาวหลังย่อ (px)
const JPEG_QUALITY = 0.8;
const MAX_GAP_DAYS = 1; // วันที่ถ่ายห่างกันเกินนี้ = คนละทริป
const MAX_BYTES = MAX_FILE_MB * 1024 * 1024;

export type PreparedFile = {
  id: string; // ชื่อ+ขนาดไฟล์ต้นฉบับ ใช้กันเลือกซ้ำ
  name: string;
  kind: "image" | "pdf";
  blob: Blob; // ไฟล์ที่จะอัปโหลด (รูปที่ย่อแล้ว หรือไฟล์เดิมถ้าย่อไม่ได้)
  previewUrl: string | null;
  takenAt: string | null; // YYYY-MM-DD ตามเวลาท้องถิ่นที่ถ่าย, null = ไม่มี EXIF
  lat: number | null;
  lng: number | null;
};

export type TripGroup = { start: string; end: string; files: PreparedFile[] };

export function fileId(file: File) {
  return `${file.name}:${file.size}`;
}

// รูป HEIC บน Windows มักไม่มี type เลยดูจากนามสกุลด้วย
export function isSupported(file: File) {
  return file.type.startsWith("image/") || file.type === "application/pdf" || /\.(heic|heif)$/i.test(file.name);
}

// คืน null ถ้าไฟล์ใช้ไม่ได้ (PDF ใหญ่เกิน หรือรูปที่ย่อไม่ได้และใหญ่เกิน)
export async function prepareFile(file: File): Promise<PreparedFile | null> {
  const base = { id: fileId(file), name: file.name };

  if (file.type === "application/pdf") {
    if (file.size > MAX_BYTES) return null;
    return { ...base, kind: "pdf", blob: file, previewUrl: null, takenAt: null, lat: null, lng: null };
  }

  // อ่าน EXIF ก่อนย่อ เพราะ canvas จะทิ้ง EXIF ไป
  // import ตอนใช้ เพราะ exifr พยายามโหลด fs/zlib ถ้าถูกเรียกตอน render ฝั่ง server
  const { default: exifr } = await import("exifr");
  const exif = await exifr.parse(file, { gps: true, xmp: false, icc: false, iptc: false }).catch(() => null);
  const taken: unknown = exif?.DateTimeOriginal ?? exif?.CreateDate;
  const lat = typeof exif?.latitude === "number" ? exif.latitude : null;
  const lng = typeof exif?.longitude === "number" ? exif.longitude : null;

  const resized = await resizeImage(file);
  if (!resized && file.size > MAX_BYTES) return null;
  const blob = resized ?? file;

  return {
    ...base,
    kind: "image",
    blob,
    // ถ้าย่อไม่ได้ (เช่น HEIC บน Chrome) เบราว์เซอร์ก็แสดงรูปตัวอย่างไม่ได้เหมือนกัน
    previewUrl: resized ? URL.createObjectURL(resized) : null,
    takenAt: taken instanceof Date && !isNaN(taken.getTime()) ? localDateKey(taken) : null,
    lat,
    lng,
  };
}

// ย่อให้ด้านยาวไม่เกิน maxSide เป็น JPEG, คืน null ถ้าเบราว์เซอร์อ่านรูปนี้ไม่ได้
async function resizeImage(file: File, maxSide = MAX_SIDE, quality = JPEG_QUALITY): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file); // หมุนรูปตาม EXIF ให้เอง
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  } catch {
    return null;
  }
}

// รูปย่อเล็กเป็น data URL เก็บใน localStorage ได้ (ใช้ในแชทระหว่างยังเป็น MOCK)
export async function makeThumb(file: File, side = 320): Promise<string | null> {
  const blob = await resizeImage(file, side, 0.7);
  if (!blob) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

// รูปย่อสำหรับส่งให้ AI (lib/ai.ts) เป็น base64 ไม่มี "data:..." นำหน้า
export async function imageForAi(file: File): Promise<{ mimeType: "image/jpeg"; data: string } | null> {
  const blob = await resizeImage(file, AI_IMAGE_MAX_SIDE, 0.8);
  if (!blob) return null;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { mimeType: "image/jpeg", data: btoa(binary) };
}

// exifr คืนเวลาถ่ายเป็นเวลาท้องถิ่นของกล้อง จึงใช้ getDate() ไม่ใช่ UTC
function localDateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

// เรียงรูปที่มีวันที่ แล้วตัดเป็นทริปใหม่เมื่อมีวันที่ไม่มีรูปเลยคั่นอยู่
export function groupByTrip(files: PreparedFile[]): TripGroup[] {
  const dated = files.filter((f) => f.takenAt).sort((a, b) => a.takenAt!.localeCompare(b.takenAt!));
  const groups: TripGroup[] = [];
  for (const f of dated) {
    const last = groups.at(-1);
    if (last && daysBetween(last.end, f.takenAt!) <= MAX_GAP_DAYS) {
      last.end = f.takenAt!;
      last.files.push(f);
    } else {
      groups.push({ start: f.takenAt!, end: f.takenAt!, files: [f] });
    }
  }
  return groups;
}

// ทำงานทีละ `limit` ไฟล์พร้อมกัน ไม่ให้มือถือค้าง
export async function prepareAll(
  files: File[],
  onProgress: (done: number) => void,
  limit = 3,
): Promise<{ prepared: PreparedFile[]; skipped: number }> {
  const results: (PreparedFile | null)[] = new Array(files.length).fill(null);
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < files.length) {
      const i = next++;
      results[i] = await prepareFile(files[i]);
      onProgress(++done);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, files.length) }, worker));
  const prepared = results.filter((r): r is PreparedFile => r !== null);
  return { prepared, skipped: files.length - prepared.length };
}
