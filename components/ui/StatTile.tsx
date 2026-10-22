import type { LucideIcon } from "lucide-react";
import { cx, ICON } from "./utils";

// ตัวเลขสรุป เช่น "3 ทริป" ตัวเลขใหญ่ ป้ายเล็กสีรอง
export function StatTile({
  value,
  label,
  icon: Icon,
  className,
}: {
  value: React.ReactNode;
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cx("rounded-card bg-surface p-4", className)}>
      {Icon && <Icon {...ICON} className="mb-2 text-ink-muted" />}
      <p className="text-title font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-caption text-ink-muted">{label}</p>
    </div>
  );
}
