// อ่าน/เขียนทริป แชท ไฟล์ และผลสรุปในฐานข้อมูล Supabase (ฝั่ง server เท่านั้น ใช้ service role key)
// เบราว์เซอร์เรียกผ่าน API route (app/api/...) ไม่ต่อฐานข้อมูลตรง
import "server-only";
import { getTripBySlug } from "./mock";
import { photoOf } from "./summary";
import { createServerSupabase } from "./supabase-server";
import type { ChatMessage, ChatPhoto, StoreData } from "./trip-store";
import type { Extracted, TripStatus, TripSummary } from "./types";

// ยังไม่มีระบบสมาชิกจริง: ทุกเครื่องที่ login ด้วยบัญชีทดสอบใช้ข้อมูลชุดเดียวกัน
export const OWNER = "test";
export const BUCKET = "trip-files";

export function db() {
  return createServerSupabase();
}

type TripRow = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  planned_days: number | null;
  status: TripStatus;
  ended_at: string | null;
  paid_amount: number | null;
  paid_at: string | null;
  created_at: string;
  slug: string | null;
  is_demo: boolean;
};

type MessageRow = {
  id: string;
  trip_id: string;
  sender: "user" | "bot";
  text: string | null;
  photos: ChatPhoto[] | null;
  extracted: Extracted | null;
  is_seed: boolean;
  created_at: string;
};

export type ItemRow = {
  id: string;
  trip_id: string;
  type: "photo" | "ticket" | "lodging" | "expense";
  data: Record<string, unknown>;
  file_url: string | null;
  taken_at: string | null;
  lat: number | null;
  lng: number | null;
  selected: boolean;
  is_seed: boolean;
  created_at: string;
};

const TRIP_COLUMNS =
  "id, title, start_date, end_date, planned_days, status, ended_at, paid_amount, paid_at, created_at, slug, is_demo";

function fail(error: { message: string } | null, what: string) {
  if (error) throw new Error(`[db] ${what}: ${error.message}`);
}

export function toMessage(r: MessageRow): ChatMessage {
  return {
    id: r.id,
    from: r.sender,
    at: r.created_at,
    ...(r.text != null && { text: r.text }),
    ...(r.photos && r.photos.length > 0 && { photos: r.photos }),
    ...(r.extracted && { extracted: r.extracted }),
  };
}

// ---------- อ่าน ----------

// ทุกทริป + แชทของบัญชีทดสอบ (หน้าแรก แชท ลิ้นชัก โหลดจากตรงนี้)
export async function listData(): Promise<StoreData> {
  const { data: trips, error } = await db().from("trips").select(TRIP_COLUMNS).eq("owner", OWNER);
  fail(error, "list trips");
  const rows = (trips ?? []) as TripRow[];
  const ids = rows.map((t) => t.id);

  const [{ data: msgs, error: me }, { data: outs, error: oe }] = await Promise.all([
    ids.length
      ? db().from("messages").select("*").in("trip_id", ids).order("created_at")
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? db().from("trip_outputs").select("trip_id, summary").in("trip_id", ids)
      : Promise.resolve({ data: [], error: null }),
  ]);
  fail(me, "list messages");
  fail(oe, "list outputs");

  const summaries = new Map(
    ((outs ?? []) as { trip_id: string; summary: TripSummary }[]).map((o) => [o.trip_id, o.summary]),
  );
  const messages: StoreData["messages"] = {};
  for (const m of (msgs ?? []) as MessageRow[]) (messages[m.trip_id] ??= []).push(toMessage(m));

  return {
    trips: rows.map((t) => {
      const s = t.status === "completed" ? summaries.get(t.id) : undefined;
      return {
        ...t,
        planned_days: t.planned_days ?? 1,
        // ปกและสถานที่ของทริปที่สรุปแล้ว (หน้าแรกใช้) มาจากผลสรุปของทริปนั้นเอง
        cover: s ? (photoOf(s, s.cover_photo_id) ?? null) : null,
        places: s ? s.route.map((p) => p.name) : [],
      };
    }),
    messages,
  };
}

export async function getTrip(id: string): Promise<TripRow | null> {
  const { data, error } = await db().from("trips").select(TRIP_COLUMNS).eq("id", id).eq("owner", OWNER).maybeSingle();
  fail(error, "get trip");
  return (data as TripRow | null) ?? null;
}

export async function getMessages(tripId: string): Promise<MessageRow[]> {
  const { data, error } = await db().from("messages").select("*").eq("trip_id", tripId).order("created_at");
  fail(error, "get messages");
  return (data ?? []) as MessageRow[];
}

export async function getItems(tripId: string): Promise<ItemRow[]> {
  const { data, error } = await db().from("trip_items").select("*").eq("trip_id", tripId).order("created_at");
  fail(error, "get items");
  return (data ?? []) as ItemRow[];
}

export async function getOutput(tripId: string): Promise<TripSummary | null> {
  const { data, error } = await db().from("trip_outputs").select("summary").eq("trip_id", tripId).maybeSingle();
  fail(error, "get output");
  return (data?.summary as TripSummary | undefined) ?? null;
}

// หน้า /t/[slug]: อ่านผลสรุปของทริปนั้นจาก shares → trip_outputs
// ถ้ายังไม่มีในฐานข้อมูล ใช้ข้อมูลชุดเดิมได้เฉพาะ slug ของทริปเดโมเท่านั้น
export async function getSummaryBySlug(slug: string): Promise<{ slug: string; summary: TripSummary } | null> {
  try {
    const { data: share } = await db().from("shares").select("trip_id").eq("slug", slug).maybeSingle();
    if (share) {
      const summary = await getOutput(share.trip_id);
      if (summary) return { slug, summary };
    }
  } catch (error) {
    console.warn("[db] อ่านผลสรุปไม่สำเร็จ", error);
  }
  return getTripBySlug(slug) ?? null;
}

