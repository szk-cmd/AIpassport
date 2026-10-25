// Agent 03 — Travel Intelligence (ฝั่ง server)
// ค่าใช้จ่ายจากแชท + ใบเสร็จ/ตั๋วที่เพิ่มย้อนหลัง และสถิติ (จำนวนวัน, สถานที่, ระยะทางจาก GPS, จำนวนรูป)
import "server-only";
import { extract } from "../ai";
import { fetchTripImage } from "../storage-server";
import type { ExpenseLine, RoutePoint } from "../types";
import { dayCount, haversineKm, type CollectOutput, type IntelligenceOutput } from "./shared";

const MAX_DOCUMENTS = 10; // ใบเสร็จ/ตั๋วที่อ่านต่อทริป (คุมโควตา)
const SAME_PLACE_KM = 1; // รูปที่ถ่ายห่างกันไม่ถึงนี้ นับเป็นจุดเดียวกัน

export async function runIntelligence(collected: CollectOutput): Promise<IntelligenceOutput> {
  // อ่านยอดเงินจากใบเสร็จ/ตั๋วที่ยังไม่มีใครอ่าน (ที่ส่งในแชท Agent 01 อ่านไว้ตอนคุยแล้ว)
  const fromDocuments: ExpenseLine[] = [];
  for (const doc of collected.documents.slice(0, MAX_DOCUMENTS)) {
    const file = await fetchTripImage(doc.file_url, { allowPdf: true });
    if (!file) continue;
    const found = await extract(
      { text: "ใบเสร็จ ตั๋ว หรือใบจองที่พักจากทริปนี้", attachments: [file] },
      { context: `ทริปวันที่ ${collected.startDate} ถึง ${collected.endDate}` },
    );
    fromDocuments.push(...found.expenses.map((e) => ({ ...e, date: doc.date })));
  }
  const expenses = [...collected.expenses, ...fromDocuments].sort((a, b) => a.date.localeCompare(b.date));

  const route = routeFromPhotos(collected);
  const distance = route.slice(1).reduce((sum, p, i) => sum + haversineKm(route[i], p), 0);

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
    .filter((p): p is typeof p & { lat: number; lng: number } => p.lat != null && p.lng != null && p.kind === "scene")
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);

  const route: RoutePoint[] = [];
  for (const p of located) {
    const last = route.at(-1);
    if (last && haversineKm(last, p) < SAME_PLACE_KM) continue;
    // ชื่อซ้ำ (เช่น "ทะเล" สองจุด) เติมเลขต่อท้าย หน้า output ใช้ชื่อเป็น key
    const base = p.caption || `จุดที่ ${route.length + 1}`;
    const name = route.some((r) => r.name === base) ? `${base} (${route.length + 1})` : base;
    route.push({ name, lat: p.lat, lng: p.lng });
  }
  return route;
}
