// แพ็กเกจทั้งหมด แก้ราคา/เพดานที่ไฟล์นี้ที่เดียว
// ตอนนี้เปิดให้เลือกได้แค่ "ทดลองฟรี" (ยังไม่มีระบบจ่ายเงิน)

export type PlanId = "free" | "plus" | "pro" | "max";

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // บาท ต่อ 1 ทริป
  maxPhotos: number;
  maxDocs: number; // ตั๋ว ใบเสร็จ ที่พัก
  available: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "ทดลองฟรี", price: 0, maxPhotos: 30, maxDocs: 10, available: true },
  { id: "plus", name: "Plus", price: 99, maxPhotos: 100, maxDocs: 30, available: false },
  { id: "pro", name: "Pro", price: 499, maxPhotos: 300, maxDocs: 60, available: false },
  { id: "max", name: "Max", price: 999, maxPhotos: 600, maxDocs: 100, available: false },
];

export const DEFAULT_PLAN = PLANS[0];

export const MAX_FILE_MB = 10;

export function getPlan(id: PlanId) {
  return PLANS.find((p) => p.id === id) ?? DEFAULT_PLAN;
}
