import type { ExpenseLine, PhotoData, TripItem, TripSummary } from "./types";

// ทริปตัวอย่างเพิ่มเติม (นอกจากเชียงใหม่ใน mock.ts) ไว้ให้หน้า "ทริปของคุณ" มีหลายทริป

function photo(
  tripId: string,
  id: string,
  data: PhotoData,
  takenAt: string,
  lat: number,
  lng: number,
): TripItem {
  return {
    id,
    trip_id: tripId,
    type: "photo",
    data,
    file_url: null,
    taken_at: takenAt,
    lat,
    lng,
    selected: true,
    confidence: 0.95,
    created_at: takenAt,
  };
}

const sum = (items: ExpenseLine[]) => items.reduce((total, e) => total + e.amount, 0);

// ---------- ภูเก็ต 3 วัน ----------

const PHUKET_ID = "demo-phuket";

export const PHUKET_PHOTOS: TripItem[] = [
  photo(PHUKET_ID, "k1", { caption: "หาดป่าตองยามเย็น", place: "หาดป่าตอง", color: "#E0642C" }, "2026-04-10T18:20:00+07:00", 7.8961, 98.2965),
  photo(PHUKET_ID, "k2", { caption: "น้ำใสที่อ่าวมาหยา", place: "เกาะพีพี", color: "#2A9D8F" }, "2026-04-11T10:30:00+07:00", 7.6779, 98.766),
  photo(PHUKET_ID, "k3", { caption: "พระใหญ่บนยอดเขานาคเกิด", place: "พระใหญ่ภูเก็ต", color: "#C9B79C" }, "2026-04-12T09:10:00+07:00", 7.8277, 98.3127),
  photo(PHUKET_ID, "k4", { caption: "ตึกชิโนโปรตุกีสสีพาสเทล", place: "เมืองเก่าภูเก็ต", color: "#E8A93C" }, "2026-04-12T13:40:00+07:00", 7.8847, 98.388),
  photo(PHUKET_ID, "k5", { caption: "พระอาทิตย์ตกที่แหลมพรหมเทพ", place: "แหลมพรหมเทพ", color: "#B5523B" }, "2026-04-12T18:35:00+07:00", 7.7625, 98.3056),
  photo(PHUKET_ID, "k6", { caption: "หมี่ฮกเกี้ยนร้านดัง", place: "เมืองเก่าภูเก็ต", color: "#8D6E63" }, "2026-04-12T12:30:00+07:00", 7.885, 98.387),
];

const phuketExpenses: ExpenseLine[] = [
  { label: "ตั๋ว กรุงเทพฯ (DMK) → ภูเก็ต (HKT)", category: "transport", amount: 1590, date: "2026-04-10" },
  { label: "โรงแรมริมหาดป่าตอง", category: "lodging", amount: 2800, date: "2026-04-10" },
  { label: "ทัวร์เรือเกาะพีพี", category: "activity", amount: 1500, date: "2026-04-11" },
  { label: "ซีฟู้ดริมหาด", category: "food", amount: 650, date: "2026-04-11" },
  { label: "หมี่ฮกเกี้ยน", category: "food", amount: 120, date: "2026-04-12" },
  { label: "ของฝากเมืองเก่า", category: "shopping", amount: 380, date: "2026-04-12" },
];

