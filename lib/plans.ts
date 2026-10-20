// แพ็กเกจทั้งหมด แก้ราคา/สิทธิ์ที่ไฟล์นี้ที่เดียว
// อัปโหลดรูปได้ไม่จำกัดทุกแพ็กเกจ จำกัดที่ output แทน (จำนวนรูปที่ AI คัดเข้าพาสปอร์ต, จำนวนทริป, ลายน้ำ)
// ตอนนี้เปิดให้เลือกได้แค่ "ฟรี" (ยังไม่มีระบบจ่ายเงิน)

export type PlanId = "free" | "plus";

export type Plan = {
  id: PlanId;
  name: string;
  price: number | null; // บาท, null = ยังไม่ได้ตั้งราคา (แสดง [฿__])
  aiPhotos: number; // จำนวนรูปที่ AI คัดเข้าพาสปอร์ตต่อทริป
  tripsPerMonth: number | null; // null = ไม่จำกัด
  watermark: boolean; // ลายน้ำบน Digital History + Social Card
  features: string[];
  available: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    aiPhotos: 20,
    tripsPerMonth: 2,
    watermark: true,
    features: [
      "อัปโหลดรูปไม่จำกัด",
      "AI คัดเข้าพาสปอร์ต 20 รูป/ทริป",
      "2 ทริป/เดือน",
      "Digital History + Social Card (มีลายน้ำ)",
    ],
    available: true,
  },
  {
    id: "plus",
    name: "Plus",
    price: null,
    aiPhotos: 60,
    tripsPerMonth: null,
    watermark: false,
    features: [
      "อัปโหลดรูปไม่จำกัด",
      "AI คัดเข้าพาสปอร์ต 60 รูป/ทริป",
      "ทริปไม่จำกัด",
      "ไม่มีลายน้ำ",
      "กรอบรูป PDF ความละเอียดสูง",
      "สมุดสะสมตราประทับ",
    ],
    available: false,
  },
];

export const DEFAULT_PLAN = PLANS[0];

export const MAX_FILE_MB = 10;

// เพดานรูปที่ส่งให้ AI ต่อทริป (คุมต้นทุนหลังบ้าน) ไม่ว่าผู้ใช้จะอัปโหลดมากี่รูป
export const MAX_AI_PHOTOS_PER_TRIP = 100;

export function formatPlanPrice(plan: Plan) {
  if (plan.price === null) return "[฿__]";
  return plan.price === 0 ? "฿0" : `฿${plan.price.toLocaleString("th-TH")}`;
}

export function getPlan(id: PlanId) {
  return PLANS.find((p) => p.id === id) ?? DEFAULT_PLAN;
}
