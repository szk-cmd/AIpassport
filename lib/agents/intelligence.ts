// Agent 03 — Travel Intelligence (ฝั่ง server)
// ค่าใช้จ่ายจากแชท + ใบเสร็จ/ตั๋วที่เพิ่มย้อนหลัง และสถิติ (จำนวนวัน, สถานที่, ระยะทางจาก GPS, จำนวนรูป)
import "server-only";
import { extract } from "../ai";
import { fetchTripImage } from "../storage-server";
import type { ExpenseLine, RoutePoint } from "../types";
import {
  dayCount,
  haversineKm,
  type CollectOutput,
  type IntelligenceOutput,
} from "./shared";

const MAX_DOCUMENTS = 10; // ใบเสร็จ/ตั๋วที่อ่านต่อทริป (คุมโควตา)
const SAME_PLACE_KM = 1; // รูปที่ถ่ายห่างกันไม่ถึงนี้ นับเป็นจุดเดียวกัน
const MAX_GEOCODE = 8; // ชื่อสถานที่ที่แปลงเป็นพิกัดต่อทริป (Nominatim ให้ใช้ได้ไม่เกิน 1 ครั้ง/วินาที)
const OUTLIER_KM = 500; // พิกัดที่ไกลจากจุดกลางเกินนี้ น่าจะแปลงชื่อผิดที่ ตัดทิ้ง

export async function runIntelligence(
  collected: CollectOutput,
): Promise<IntelligenceOutput> {
  // อ่านยอดเงินจากใบเสร็จ/ตั๋วที่ยังไม่มีใครอ่าน (ที่ส่งในแชท Agent 01 อ่านไว้ตอนคุยแล้ว)
  const fromDocuments: ExpenseLine[] = [];
  for (const doc of collected.documents.slice(0, MAX_DOCUMENTS)) {
    const file = await fetchTripImage(doc.file_url, { allowPdf: true });
    if (!file) continue;
    const found = await extract(
      { text: "ใบเสร็จ ตั๋ว หรือใบจองที่พักจากทริปนี้", attachments: [file] },
      { context: `ทริปวันที่ ${collected.startDate} ถึง ${collected.endDate}` },
    );
    fromDocuments.push(
      ...found.expenses.map((e) => ({ ...e, date: doc.date })),
    );
  }
  const expenses = [...collected.expenses, ...fromDocuments].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // รูปมีพิกัด GPS → ใช้พิกัดจากรูป, ไม่มีเลย (เช่น iPhone ตัดตำแหน่งตอนอัปผ่านเว็บ) → แปลงชื่อสถานที่ที่เล่าในแชทเป็นพิกัด
  const fromPhotos = routeFromPhotos(collected);
  const route =
    fromPhotos.length > 0 ? fromPhotos : await routeFromPlaces(collected);
  const distance = route
    .slice(1)
    .reduce((sum, p, i) => sum + haversineKm(route[i], p), 0);

  return {
    expenses,
    route,
    stats: {
      days: Math.max(1, dayCount(collected.startDate, collected.endDate)),
      places: Math.max(collected.places.length, route.length),
      distance_km: Math.round(distance),
      photos: collected.selected.length,
    },
  };
}

// เส้นทางจากพิกัด GPS ของรูป เรียงตามวันและลำดับที่ส่ง รวมรูปที่ใกล้กันเป็นจุดเดียว
// ชื่อจุดใช้คำบรรยายรูป (ไม่เดาชื่อสถานที่จากพิกัด)
function routeFromPhotos(collected: CollectOutput): RoutePoint[] {
  const located = collected.photos
    .filter(
      (p): p is typeof p & { lat: number; lng: number } =>
        p.lat != null && p.lng != null && p.kind === "scene",
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);

  const route: RoutePoint[] = [];
  for (const p of located) {
    const last = route.at(-1);
    if (last && haversineKm(last, p) < SAME_PLACE_KM) continue;
    // ชื่อซ้ำ (เช่น "ทะเล" สองจุด) เติมเลขต่อท้าย หน้า output ใช้ชื่อเป็น key
    const base = p.caption || `จุดที่ ${route.length + 1}`;
    const name = route.some((r) => r.name === base)
      ? `${base} (${route.length + 1})`
      : base;
    route.push({ name, lat: p.lat, lng: p.lng, date: p.date });
  }
  return route;
}

// แปลงชื่อสถานที่ (ที่ผู้ใช้เล่าในแชท) เป็นพิกัดด้วย OpenStreetMap Nominatim ทีละชื่อ ห่างกัน 1 วินาทีตามเงื่อนไขการใช้ฟรี
// แปลงไม่ได้ / เน็ตมีปัญหา = ข้ามชื่อนั้น (แผนที่ไม่ใช่ส่วนสำคัญ ไม่ทำให้ทั้งขั้นพัง)
async function routeFromPlaces(
  collected: CollectOutput,
): Promise<RoutePoint[]> {
  const wanted = collected.days
    .flatMap((d) => d.places.map((name) => ({ name, date: d.date })))
    .filter((p, i, all) => all.findIndex((q) => q.name === p.name) === i)
    .slice(0, MAX_GEOCODE);

  const found: RoutePoint[] = [];
  for (const [i, place] of wanted.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1100));
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=th&q=${encodeURIComponent(place.name)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "PassportAI/1.0 (KMITL student project)" },
        signal: AbortSignal.timeout(8000),
      });
      const [hit] = res.ok
        ? ((await res.json()) as { lat: string; lon: string }[])
        : [];
      const lat = Number(hit?.lat);
      const lng = Number(hit?.lon);
      if (Number.isFinite(lat) && Number.isFinite(lng))
        found.push({ name: place.name, lat, lng, date: place.date });
    } catch (error) {
      console.warn(
        "[intelligence] แปลงชื่อสถานที่เป็นพิกัดไม่สำเร็จ",
        place.name,
        error,
      );
    }
  }
  if (found.length < 3) return found;
  // ตัดจุดที่ไกลจากจุดกลาง (ค่ามัธยฐาน) มากผิดปกติ เช่นชื่อซ้ำกับที่อื่น
  const median = (xs: number[]) =>
    [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const center = {
    lat: median(found.map((p) => p.lat)),
    lng: median(found.map((p) => p.lng)),
  };
  return found.filter((p) => haversineKm(center, p) <= OUTLIER_KM);
}
