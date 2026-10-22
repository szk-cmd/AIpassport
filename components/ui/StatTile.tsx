import { cx } from "./utils";

// ตัวเลขสรุป ไม่มีกรอบ: ตัวเลข 28px 600 ป้ายกำกับ 12px สีรอง วางเรียงในแถวเดียว (ดู StatRow)
export function StatTile({ value, label, className }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={cx("min-w-0", className)}>
      <p className="text-title font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-caption text-ink-muted">{label}</p>
    </div>
  );
}

// แถวตัวเลขสรุป ชิดซ้าย กว้างตามตัวเลข (ตัวเลขยาวอย่าง ฿4,130 จะไม่ทับช่องข้างๆ)
export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("flex flex-wrap gap-x-10 gap-y-4", className)}>{children}</div>;
}
