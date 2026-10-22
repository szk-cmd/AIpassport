import { cx } from "./utils";

const SIZES = { sm: "size-8 text-caption", md: "size-10 text-label", lg: "size-16 text-heading" } as const;

// รูปโปรไฟล์วงกลม ถ้าไม่มีรูปแสดงตัวอักษรแรกของชื่อ
export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const classes = cx(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    SIZES[size],
    className,
  );
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- รูปโปรไฟล์ขนาดเล็ก
    return <img src={src} alt={name} className={cx(classes, "object-cover")} />;
  }
  return (
    <span className={cx(classes, "bg-surface font-semibold text-ink-muted")} role="img" aria-label={name}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