export const PHUKET_SUMMARY: TripSummary = {
  trip_id: PHUKET_ID,
  title: "ภูเก็ต 3 วัน",
  start_date: "2026-04-10",
  end_date: "2026-04-12",
  cover_photo_id: "k2",
  highlight_photo_ids: ["k2", "k1", "k5", "k4"],
  days: [
    {
      date: "2026-04-10",
      title: "วันแรก: ทักทายทะเลอันดามัน",
      story:
        "บินถึงภูเก็ตตอนบ่าย เช็กอินโรงแรมริมหาดป่าตองแล้วรีบลงทะเลทันที เย็นนั้นนั่งดูพระอาทิตย์ค่อยๆ ลับขอบฟ้าพร้อมน้ำมะพร้าวเย็นๆ",
      places: ["หาดป่าตอง"],
      photo_ids: ["k1"],
    },
    {
      date: "2026-04-11",
      title: "วันที่สอง: ล่องเรือเกาะพีพี",
      story:
        "ขึ้นเรือแต่เช้าไปเกาะพีพี น้ำที่อ่าวมาหยาใสจนเห็นฝูงปลาว่ายรอบตัว ดำน้ำตื้นจนเหนื่อยแล้วกลับมาปิดวันด้วยซีฟู้ดริมหาด",
      places: ["เกาะพีพี"],
      photo_ids: ["k2"],
    },
    {
      date: "2026-04-12",
      title: "วันสุดท้าย: เมืองเก่าและพระอาทิตย์ตก",
      story:
        "เช้าขึ้นไปไหว้พระใหญ่บนยอดเขานาคเกิด บ่ายเดินถ่ายรูปตึกชิโนโปรตุกีสในเมืองเก่ากับหมี่ฮกเกี้ยนจานโต แล้วปิดทริปที่แหลมพรหมเทพ",
      places: ["พระใหญ่ภูเก็ต", "เมืองเก่าภูเก็ต", "แหลมพรหมเทพ"],
      photo_ids: ["k3", "k4", "k5"],
    },
  ],
  route: [
    { name: "หาดป่าตอง", lat: 7.8961, lng: 98.2965 },
    { name: "เกาะพีพี", lat: 7.6779, lng: 98.766 },
    { name: "พระใหญ่ภูเก็ต", lat: 7.8277, lng: 98.3127 },
    { name: "เมืองเก่าภูเก็ต", lat: 7.8847, lng: 98.388 },
    { name: "แหลมพรหมเทพ", lat: 7.7625, lng: 98.3056 },
  ],
  expenses: { total: sum(phuketExpenses), items: phuketExpenses },
  stats: { days: 3, places: 5, distance_km: 168, photos: PHUKET_PHOTOS.length },
  print: {
    headline: "ภูเก็ต 3 วัน",
    short_text: "ทะเลสีฟ้า เรือหางยาว และพระอาทิตย์ตกที่แหลมพรหมเทพ",
    photo_ids: ["k2", "k1", "k5"],
  },
  social: { headline: "ภูเก็ต 3 วัน", photo_id: "k2" },
  share: { slug: "phuket-3-days" },
};

// ---------- เกียวโต 3 วัน ----------

const KYOTO_ID = "demo-kyoto";

export const KYOTO_PHOTOS: TripItem[] = [
  photo(KYOTO_ID, "y1", { caption: "ป่าไผ่อาราชิยามะยามเช้า", place: "อาราชิยามะ", color: "#4C7A4C" }, "2025-11-20T08:40:00+09:00", 35.017, 135.6713),
  photo(KYOTO_ID, "y2", { caption: "ประตูโทริอิสีส้มนับพัน", place: "ฟุชิมิอินาริ", color: "#E0642C" }, "2025-11-21T08:15:00+09:00", 34.9671, 135.7727),
  photo(KYOTO_ID, "y3", { caption: "ระเบียงไม้วัดคิโยมิสึ", place: "วัดคิโยมิสึ", color: "#B5523B" }, "2025-11-21T13:00:00+09:00", 34.9949, 135.785),
  photo(KYOTO_ID, "y4", { caption: "ใบไม้แดงที่วัดเอคันโด", place: "วัดเอคันโด", color: "#C0392B" }, "2025-11-22T10:20:00+09:00", 35.0148, 135.7942),
  photo(KYOTO_ID, "y5", { caption: "ตรอกหินย่านกิอนตอนค่ำ", place: "กิอน", color: "#5D4E6D" }, "2025-11-21T18:30:00+09:00", 35.0037, 135.7788),
  photo(KYOTO_ID, "y6", { caption: "ราเม็งร้อนๆ หน้าสถานี", place: "สถานีเกียวโต", color: "#E8A93C" }, "2025-11-22T19:00:00+09:00", 34.9858, 135.7588),
];

