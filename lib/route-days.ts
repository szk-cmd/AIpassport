import type { RoutePoint } from "./types";

// สีเส้นทางแยกตามวัน (วนซ้ำถ้าทริปยาวกว่านี้) ใช้คู่กับเลขวันในรายการเสมอ ไม่ได้บอกด้วยสีอย่างเดียว
export const DAY_COLORS = [
  "#C2410C",
  "#1E6B63",
  "#3B6EA8",
  "#B45309",
  "#8E4B7A",
  "#57534E",
];

// ลำดับวัน (0 = วันแรกที่มีจุดบนแผนที่) จุดที่ไม่มีวันที่ (ผลสรุปแบบเก่า) นับเป็นวันแรก
export function dayIndexOf(route: RoutePoint[]) {
  const dates = [
    ...new Set(route.map((p) => p.date).filter((d): d is string => Boolean(d))),
  ].sort();
  return (p: RoutePoint) => (p.date ? Math.max(0, dates.indexOf(p.date)) : 0);
}

export function dayColor(index: number) {
  return DAY_COLORS[index % DAY_COLORS.length];
}
