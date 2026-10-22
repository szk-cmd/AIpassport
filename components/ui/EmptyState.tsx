import type { LucideIcon } from "lucide-react";
import { cx } from "./utils";

// หน้าว่าง: ไอคอนในวงกลม + หัวข้อ + คำอธิบาย + ปุ่ม (ถ้ามี)
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span className="flex size-16 items-center justify-center rounded-full bg-surface text-ink-muted">
        <Icon size={28} strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="mt-6 font-sans text-heading font-semibold text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-xs text-body text-ink-muted">{description}</p>}
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  );
}
