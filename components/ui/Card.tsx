import { cx } from "./utils";

// การ์ดพื้นขาว มุม 16 เงาเบา ไม่มีเส้นขอบ
export function Card({
  padded = true,
  className,
  children,
  ...props
}: { padded?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("rounded-card bg-card shadow-soft", padded && "p-6", className)} {...props}>
      {children}
    </div>
  );
}
