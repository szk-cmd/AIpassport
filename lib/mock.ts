import { KYOTO_PHOTOS, KYOTO_SUMMARY, PHUKET_PHOTOS, PHUKET_SUMMARY } from "./mock-trips";
import type { ExpenseLine, Trip, TripItem, TripSummary } from "./types";

// ทริปตัวอย่าง "เชียงใหม่ 3 วัน" ใช้ทุกหน้าตอนยังไม่ต่อ Supabase / AI

export const MOCK_TRIP: Trip = {
  id: "demo-chiangmai",
  title: "เชียงใหม่ 3 วัน",
  start_date: "2026-11-14",
  end_date: "2026-11-16",
  status: "awaiting_review",
  plan: "free",
  created_at: "2026-11-17T09:00:00+07:00",
};

export const MOCK_SLUG = "chiangmai-3-days";

const base = {
  trip_id: MOCK_TRIP.id,
  file_url: null,
  created_at: MOCK_TRIP.created_at,
};

export const MOCK_ITEMS: TripItem[] = [
  // ---------- รูป 8 รูป ----------
  {
    ...base,
    id: "p1",
    type: "photo",
    data: { caption: "วัดพระธาตุดอยสุเทพยามเช้า", place: "ดอยสุเทพ", color: "#E8A93C" },
    taken_at: "2026-11-14T10:20:00+07:00",
    lat: 18.8048,
    lng: 98.9216,
    selected: true,
    confidence: 0.96,
  },
  {
    ...base,
    id: "p2",
    type: "photo",
    data: { caption: "ข้าวซอยไก่ร้านดัง", place: "ย่านช้างเผือก", color: "#E0642C" },
    taken_at: "2026-11-14T12:40:00+07:00",
    lat: 18.803,
    lng: 98.98,
    selected: true,
    confidence: 0.92,
  },
  {
    ...base,
    id: "p3",
    type: "photo",
    data: { caption: "คาเฟ่ยามบ่ายที่นิมมาน", place: "นิมมานเหมินท์", color: "#1E6B63" },
    taken_at: "2026-11-14T15:10:00+07:00",
    lat: 18.7999,
    lng: 98.9676,
    selected: true,
    confidence: 0.9,
  },
  {
    ...base,
    id: "p4",
    type: "photo",
    data: { caption: "ทะเลหมอกบนยอดดอยอินทนนท์", place: "ดอยอินทนนท์", color: "#5B7DA8" },
    taken_at: "2026-11-15T07:05:00+07:00",
    lat: 18.5886,
    lng: 98.4867,
    selected: true,
    confidence: 0.97,
  },
  {
    ...base,
    id: "p5",
    type: "photo",
    data: { caption: "พระมหาธาตุนภเมทนีดล", place: "พระมหาธาตุเจดีย์คู่", color: "#B5838D" },
    taken_at: "2026-11-15T09:30:00+07:00",
    lat: 18.5464,
    lng: 98.4835,
    selected: true,
    confidence: 0.91,
  },
  {
    ...base,
    id: "p6",
    type: "photo",
    data: { caption: "พระมหาธาตุ (ภาพซ้ำ เบลอ)", place: "พระมหาธาตุเจดีย์คู่", color: "#8D6E63" },
    taken_at: "2026-11-15T09:31:00+07:00",
    lat: 18.5464,
    lng: 98.4835,
    selected: false,
    confidence: 0.4,
  },
  {
    ...base,
    id: "p7",
    type: "photo",
    data: { caption: "น้ำตกวชิรธาร", place: "น้ำตกวชิรธาร", color: "#4C9A8A" },
    taken_at: "2026-11-15T13:15:00+07:00",
    lat: 18.5419,
    lng: 98.5986,
    selected: true,
    confidence: 0.94,
  },
  {
    ...base,
    id: "p8",
    type: "photo",
    data: { caption: "วัดเจดีย์หลวงก่อนกลับบ้าน", place: "วัดเจดีย์หลวง", color: "#A0522D" },
    taken_at: "2026-11-16T10:00:00+07:00",
    lat: 18.7869,
    lng: 98.9865,
    selected: true,
    confidence: 0.95,
  },

  // ---------- ตั๋ว 1 ----------
  {
    ...base,
    id: "t1",
    type: "ticket",
    data: {
      mode: "flight",
      from: "กรุงเทพฯ (DMK)",
      to: "เชียงใหม่ (CNX)",
      depart_at: "2026-11-14T07:30:00+07:00",
      price: 1290,
    },
    taken_at: null,
    lat: null,
    lng: null,
    selected: true,
    confidence: 0.95,
  },

  // ---------- ที่พัก 1 ----------
  {
    ...base,
    id: "l1",
    type: "lodging",
    data: {
      name: "บ้านนิมมาน โฮสเทล",
      check_in: "2026-11-14",
      check_out: "2026-11-16",
      price: 1800,
    },
    taken_at: null,
    lat: 18.7985,
    lng: 98.968,
    selected: true,
    confidence: 0.88,
  },

  // ---------- ค่าใช้จ่าย 5 รายการ (บางรายการ confidence ต่ำ) ----------
  {
    ...base,
    id: "e1",
    type: "expense",
    data: { label: "รถแดงขึ้นดอยสุเทพ", category: "transport", amount: 100, date: "2026-11-14" },
    taken_at: null,
    lat: null,
    lng: null,
    selected: true,
    confidence: 0.9,
  },
  {
    ...base,
    id: "e2",
    type: "expense",
    data: { label: "ข้าวซอยไก่", category: "food", amount: 70, date: "2026-11-14" },
    taken_at: null,
    lat: null,
    lng: null,
    selected: true,
    confidence: 0.93,
  },
  {
    ...base,
    id: "e3",
    type: "expense",
    data: { label: "กาแฟนิมมาน", category: "food", amount: 120, date: "2026-11-14" },
    taken_at: null,
    lat: null,
    lng: null,
    selected: true,
    confidence: 0.97,
  },
  {
    ...base,
    id: "e4",
    type: "expense",
    data: { label: "ค่าเข้าอุทยานดอยอินทนนท์", category: "activity", amount: 300, date: "2026-11-15" },
    taken_at: null,
    lat: null,
    lng: null,
    selected: true,
    confidence: 0.58,
  },
  {
    ...base,
    id: "e5",
    type: "expense",
    data: { label: "ของฝากตลาดวโรรส", category: "shopping", amount: 450, date: "2026-11-16" },
    taken_at: null,
    lat: null,
    lng: null,
    selected: true,
    confidence: 0.64,
  },
];

