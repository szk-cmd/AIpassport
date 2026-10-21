import type { ChatMessage, StoredTrip } from "./trip-store";

// ทริปเดโมที่ "กำลังเที่ยว" ของบัญชีทดสอบ วันที่คำนวณจากวันนี้เสมอ
// - หัวหิน: อยู่วันที่ 2 จาก 3
// - เขาใหญ่: เที่ยวจบไปตั้งแต่สัปดาห์ก่อนแต่ยังไม่กดจบทริป (ค้างแชทไว้ บอทจะถามว่าจะต่อทริปไหม)
export const DEMO_ACTIVE_ID = "demo-huahin";
export const DEMO_IDLE_ID = "demo-khaoyai";

type DemoTrip = { trip: StoredTrip; messages: ChatMessage[] };

export function mockActiveTrips(now = new Date()): DemoTrip[] {
  return [huahin(now), khaoYai(now)];
}

function helpers(now: Date, tripId: string) {
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
  const msg = (
    from: ChatMessage["from"],
    at: Date,
    body: Pick<ChatMessage, "text" | "photos" | "extracted">,
  ): ChatMessage => ({
    id: `${tripId}-m${++n}`,
    from,
    at: at.toISOString(),
    ...body,
  });
  return { day, key, today, msg };
}

function huahin(now: Date): DemoTrip {
  const { day, key, today, msg } = helpers(now, DEMO_ACTIVE_ID);
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

function khaoYai(now: Date): DemoTrip {
  const { day, key, msg } = helpers(now, DEMO_IDLE_ID);
  return {
    trip: {
      id: DEMO_IDLE_ID,
      title: "เขาใหญ่ 2 วัน",
      start_date: key(day(-9, 0)),
      end_date: key(day(-8, 0)),
      planned_days: 2,
      status: "active",
      ended_at: null,
      paid_amount: null,
      paid_at: null,
      created_at: day(-9, 7).toISOString(),
      slug: null,
    },
    messages: [
      msg("bot", day(-9, 7), {
        text: "เริ่มทริป “เขาใหญ่ 2 วัน” แล้ว! ส่งรูป เล่าเรื่อง หรือถ่ายใบเสร็จมาได้ตลอดทริป เดี๋ยวผมจดให้ทั้งหมด",
      }),
      msg("user", day(-9, 10, 15), {
        text: "ถึงจุดชมวิวผาเดียวดายแล้ว ลมเย็นมาก ค่าเข้าอุทยาน 40 บาท",
        extracted: {
          places: ["ผาเดียวดาย"],
          expenses: [{ label: "ค่าเข้าอุทยาน", amount: 40, category: "activity" }],
        },
      }),
      msg("bot", day(-9, 10, 16), {
        text: "จดไว้แล้ว ผาเดียวดาย ลมเย็นสบาย ค่าเข้าอุทยาน 40 บาท 🌲 ได้เจอสัตว์ป่าบ้างไหม",
      }),
      msg("user", day(-9, 16, 40), {
        photos: [
          { thumb: null, color: "#4C9A8A", caption: "น้ำตกเหวสุวัต" },
          { thumb: null, color: "#8D6E63", caption: "ฝูงลิงข้างทาง" },
        ],
      }),
      msg("bot", day(-9, 16, 41), { text: "ได้รูปแล้ว 2 รูป 📸 น้ำตกเหวสุวัตสวยมาก แล้วลิงเยอะแบบนี้ระวังของกินด้วยนะ" }),
      msg("user", day(-8, 12, 30), {
        text: "แวะกินสเต็กฟาร์มโชคชัย 420 บาท ก่อนกลับกรุงเทพ",
        extracted: {
          places: ["ฟาร์มโชคชัย"],
          expenses: [{ label: "สเต็กฟาร์มโชคชัย", amount: 420, category: "food" }],
        },
      }),
      msg("bot", day(-8, 12, 31), { text: "จดไว้แล้ว สเต็กฟาร์มโชคชัย 420 บาท 🥩 เดินทางกลับปลอดภัยนะ" }),
    ],
  };
}
