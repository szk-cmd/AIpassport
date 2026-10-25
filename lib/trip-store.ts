// ที่เก็บทริป + แชทฝั่งเบราว์เซอร์: ข้อมูลจริงอยู่ในฐานข้อมูล Supabase (ผ่าน API route ของเรา)
// หน้าเว็บอ่านจากหน่วยความจำ แก้แล้วเห็นผลทันที แล้วค่อยบันทึกขึ้น server (ถ้าบันทึกไม่ได้จะโหลดใหม่ให้ตรงกับ server)
// การ login ทดสอบยังเก็บใน localStorage ของเครื่อง
import { useSyncExternalStore } from "react";
import type { Extracted, SummaryPhoto, Trip } from "./types";

export type ChatPhoto = {
  thumb: string | null; // รูปย่อเล็ก data URL (แสดงในแชท)
  color: string; // สีกล่องแทนรูป ถ้าไม่มีรูปย่อ
  caption: string;
  url?: string | null; // รูป 1600px บน Supabase Storage (null = อัปโหลดไม่สำเร็จ)
  takenAt?: string | null; // จาก EXIF อ่านก่อนย่อรูป
  lat?: number | null;
  lng?: number | null;
};

export type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text?: string;
  photos?: ChatPhoto[];
  extracted?: Extracted; // สถานที่/ค่าใช้จ่ายที่ AI ดึงจากข้อความนี้ (Agent 01)
  at: string; // ISO
};

export type StoredTrip = Trip & {
  slug: string | null; // มีเมื่อ completed
  is_demo: boolean; // ทริปเดโมที่ระบบ seed (ยังไม่มีข้อมูลจริงจากผู้ใช้)
  cover: SummaryPhoto | null; // ปกจากผลสรุปของทริปนี้ (เฉพาะทริปที่สรุปแล้ว)
  places: string[]; // สถานที่จากผลสรุป (ชิปในหน้าแรก)
};

export type StoreData = { trips: StoredTrip[]; messages: Record<string, ChatMessage[]> };

const SESSION_KEY = "passportai:session";

// ---------- ข้อมูลจาก server เก็บไว้ในหน่วยความจำ ----------

const listeners = new Set<() => void>();
let cache: StoreData | null = null;
let loading: Promise<void> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