// รวมค่าใช้จ่ายจากตั๋ว + ที่พัก + รายการใช้จ่าย
const expenseLines: ExpenseLine[] = MOCK_ITEMS.flatMap((item): ExpenseLine[] => {
  if (item.type === "ticket") {
    const d = item.data;
    return [{ label: `ตั๋ว ${d.from} → ${d.to}`, category: "transport", amount: d.price, date: d.depart_at.slice(0, 10) }];
  }
  if (item.type === "lodging") {
    const d = item.data;
    return [{ label: d.name, category: "lodging", amount: d.price, date: d.check_in }];
  }
  if (item.type === "expense") return [item.data];
  return [];
});

const selectedPhotos = MOCK_ITEMS.filter((i) => i.type === "photo" && i.selected);

export const MOCK_SUMMARY: TripSummary = {
  trip_id: MOCK_TRIP.id,
  title: MOCK_TRIP.title,
  start_date: MOCK_TRIP.start_date,
  end_date: MOCK_TRIP.end_date,
  cover_photo_id: "p4",
  highlight_photo_ids: ["p4", "p1", "p7", "p8"],
  days: [
    {
      date: "2026-11-14",
      title: "วันแรก: ทักทายเมืองเหนือ",
      story:
        "เครื่องลงเชียงใหม่ตอนสาย อากาศเย็นกำลังดี นั่งรถแดงขึ้นไปไหว้พระธาตุดอยสุเทพ มองเห็นเมืองทั้งเมืองจากด้านบน ตกบ่ายแวะกินข้าวซอยไก่ร้านดัง แล้วปิดวันด้วยกาแฟสักแก้วที่นิมมาน",
      places: ["ดอยสุเทพ", "ย่านช้างเผือก", "นิมมานเหมินท์"],
      photo_ids: ["p1", "p2", "p3"],
    },
    {
      date: "2026-11-15",
      title: "วันที่สอง: หลังคาประเทศไทย",
      story:
        "ตื่นตีห้าขึ้นดอยอินทนนท์ ทันเห็นทะเลหมอกพอดี อุณหภูมิบนยอดเหลือไม่ถึงสิบองศา เดินชมสวนดอกไม้รอบพระมหาธาตุเจดีย์คู่ ก่อนลงมาฟังเสียงน้ำตกวชิรธารที่ไหลแรงจนละอองน้ำลอยมาถึงตัว",
      places: ["ดอยอินทนนท์", "พระมหาธาตุเจดีย์คู่", "น้ำตกวชิรธาร"],
      photo_ids: ["p4", "p5", "p7"],
    },
    {
      date: "2026-11-16",
      title: "วันสุดท้าย: เมืองเก่าและของฝาก",
      story:
        "เช้าวันสุดท้ายเดินเล่นในเมืองเก่า ชมเจดีย์หลวงที่ยิ่งใหญ่แม้จะผ่านมาหลายร้อยปี แล้วไปตลาดวโรรสหิ้วไส้อั่วกับแคบหมูกลับไปฝากที่บ้าน",
      places: ["วัดเจดีย์หลวง", "ตลาดวโรรส"],
      photo_ids: ["p8"],
    },
  ],
  route: [
    { name: "ดอยสุเทพ", lat: 18.8048, lng: 98.9216 },
    { name: "นิมมานเหมินท์", lat: 18.7999, lng: 98.9676 },
    { name: "ดอยอินทนนท์", lat: 18.5886, lng: 98.4867 },
    { name: "เจดีย์คู่", lat: 18.5464, lng: 98.4835 },
    { name: "น้ำตกวชิรธาร", lat: 18.5419, lng: 98.5986 },
    { name: "วัดเจดีย์หลวง", lat: 18.7869, lng: 98.9865 },
    { name: "ตลาดวโรรส", lat: 18.7903, lng: 99.0006 },
  ],
  expenses: {
    total: expenseLines.reduce((sum, e) => sum + e.amount, 0),
    items: expenseLines,
  },
  stats: {
    days: 3,
    places: 7,
    distance_km: 214,
    photos: selectedPhotos.length,
  },
  print: {
    headline: "เชียงใหม่ 3 วัน",
    short_text: "ลมหนาว ข้าวซอย และทะเลหมอกบนยอดดอยที่สูงที่สุดในไทย",
    photo_ids: ["p4", "p1", "p8"],
  },
  social: {
    headline: "เชียงใหม่ 3 วัน",
    photo_id: "p4",
  },
  share: { slug: MOCK_SLUG },
};

// ทุกทริปที่เคยสร้าง เรียงจากใหม่ไปเก่า (ของจริงจะอ่าน trip id จาก localStorage แล้วดึงจาก DB)
export const MOCK_TRIPS: { slug: string; summary: TripSummary }[] = [
  { slug: MOCK_SLUG, summary: MOCK_SUMMARY },
  { slug: "phuket-3-days", summary: PHUKET_SUMMARY },
  { slug: "kyoto-3-days", summary: KYOTO_SUMMARY },
];

export function getTripBySlug(slug: string) {
  return MOCK_TRIPS.find((t) => t.slug === slug);
}

const ALL_PHOTOS = [...MOCK_ITEMS, ...PHUKET_PHOTOS, ...KYOTO_PHOTOS];

export function getPhoto(id: string) {
  const item = ALL_PHOTOS.find((i) => i.id === id);
  return item?.type === "photo" ? item : undefined;
}
