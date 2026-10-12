import type { ExpenseCategory } from "./types";

// วันที่แบบไทย เช่น "14 พ.ย. 2569"
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

// ช่วงวันที่ เช่น "14 – 16 พ.ย. 2569" (ถ้าข้ามเดือนจะแสดงเดือนทั้งสองฝั่ง)
export function formatDateRange(start: string, end: string) {
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const first = new Date(start).toLocaleDateString("th-TH", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
    timeZone: "Asia/Bangkok",
  });
  return `${first} – ${formatDate(end)}`;
}

export function formatBaht(amount: number) {
  return `฿${amount.toLocaleString("th-TH")}`;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: "เดินทาง",
  lodging: "ที่พัก",
  food: "อาหาร",
  activity: "กิจกรรม",
  shopping: "ของฝาก",
  other: "อื่นๆ",
};
