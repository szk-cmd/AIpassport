// id ของทริปเดโมที่ระบบ seed ให้บัญชีทดสอบ (ตายตัว จะได้ลิงก์ไปหาจากหน้า /dev ได้) ฐานข้อมูลใช้ uuid
export const DEMO_IDS = {
  chiangmai: "00000000-0000-4000-8000-000000000001",
  phuket: "00000000-0000-4000-8000-000000000002",
  kyoto: "00000000-0000-4000-8000-000000000003",
  huahin: "00000000-0000-4000-8000-000000000004",
  khaoyai: "00000000-0000-4000-8000-000000000005",
} as const;

// ทริปเดโมที่จบแล้ว ผูกกับ slug ของข้อมูลชุดเดิมใน lib/mock.ts
export const DEMO_SLUG_IDS: Record<string, string> = {
  "chiangmai-3-days": DEMO_IDS.chiangmai,
  "phuket-3-days": DEMO_IDS.phuket,
  "kyoto-3-days": DEMO_IDS.kyoto,
};
