import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cx, ICON } from "./utils";

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode; // ไอคอน รูปย่อ หรือ Avatar
  trailing?: React.ReactNode; // ข้อความ/ชิปด้านขวา
  href?: string;
  onClick?: () => void;
  className?: string;
};

// แถวในรายการ ถ้ามี href/onClick จะกดได้และมีลูกศรขวา
// วางหลายแถวต่อกันใน <ul className="divide-y divide-line"> หรือใน Card
export function ListItem({ title, subtitle, leading, trailing, href, onClick, className }: Props) {
  const interactive = Boolean(href || onClick);
  const body = (
    <>
      {leading && <span className="flex shrink-0 items-center text-ink-muted">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body text-ink">{title}</span>
        {subtitle && <span className="block truncate text-label text-ink-muted">{subtitle}</span>}
      </span>
      {trailing && <span className="shrink-0 text-label text-ink-muted">{trailing}</span>}
      {interactive && <ChevronRight {...ICON} className="shrink-0 text-ink-faint" />}
    </>
  );
  const classes = cx(
    "flex w-full items-center gap-4 px-4 py-3 text-left",
    interactive && "transition-colors hover:bg-surface",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}