// ---------- เขียน ----------

export async function createTrip(t: {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  planned_days: number;
}) {
  const { error } = await db()
    .from("trips")
    .insert({ ...t, owner: OWNER, status: "active", is_demo: false });
  fail(error, "create trip");
  const { error: me } = await db()
    .from("messages")
    .insert({
      trip_id: t.id,
      sender: "bot",
      text: `เริ่มทริป “${t.title}” แล้ว! ส่งรูป เล่าเรื่อง หรือถ่ายใบเสร็จมาได้ตลอดทริป เดี๋ยวผมจดให้ทั้งหมด`,
    });
  fail(me, "welcome message");
}

const PATCHABLE = ["status", "end_date", "ended_at", "paid_amount", "paid_at"] as const;
type TripPatch = Partial<Pick<TripRow, (typeof PATCHABLE)[number]>>;

export async function patchTrip(id: string, patch: Record<string, unknown>) {
  const clean: TripPatch = Object.fromEntries(Object.entries(patch).filter(([k]) => PATCHABLE.includes(k as never)));
  if (Object.keys(clean).length === 0) return;
  const { error } = await db().from("trips").update(clean).eq("id", id).eq("owner", OWNER);
  fail(error, "patch trip");
}

// ผู้ใช้ส่งข้อมูลจริงเข้าทริปเดโม → ไม่ใช่เดโมอีกต่อไป (ตอนสรุปใช้เฉพาะข้อมูลที่ผู้ใช้สร้าง)
async function markReal(tripId: string) {
  const { error } = await db().from("trips").update({ is_demo: false }).eq("id", tripId).eq("is_demo", true);
  fail(error, "mark real");
}

// เวลาถ่ายจาก EXIF เก็บแค่วันที่ (YYYY-MM-DD) ใส่เวลาเที่ยงวันเวลาไทยให้วันไม่เลื่อน
function takenAtOf(date: string | null | undefined) {
  return date ? `${date}T12:00:00+07:00` : null;
}

export async function addMessages(tripId: string, messages: ChatMessage[]) {
  const rows = messages.map((m) => ({
    id: m.id,
    trip_id: tripId,
    sender: m.from,
    text: m.text ?? null,
    photos: m.photos ?? [],
    extracted: m.extracted ?? null,
    created_at: m.at,
  }));
  const { error } = await db().from("messages").insert(rows);
  fail(error, "add messages");

  const fromUser = messages.filter((m) => m.from === "user");
  if (fromUser.length === 0) return;
  await markReal(tripId);

  // รูปที่ส่งในแชทเก็บเป็น trip_items ด้วย (Agent 01 ใช้คัดรูป)
  const photoItems = fromUser.flatMap((m) =>
    (m.photos ?? [])
      .filter((p) => p.url)
      .map((p) => ({
        trip_id: tripId,
        type: "photo" as const,
        file_url: p.url,
        taken_at: takenAtOf(p.takenAt),
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        data: { caption: p.caption, thumb: p.thumb, color: p.color, source: "chat", message_id: m.id },
      })),
  );
  if (photoItems.length) {
    const { error: ie } = await db().from("trip_items").insert(photoItems);
    fail(ie, "add chat photo items");
  }
}

export async function patchMessage(id: string, patch: { extracted?: Extracted }) {
  if (!patch.extracted) return;
  const { error } = await db().from("messages").update({ extracted: patch.extracted }).eq("id", id);
  fail(error, "patch message");
}

export type NewItem = {
  kind: "image" | "pdf";
  file_url: string;
  caption: string;
  thumb: string | null;
  takenAt: string | null;
  lat: number | null;
  lng: number | null;
};

// ไฟล์ที่เพิ่มย้อนหลังหลังจบทริป (รูป = photo, PDF = ticket ให้ Agent 03 อ่านยอดเงิน)
export async function addItems(tripId: string, items: NewItem[]) {
  if (items.length === 0) return;
  const { error } = await db()
    .from("trip_items")
    .insert(
      items.map((i) => ({
        trip_id: tripId,
        type: i.kind === "pdf" ? "ticket" : "photo",
        file_url: i.file_url,
        taken_at: takenAtOf(i.takenAt),
        lat: i.lat,
        lng: i.lng,
        data: { caption: i.caption, thumb: i.thumb, source: "later", kind: i.kind },
      })),
    );
  fail(error, "add items");
  await markReal(tripId);
}

export async function saveOutput(tripId: string, summary: TripSummary) {
  const { error } = await db()
    .from("trip_outputs")
    .upsert({ trip_id: tripId, summary, updated_at: new Date().toISOString() });
  fail(error, "save output");
}

// ---------- Storage ----------

// ลบไฟล์ทุกไฟล์ใน bucket ของแอป (ใช้ตอนรีเซ็ตบัญชีทดสอบ ซึ่งเป็นบัญชีเดียวในระบบ)
export async function clearStorage() {
  const storage = db().storage.from(BUCKET);
  const { data: folders, error } = await storage.list("", { limit: 1000 });
  fail(error, "list storage");
  for (const folder of folders ?? []) {
    for (;;) {
      const { data: files } = await storage.list(folder.name, { limit: 1000 });
      const paths = (files ?? []).map((f) => `${folder.name}/${f.name}`);
      if (paths.length === 0) break;
      const { error: re } = await storage.remove(paths);
      fail(re, "remove files");
    }
  }
}
