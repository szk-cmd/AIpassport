import { bad, isUuid, serverError } from "@/lib/api-helpers";
import { isTripFileUrl } from "@/lib/storage-server";
import { addItems, type NewItem } from "@/lib/trips-server";

function validItem(v: unknown): v is NewItem {
  const x = v as Record<string, unknown>;
  return (
    !!x &&
    (x.kind === "image" || x.kind === "pdf") &&
    typeof x.file_url === "string" &&
    isTripFileUrl(x.file_url) &&
    typeof x.caption === "string" &&
    (x.thumb === null || (typeof x.thumb === "string" && x.thumb.length < 200_000)) &&
    (x.takenAt === null || typeof x.takenAt === "string") &&
    (x.lat === null || typeof x.lat === "number") &&
    (x.lng === null || typeof x.lng === "number")
  );
}

// POST /api/trips/[id]/items : ไฟล์ที่เพิ่มย้อนหลัง (อัปโหลดเข้า Storage แล้ว ส่งมาแค่ลิงก์ + EXIF)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { items?: unknown[] } | null;
  const items = body?.items;
  if (!isUuid(id) || !Array.isArray(items) || items.length > 200 || !items.every(validItem)) return bad();
  try {
    await addItems(id, items);
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
