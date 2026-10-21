// คำตอบบอทในแชทแบบ MOCK (ยังไม่เรียก AI) สัปดาห์ 2 จะเปลี่ยนเป็น agent จริงฝั่ง server

const CHATTY = [
  "จดไว้แล้ว ✍️ เล่าต่อได้เลยนะ",
  "ฟังดูสนุกมาก! มีรูปตรงนั้นไหม ส่งมาได้เลย",
  "เก็บเรื่องนี้ไว้ในพาสปอร์ตให้แล้ว 📖",
  "เยี่ยมเลย ตอนจบทริปผมจะเรียบเรียงเป็นเรื่องเล่าให้",
];

// เดาว่าเป็นค่าใช้จ่ายถ้ามีตัวเลขคู่กับคำว่าบาท / ฿
const MONEY = /(\d[\d,]*)\s*(บาท|฿)|฿\s*\d/;

export function botReply(input: { text?: string; photoCount?: number }, turn: number) {
  if (input.photoCount) return `ได้รูปแล้ว ${input.photoCount} รูป 📸 เก็บเข้าพาสปอร์ตให้แล้ว`;
  if (input.text && MONEY.test(input.text)) return "จดค่าใช้จ่ายไว้ให้แล้ว 💰 ตอนจบทริปจะสรุปรวมให้";
  return CHATTY[turn % CHATTY.length];
}
