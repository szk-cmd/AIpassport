// เตรียมรูปในเบราว์เซอร์ก่อนอัปโหลด: อ่าน EXIF → แปลง HEIC → ย่อรูป → จับกลุ่มเป็นทริปตามวันที่
// ใช้ฝั่ง client เท่านั้น (ต้องมี canvas / createImageBitmap)
// ไฟล์รูปอัปโหลดตรงจากเบราว์เซอร์เข้า Supabase Storage (lib/upload.ts) ไม่ผ่าน API route ของเรา
import { MAX_FILE_MB } from "./config";

const MAX_SIDE = 1600; // ด้านยาวหลังย่อ (px) ก่อนอัปโหลด
const THUMB_SIDE = 320; // รูปย่อเล็กเก็บในแชท (localStorage)
const JPEG_QUALITY = 0.8;
const MAX_GAP_DAYS = 1; // วันที่ถ่ายห่างกันเกินนี้ = คนละทริป
const MAX_BYTES = MAX_FILE_MB * 1024 * 1024;

export type PreparedFile = {
  id: string; // ชื่อ+ขนาดไฟล์ต้นฉบับ ใช้กันเลือกซ้ำ
  name: string;
  kind: "image" | "pdf";
  blob: Blob; // ไฟล์ที่จะอัปโหลด (รูปที่ย่อแล้ว หรือไฟล์เดิมถ้าย่อไม่ได้)
  previewUrl: string | null;
  thumb: string | null; // รูปย่อ 320px (data URL) ให้ AI คัดรูปตอนสรุปทริป
  takenAt: string | null; // YYYY-MM-DD ตามเวลาท้องถิ่นที่ถ่าย, null = ไม่มี EXIF
  lat: number | null;
  lng: number | null;
};

export type TripGroup = { start: string; end: string; files: PreparedFile[] };

type Exif = Pick<PreparedFile, "takenAt" | "lat" | "lng">;

export function fileId(file: File) {
  return `${file.name}:${file.size}`;
}

// รูป HEIC บน Windows มักไม่มี type เลยดูจากนามสกุลด้วย
function isHeicFile(file: File) {
  return /^image\/hei[cf]/.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export function isSupported(file: File) {
  return file.type.startsWith("image/") || file.type === "application/pdf" || isHeicFile(file);
}

// อ่าน EXIF จากไฟล์ต้นฉบับ ต้องทำก่อนย่อ เพราะ canvas จะทิ้ง EXIF ไป (exifr อ่าน HEIC ได้ด้วย)
export async function readExif(file: File): Promise<Exif> {
  // import ตอนใช้ เพราะ exifr พยายามโหลด fs/zlib ถ้าถูกเรียกตอน render ฝั่ง server
  const { default: exifr } = await import("exifr");
  const exif = await exifr.parse(file, { gps: true, xmp: false, icc: false, iptc: false }).catch(() => null);
  const taken: unknown = exif?.DateTimeOriginal ?? exif?.CreateDate;
  return {
    takenAt: taken instanceof Date && !isNaN(taken.getTime()) ? localDateKey(taken) : null,
    lat: typeof exif?.latitude === "number" ? exif.latitude : null,
    lng: typeof exif?.longitude === "number" ? exif.longitude : null,
  };
}

// อ่านรูปเป็น bitmap: เบราว์เซอร์อ่านเองก่อน (Safari อ่าน HEIC ได้)
// ถ้าเป็น HEIC ที่อ่านไม่ได้ (Chrome/Android/Windows) ค่อยโหลดตัวแปลง heic-to มาใช้
async function decodeImage(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file); // หมุนรูปตาม EXIF ให้เอง
  } catch {
    if (!isHeicFile(file)) return null;
    try {
      const { heicTo } = await import("heic-to/next");
      return await heicTo({ blob: file, type: "bitmap" });
    } catch {
      return null;
    }
  }
}

// ย่อให้ด้านยาวไม่เกิน maxSide เป็น JPEG
async function toJpeg(bitmap: ImageBitmap, maxSide: number, quality = JPEG_QUALITY): Promise<Blob | null> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function toDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

// คืน null ถ้าไฟล์ใช้ไม่ได้ (PDF ใหญ่เกิน หรือรูปที่อ่าน/ย่อไม่ได้และใหญ่เกิน)
export async function prepareFile(file: File): Promise<PreparedFile | null> {
  const base = { id: fileId(file), name: file.name };

  if (file.type === "application/pdf") {
    if (file.size > MAX_BYTES) return null;
    return { ...base, kind: "pdf", blob: file, previewUrl: null, thumb: null, takenAt: null, lat: null, lng: null };
  }

  const exif = await readExif(file); // ก่อนย่อเสมอ
  const bitmap = await decodeImage(file);
  const [resized, thumbBlob] = bitmap
    ? await Promise.all([toJpeg(bitmap, MAX_SIDE), toJpeg(bitmap, THUMB_SIDE, 0.7)])
    : [null, null];
  bitmap?.close();
  if (!resized && file.size > MAX_BYTES) return null;

  return {
    ...base,
    kind: "image",
    blob: resized ?? file,
    previewUrl: resized ? URL.createObjectURL(resized) : null,
    thumb: thumbBlob ? await toDataUrl(thumbBlob) : null,
    ...exif,
  };
}

// รูปที่ส่งในแชท: EXIF + รูปย่อเล็ก (เก็บในเครื่อง) + รูป 1600px (อัปโหลดขึ้น Storage) อ่านไฟล์ครั้งเดียว
export async function prepareChatPhoto(file: File) {
  const exif = await readExif(file);
  const bitmap = await decodeImage(file);
  if (!bitmap) return { ...exif, thumb: null, upload: null };
  const [thumbBlob, upload] = await Promise.all([toJpeg(bitmap, THUMB_SIDE, 0.7), toJpeg(bitmap, MAX_SIDE)]);
  bitmap.close();
  return { ...exif, thumb: thumbBlob ? await toDataUrl(thumbBlob) : null, upload };
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
