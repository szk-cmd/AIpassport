// ที่เก็บทริป + แชท + การ login ในเครื่องผู้ใช้ (localStorage) ระหว่างยังเป็นโหมด MOCK
// ใช้ฝั่ง client เท่านั้น ของจริงจะย้ายไปตาราง trips / trip_items ใน Supabase
import { useSyncExternalStore } from "react";
import { MOCK_TRIPS } from "./mock";
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

const DATA_KEY = "passportai:data:v1";
const SESSION_KEY = "passportai:session";

// ---------- ข้อมูลเริ่มต้นของบัญชีทดสอบ ----------

function seed(): StoreData {
  const trips: StoredTrip[] = MOCK_TRIPS.map(({ slug, summary: s }) => ({
    id: s.trip_id,
    title: s.title,
    start_date: s.start_date,
    end_date: s.end_date,
    planned_days: s.stats.days,
    status: "completed",
    ended_at: `${s.end_date}T20:00:00+07:00`,
    paid_amount: null,
    paid_at: null,
    created_at: `${s.start_date}T08:00:00+07:00`,
    slug,
  }));
  return { trips, messages: {} };
}

export const EMPTY_STORE: StoreData = { trips: [], messages: {} };

// ---------- อ่าน/เขียน localStorage แบบให้ React รู้เมื่อข้อมูลเปลี่ยน ----------

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // เปลี่ยนจากแท็บอื่น
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
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

// เก็บผล parse ไว้ React จะได้ค่าเดิมถ้าข้อมูลไม่เปลี่ยน
let cache: { raw: string | null; data: StoreData } | null = null;

function snapshot(): StoreData {
  const raw = readRaw(DATA_KEY);
  if (cache && cache.raw === raw) return cache.data;
  let data: StoreData;
  try {
    data = raw ? JSON.parse(raw) : seed();
  } catch {
    data = seed();
  }
  cache = { raw, data };
  return data;
}

// null = ยังไม่รู้ (ตอน render ฝั่ง server / ก่อน hydrate)
export function useStore(): StoreData | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function updateStore(change: (d: StoreData) => StoreData) {
  writeRaw(DATA_KEY, JSON.stringify(change(snapshot())));
}

export function resetStore(empty = false) {
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
