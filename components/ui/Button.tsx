import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cx, ICON } from "./utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-surface text-ink hover:bg-line",
  ghost: "bg-transparent text-ink hover:bg-surface",
};

const SIZES: Record<Size, string> = {
  md: "h-12 px-6 text-body gap-2",
  sm: "h-9 px-4 text-label gap-1.5",
};

// ปุ่มที่กดไม่ได้: พื้นเทาอ่อน ตัวหนังสือเทา (ไม่ใช้สีซีดลง)
const DISABLED = "disabled:bg-surface disabled:text-ink-faint disabled:cursor-not-allowed aria-disabled:bg-surface aria-disabled:text-ink-faint aria-disabled:pointer-events-none";

export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
}: { variant?: Variant; size?: Size; block?: boolean } = {}) {
  return cx(
    "inline-flex items-center justify-center rounded-control font-semibold transition-colors select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    VARIANTS[variant],
    SIZES[size],
    DISABLED,
    block && "w-full",
  );
}

type Common = { variant?: Variant; size?: Size; block?: boolean; icon?: LucideIcon };

export function Button({
  variant,
  size,
  block,
  icon: Icon,
  className,
  children,
  type = "button",
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(buttonClass({ variant, size, block }), className)} {...props}>
      {Icon && <Icon {...ICON} size={size === "sm" ? 16 : ICON.size} />}
      {children}
    </button>
  );
}

// ลิงก์ที่หน้าตาเป็นปุ่ม (เช่นปุ่มไปหน้าอื่น)
export function ButtonLink({
  variant,
  size,
  block,
  icon: Icon,
  className,
  children,
  ...props
}: Common & React.ComponentProps<typeof Link>) {
  return (
    <Link className={cx(buttonClass({ variant, size, block }), className)} {...props}>
      {Icon && <Icon {...ICON} size={size === "sm" ? 16 : ICON.size} />}
      {children}
    </Link>
  );
}
