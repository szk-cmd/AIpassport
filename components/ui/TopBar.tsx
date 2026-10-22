import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cx, ICON } from "./utils";

// แถบหัวหน้า สูง 56 ติดด้านบน พื้นโปร่งเบลอ: ปุ่มย้อนกลับ (หรือ leading) | ชื่อหน้า | ปุ่มด้านขวา
export function TopBar({
  title,
  subtitle,
  backHref,
  leading,
  actions,
  className,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("sticky top-0 z-30 bg-canvas/85 backdrop-blur-md", className)}>
      <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="ย้อนกลับ"
            className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface"
          >
            <ArrowLeft {...ICON} />
          </Link>
        ) : (
          leading
        )}
        <div className={cx("min-w-0 flex-1", !backHref && !leading && "pl-2")}>
          {title && <h1 className="truncate font-sans text-body font-semibold text-ink">{title}</h1>}
          {subtitle && <p className="truncate text-caption text-ink-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}

// ปุ่มไอคอนกลม เช่นปุ่มเมนู ปุ่มปิด
export function IconButton({
  label,
  children,
  className,
  ...props
}: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx("flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface", className)}
      {...props}
    >
      {children}
    </button>
  );
}
