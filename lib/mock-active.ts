import type { ChatMessage, StoredTrip } from "./trip-store";

// ทริปเดโมที่ "กำลังเที่ยว" ของบัญชีทดสอบ: วันที่คำนวณจากวันนี้ จึงอยู่วันที่ 2 จาก 3 เสมอ
export const DEMO_ACTIVE_ID = "demo-huahin";

export function mockActiveTrip(now = new Date()): { trip: StoredTrip; messages: ChatMessage[] } {
  const day = (offset: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  // ข้อความวันนี้ต้องไม่อยู่ในอนาคต ถ้ายังเช้าอยู่ให้เป็นเวลาตอนนี้แทน
  const today = (hour: number, minute = 0) => new Date(Math.min(day(0, hour, minute).getTime(), now.getTime()));

  let n = 0;
  const msg = (from: ChatMessage["from"], at: Date, body: Pick<ChatMessage, "text" | "photos">): ChatMessage => ({
    id: `${DEMO_ACTIVE_ID}-m${++n}`,
    from,
    at: at.toISOString(),
    ...body,
  });

  return {
    trip: {
      id: DEMO_ACTIVE_ID,
      title: "หัวหิน 3 วัน",
      start_date: key(day(-1, 0)),
      end_date: key(day(1, 0)),
      planned_days: 3,
      status: "active",
      ended_at: null,
      paid_amount: null,
      paid_at: null,
      created_at: day(-1, 8).toISOString(),
      slug: null,
    },
    messages: [
      msg("bot", day(-1, 8), {
        text: "เริ่มทริป “หัวหิน 3 วัน” แล้ว! ส่งรูป เล่าเรื่อง หรือถ่ายใบเสร็จมาได้ตลอดทริป เดี๋ยวผมจดให้ทั้งหมด",
      }),
      msg("user", day(-1, 11, 20), {
        photos: [
          { thumb: null, color: "#5B7DA8", caption: "ทะเลหัวหินยามสาย" },
          { thumb: null, color: "#E8A93C", caption: "สถานีรถไฟหัวหิน" },
        ],
      }),
      msg("bot", day(-1, 11, 21), { text: "ได้รูปแล้ว 2 รูป 📸 เก็บเข้าพาสปอร์ตให้แล้ว" }),
      msg("user", day(-1, 13, 5), { text: "กินซีฟู้ดร้านริมทะเล 850 บาท ปูม้านึ่งสดมาก" }),
      msg("bot", day(-1, 13, 6), { text: "จดค่าใช้จ่ายไว้ให้แล้ว 💰 ตอนจบทริปจะสรุปรวมให้" }),
      msg("user", day(-1, 19, 40), { text: "เดินตลาดโต้รุ่ง ได้ขนมหม้อแกงกลับมาด้วย" }),
      msg("bot", day(-1, 19, 41), { text: "จดไว้แล้ว ✍️ เล่าต่อได้เลยนะ" }),
      msg("user", today(7, 30), {
        photos: [{ thumb: null, color: "#4C9A8A", caption: "เขาตะเกียบตอนเช้า" }],
      }),
      msg("bot", today(7, 31), { text: "ได้รูปแล้ว 1 รูป 📸 เก็บเข้าพาสปอร์ตให้แล้ว" }),
    ],
  };
}
