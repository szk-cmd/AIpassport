// ตัวช่วยร่วมของ agent สรุปทริป (ฝั่ง server)
import "server-only";
import type { ExpenseLine, RoutePoint, TripStats } from "../types";

// วันที่ตามเวลาไทย (server บน Vercel เป็น UTC) เช่น "2026-10-21"
export function bangkokDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date(iso));
}

export function dayCount(start: string, end: string) {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
}

export type PhotoKind = "scene" | "receipt" | "ticket" | "screenshot" | "other";

// รูปหนึ่งรูปหลัง Agent 01 ดูแล้ว
export type CollectedPhoto = {
  id: string;
  file_url: string | null;
  color: string | null; // รูปตัวอย่างของทริปเดโม (ไม่มีไฟล์จริง)
  date: string; // วันที่ในทริป (โค้ดแบ่งวัน: EXIF ในช่วงทริป → เรียงรูปเก่าเป็นวันที่ 1,2,.. → วันที่ส่ง)
  order: number; // ลำดับที่ผู้ใช้ส่ง ใช้เรียงในวันเดียวกัน
  lat: number | null;
  lng: number | null;
  caption: string;
  kind: PhotoKind;
  keep: boolean;
  score: number; // 1-10 ความเป็นไฮไลต์ของรูป (Agent 01 ให้คะแนน)
};

// ผลของ Agent 01 (เก็บใน agent_runs.output ส่งต่อให้ 02 / 03 / 04)
export type CollectOutput = {
  startDate: string;
  endDate: string; // วันจบจริง (กดจบก่อนกำหนด = วันที่กดจบ)
  days: { date: string; texts: string[]; places: string[]; photoIds: string[] }[];
  photos: CollectedPhoto[];
  selected: string[]; // รูปไฮไลต์เรียงจากเด่นที่สุด (ตัวแรก = ปก) วันละไม่เกิน ~6 รูป รวมไม่เกิน 30
  documents: { id: string; file_url: string; kind: "image" | "pdf"; date: string }[]; // ใบเสร็จ/ตั๋วให้ Agent 03 อ่าน
  expenses: ExpenseLine[]; // จากที่ผู้ใช้พิมพ์/ส่งในแชท (Agent 01 ดึงไว้ตอนคุย)
  places: string[];
};

// ผลของ Agent 02
export type StoryOutput = {
  days: { date: string; title: string; story: string }[];
  headline: string;
  short_text: string;
};

// ผลของ Agent 03
export type IntelligenceOutput = {
  expenses: ExpenseLine[];
  stats: TripStats;
  route: RoutePoint[];
};

// ระยะทางระหว่างพิกัด (กม.)
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// data URL ของรูปย่อ → ไฟล์แนบให้ AI
export function dataUrlToAttachment(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1] as "image/jpeg" | "image/png" | "image/webp", data: match[2] };
}
