// ค่าตั้งต้นของระบบ แก้ราคา/เพดานที่ไฟล์นี้ที่เดียว

// คิดเงินรายวัน: ตอนสร้างทริปเสนอเป็นแพ็กเกจตามจำนวนวันที่ตั้งไว้ ถ้าต่อทริปเกินกำหนดค่อยคิดวันที่เกินเพิ่ม
// ยังไม่ใช่ราคาจริง (ยังไม่มีระบบจ่ายเงิน บัญชีทดสอบจ่ายแบบจำลอง)
export const PRICE_PER_DAY = 39;

export const MAX_FILE_MB = 10;

// เพดานรูปที่ส่งให้ AI ต่อทริป (คุมต้นทุนหลังบ้าน) ไม่ว่าผู้ใช้จะอัปโหลดมากี่รูป
export const MAX_AI_PHOTOS_PER_TRIP = 100;

// รูปที่ส่งให้ AI ย่อด้านยาวไม่เกินนี้ (ประหยัดโควตา) ทำในเบราว์เซอร์ก่อนส่ง
export const AI_IMAGE_MAX_SIDE = 1024;

// ราคาแพ็กเกจตอนสร้างทริป
export function packagePrice(plannedDays: number) {
  return plannedDays * PRICE_PER_DAY;
}

// ค่าบริการตอนจบทริป = max(วันที่ตั้งไว้, วันที่ใช้จริง) × PRICE_PER_DAY
// จบก่อนกำหนดยังจ่ายเท่าแพ็กเกจ ต่อทริปเกินกำหนดจ่ายเพิ่มเฉพาะวันที่เกิน
export function tripBill(plannedDays: number, actualDays: number) {
  const extraDays = Math.max(0, actualDays - plannedDays);
  return {
    plannedDays,
    actualDays,
    packagePrice: packagePrice(plannedDays),
    extraDays,
    extraPrice: extraDays * PRICE_PER_DAY,
    total: Math.max(plannedDays, actualDays) * PRICE_PER_DAY,
  };
}
