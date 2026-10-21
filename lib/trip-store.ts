// ที่เก็บทริป + แชท + การ login ในเครื่องผู้ใช้ (localStorage) ระหว่างยังเป็นโหมด MOCK
// ใช้ฝั่ง client เท่านั้น ของจริงจะย้ายไปตาราง trips / trip_items ใน Supabase
import { useSyncExternalStore } from "react";
import { PRICE_PER_DAY } from "./config";
import { MOCK_TRIPS } from "./mock";
import { mockActiveTrip } from "./mock-active";
import type { Trip } from "./types";

export type ChatPhoto = { thumb: string | null; color: string; caption: string };

export type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text?: string;
  photos?: ChatPhoto[];
  at: string; // ISO
};

export type StoredTrip = Trip & { slug: string | null }; // slug มีเมื่อ completed

export type StoreData = { trips: StoredTrip[]; messages: Record<string, ChatMessage[]> };

// เปลี่ยนเลขเวอร์ชันเมื่อข้อมูลเดโมเปลี่ยน เครื่องที่เคยเปิดจะได้ข้อมูลชุดใหม่
const DATA_KEY = "passportai:data:v2";
const SESSION_KEY = "passportai:session";

// ---------- ข้อมูลเริ่มต้นของบัญชีทดสอบ ----------

// ทริปที่จบแล้ว (เชียงใหม่ ภูเก็ต เกียวโต) + ทริปที่กำลังเที่ยวอยู่วันที่ 2
function seed(): StoreData {
  const trips: StoredTrip[] = MOCK_TRIPS.map(({ slug, summary: s }) => ({
    id: s.trip_id,
    title: s.title,
    start_date: s.start_date,
    end_date: s.end_date,
    planned_days: s.stats.days,
    status: "completed",
    ended_at: `${s.end_date}T20:00:00+07:00`,
    paid_amount: s.stats.days * PRICE_PER_DAY,
    paid_at: `${s.end_date}T20:05:00+07:00`,
    created_at: `${s.start_date}T08:00:00+07:00`,
    slug,
  }));
  const active = mockActiveTrip();
  return { trips: [active.trip, ...trips], messages: { [active.trip.id]: active.messages } };
}

export const EMPTY_STORE: StoreData = { trips: [], messages: {} };

// ---------- อ่าน/เขียน localStorage แบบให้ React รู้เมื่อข้อมูลเปลี่ยน ----------

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  // เปลี่ยนจากแท็บอื่น: ทิ้งข้อมูลที่จำไว้ แล้วอ่านใหม่
  const onStorage = (e: StorageEvent) => {
    if (e.key === DATA_KEY || e.key === null) cache = null;
    listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // โหมดส่วนตัว / พื้นที่เต็ม: ข้อมูลอยู่แค่ในหน้านี้
  }
  listeners.forEach((l) => l());
}

// จำข้อมูลไว้ในหน่วยความจำ อ่าน localStorage แค่ครั้งแรกหรือเมื่อแท็บอื่นแก้
// (ข้อมูลมีรูปย่อหลาย MB ถ้าอ่านทุกครั้งที่ render หน้าจะหน่วง โดยเฉพาะตอนพิมพ์)
let cache: StoreData | null = null;

function snapshot(): StoreData {
  if (cache) return cache;
  const raw = readRaw(DATA_KEY);
  try {
    cache = raw ? JSON.parse(raw) : seed();
  } catch {
    cache = seed();
  }
  return cache!;
}

// null = ยังไม่รู้ (ตอน render ฝั่ง server / ก่อน hydrate)
export function useStore(): StoreData | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function updateStore(change: (d: StoreData) => StoreData) {
  const next = change(snapshot());
  cache = next; // ถ้าบันทึกลงเครื่องไม่ได้ (พื้นที่เต็ม) หน้านี้ยังใช้ข้อมูลใหม่ได้
  writeRaw(DATA_KEY, JSON.stringify(next));
}

export function resetStore(empty = false) {
  cache = null;
  writeRaw(DATA_KEY, empty ? JSON.stringify(EMPTY_STORE) : null);
}

export function updateTrip(id: string, patch: Partial<StoredTrip>) {
  updateStore((d) => ({ ...d, trips: d.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
}

export function addMessages(tripId: string, messages: ChatMessage[]) {
  updateStore((d) => ({ ...d, messages: { ...d.messages, [tripId]: [...(d.messages[tripId] ?? []), ...messages] } }));
}

// มีทริปที่กำลังเที่ยวได้ทีละ 1 ทริป
export function activeTrip(d: StoreData) {
  return d.trips.find((t) => t.status === "active");
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- login บัญชีทดสอบ (ยังไม่มีระบบสมาชิกจริง) ----------

const TEST_ACCOUNT = { username: "test", password: "1234" };

export function useSession(): string | null | undefined {
  return useSyncExternalStore(subscribe, () => readRaw(SESSION_KEY), () => undefined);
}

export function login(username: string, password: string) {
  const ok = username.trim() === TEST_ACCOUNT.username && password === TEST_ACCOUNT.password;
  if (ok) writeRaw(SESSION_KEY, TEST_ACCOUNT.username);
  return ok;
}

export function logout() {
  writeRaw(SESSION_KEY, null);
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