const kyotoExpenses: ExpenseLine[] = [
  { label: "ตั๋ว กรุงเทพฯ (BKK) → โอซาก้า (KIX)", category: "transport", amount: 12900, date: "2025-11-20" },
  { label: "โรงแรมใกล้สถานีเกียวโต", category: "lodging", amount: 9600, date: "2025-11-20" },
  { label: "รถไฟและรถบัสในเมือง", category: "transport", amount: 1450, date: "2025-11-21" },
  { label: "ค่าเข้าวัด", category: "activity", amount: 900, date: "2025-11-21" },
  { label: "ราเม็งและขนมญี่ปุ่น", category: "food", amount: 1350, date: "2025-11-22" },
  { label: "ของฝาก", category: "shopping", amount: 2200, date: "2025-11-22" },
];

export const KYOTO_SUMMARY: TripSummary = {
  trip_id: KYOTO_ID,
  title: "เกียวโต 3 วัน",
  start_date: "2025-11-20",
  end_date: "2025-11-22",
  cover_photo_id: "y4",
  highlight_photo_ids: ["y4", "y2", "y1", "y3"],
  days: [
    {
      date: "2025-11-20",
      title: "วันแรก: เสียงลมในป่าไผ่",
      story:
        "นั่งรถไฟจากโอซาก้าตรงไปอาราชิยามะ เดินในป่าไผ่ตอนคนยังน้อย ได้ยินแค่เสียงลมพัดใบไผ่ เย็นนั้นเช็กอินโรงแรมใกล้สถานีเกียวโต",
      places: ["อาราชิยามะ"],
      photo_ids: ["y1"],
    },
    {
      date: "2025-11-21",
      title: "วันที่สอง: ประตูส้มนับพัน",
      story:
        "ตื่นเช้าไปเดินลอดโทริอิที่ฟุชิมิอินาริ ต่อด้วยวัดคิโยมิสึที่มองเห็นเมืองทั้งเมือง ค่ำเดินเล่นในตรอกหินย่านกิอนเผื่อจะเจอไมโกะ",
      places: ["ฟุชิมิอินาริ", "วัดคิโยมิสึ", "กิอน"],
      photo_ids: ["y2", "y3", "y5"],
    },
    {
      date: "2025-11-22",
      title: "วันสุดท้าย: ใบไม้เปลี่ยนสี",
      story:
        "วัดเอคันโดแดงไปทั้งวัดเพราะใบเมเปิลกำลังเปลี่ยนสีพอดี ก่อนกลับแวะกินราเม็งร้อนๆ หน้าสถานีและหิ้วของฝากเต็มมือ",
      places: ["วัดเอคันโด", "สถานีเกียวโต"],
      photo_ids: ["y4", "y6"],
    },
  ],
  route: [
    { name: "อาราชิยามะ", lat: 35.017, lng: 135.6713 },
    { name: "ฟุชิมิอินาริ", lat: 34.9671, lng: 135.7727 },
    { name: "วัดคิโยมิสึ", lat: 34.9949, lng: 135.785 },
    { name: "กิอน", lat: 35.0037, lng: 135.7788 },
    { name: "วัดเอคันโด", lat: 35.0148, lng: 135.7942 },
    { name: "สถานีเกียวโต", lat: 34.9858, lng: 135.7588 },
  ],
  expenses: { total: sum(kyotoExpenses), items: kyotoExpenses },
  stats: { days: 3, places: 6, distance_km: 46, photos: KYOTO_PHOTOS.length },
  print: {
    headline: "เกียวโต 3 วัน",
    short_text: "ป่าไผ่ ประตูโทริอิสีส้ม และใบเมเปิลแดงทั้งเมือง",
    photo_ids: ["y4", "y2", "y1"],
  },
  social: { headline: "เกียวโต 3 วัน", photo_id: "y4" },
  share: { slug: "kyoto-3-days" },
};