// โหลดทริป + แชททั้งหมดของบัญชีทดสอบจาก server
export function refreshStore() {
  loading ??= fetch("/api/data", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`))))
    .then((data: StoreData) => {
      cache = data;
      notify();
    })
    .catch((error) => console.warn("[store]", error))
    .finally(() => {
      loading = null;
    });
  return loading;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!cache) refreshStore();
  // กลับมาที่แท็บนี้ → โหลดใหม่ (เปิดบัญชีเดียวกันได้หลายเครื่อง)
  const onFocus = () => refreshStore();
  window.addEventListener("focus", onFocus);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("focus", onFocus);
  };
}

// null = ยังโหลดไม่เสร็จ (หรือตอน render ฝั่ง server)
export function useStore(): StoreData | null {
  return useSyncExternalStore(
    subscribe,
    () => cache,
    () => null,
  );
}

// แก้ในหน่วยความจำก่อน (หน้าเว็บเห็นทันที) แล้วส่งขึ้น server ถ้าพังให้โหลดของจริงกลับมา
async function mutate(change: (d: StoreData) => StoreData, request: () => Promise<Response>) {
  if (cache) {
    cache = change(cache);
    notify();
  }
  try {
    const res = await request();
    if (!res.ok) throw new Error(`บันทึกไม่สำเร็จ (${res.status})`);
  } catch (error) {
    console.warn("[store]", error);
    await refreshStore();
  }
}

function send(url: string, method: string, body: unknown) {
  return fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

export function updateTrip(id: string, patch: Partial<StoredTrip>) {
  return mutate(
    (d) => ({ ...d, trips: d.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
    () => send(`/api/trips/${id}`, "PATCH", patch),
  );
}

// ผู้ใช้ส่งข้อความเข้าทริปเดโม → ไม่ใช่เดโมแล้ว (server ตั้ง is_demo = false ให้)
export function addMessages(tripId: string, messages: ChatMessage[]) {
  const fromUser = messages.some((m) => m.from === "user");
  return mutate(
    (d) => ({
      trips: fromUser ? d.trips.map((t) => (t.id === tripId ? { ...t, is_demo: false } : t)) : d.trips,
      messages: { ...d.messages, [tripId]: [...(d.messages[tripId] ?? []), ...messages] },
    }),
    () => send(`/api/trips/${tripId}/messages`, "POST", { messages }),
  );
}

export function updateMessage(tripId: string, messageId: string, patch: Partial<ChatMessage>) {
  return mutate(
    (d) => ({
      ...d,
      messages: {
        ...d.messages,
        [tripId]: (d.messages[tripId] ?? []).map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
      },
    }),
    () => send(`/api/messages/${messageId}`, "PATCH", patch),
  );
}

// สร้างทริปใหม่ (server เพิ่มข้อความต้อนรับให้) แล้วโหลดข้อมูลใหม่
export async function createTrip(trip: Pick<Trip, "id" | "title" | "start_date" | "end_date" | "planned_days">) {
  const res = await send("/api/trips", "POST", trip);
  if (!res.ok) throw new Error("สร้างทริปไม่สำเร็จ");
  await refreshStore();
}

// รูป/ไฟล์ที่เพิ่มย้อนหลังหลังจบทริป (อัปโหลดเข้า Storage แล้ว ส่งมาแค่ลิงก์)
export async function addItems(
  tripId: string,
  items: {
    kind: "image" | "pdf";
    file_url: string;
    caption: string;
    thumb: string | null;
    takenAt: string | null;
    lat: number | null;
    lng: number | null;
  }[],
) {
  const res = await send(`/api/trips/${tripId}/items`, "POST", { items });
  if (!res.ok) throw new Error("บันทึกไฟล์ไม่สำเร็จ");
}

// ปุ่มในหน้าโปรไฟล์: ล้างข้อมูลทั้งหมดของบัญชีทดสอบ (รวมไฟล์ใน Storage) แล้ว seed ทริปเดโมใหม่ (empty = ไม่ seed)
export async function resetStore(empty = false) {
  await send("/api/demo/reset", "POST", { mode: empty ? "empty" : "demo" });
  await refreshStore();
}

// ทริปที่กำลังเที่ยว (มีค้างไว้ได้หลายทริป) เรียงตามแชทล่าสุดก่อน
export function activeTrips(d: StoreData) {
  const lastAt = (t: StoredTrip) => d.messages[t.id]?.at(-1)?.at ?? t.created_at;
  return d.trips.filter((t) => t.status === "active").sort((a, b) => lastAt(b).localeCompare(lastAt(a)));
}

// ฐานข้อมูลใช้ uuid สร้างจากเบราว์เซอร์ได้เลย หน้าเว็บจะได้ใช้ id ได้ทันทีไม่ต้องรอ server
export function newId() {
  return crypto.randomUUID();
}

// ---------- login บัญชีทดสอบ (ยังไม่มีระบบสมาชิกจริง) ----------

const TEST_ACCOUNT = { username: "test", password: "1234" };
const sessionListeners = new Set<() => void>();

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSession(value: string | null) {
  try {
    if (value === null) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, value);
  } catch {
    // โหมดส่วนตัว: อยู่แค่ในหน้านี้
  }
  sessionListeners.forEach((l) => l());
}

function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    sessionListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useSession(): string | null | undefined {
  return useSyncExternalStore(subscribeSession, readSession, () => undefined);
}

export function login(username: string, password: string) {
  const ok = username.trim() === TEST_ACCOUNT.username && password === TEST_ACCOUNT.password;
  if (ok) writeSession(TEST_ACCOUNT.username);
  return ok;
}

export function logout() {
  writeSession(null);
}

// ---------- วันที่ ----------

// "YYYY-MM-DD" ตามเวลาเครื่อง
export function todayKey(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// นับวันแบบรวมวันแรกและวันสุดท้าย เช่น 14 → 16 = 3 วัน
export function dayCount(start: string, end: string) {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
}

export function addDays(date: string, days: number) {
  return todayKey(new Date(Date.parse(`${date}T12:00:00`) + days * 86_400_000));
}
