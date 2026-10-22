import type { LucideIcon } from "lucide-react";
import { cx } from "./utils";

// ชิปเล็ก ใช้แสดงแท็ก/สถานที่ หรือเป็นตัวเลือกเปิด-ปิด (ส่ง onClick + selected)
export function Chip({
  selected = false,
  icon: Icon,
  className,
  children,
  onClick,
  ...props
}: { selected?: boolean; icon?: LucideIcon } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cx(
    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-label transition-colors",
    selected ? "bg-brand/10 text-brand font-semibold" : "bg-surface text-ink-muted",
    onClick && !selected && "hover:bg-line hover:text-ink",
    className,
  );
  const content = (
    <>
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />}
      {children}
    </>
  );
  if (!onClick) return <span className={classes}>{content}</span>;
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={classes} {...props}>
      {content}
    </button>
  );
}
