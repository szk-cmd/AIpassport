import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cx } from "./utils";

export type Tab = { href: string; label: string; icon: LucideIcon; active?: boolean; dot?: boolean };

export const TAB_BAR_HEIGHT = 64; // px ไม่รวมพื้นที่ขอบล่างของ iPhone

// แถบเมนูล่าง (แสดงผลอย่างเดียว ตรรกะว่าแสดงหน้าไหน/แท็บไหน active อยู่ที่ components/BottomNav.tsx)
export function BottomTabBar({ tabs, className }: { tabs: Tab[]; className?: string }) {
  return (
    <nav
      aria-label="เมนูหลัก"
      className={cx("border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md", className)}
    >
      <ul className="mx-auto flex max-w-md" style={{ height: TAB_BAR_HEIGHT }}>
        {tabs.map(({ href, label, icon: Icon, active, dot }) => (
          <li key={label} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative flex h-full flex-col items-center justify-center gap-1 text-caption",
                active ? "font-semibold text-brand" : "text-ink-muted hover:text-ink",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              {label}
              {dot && <span className="absolute top-3 left-1/2 ml-2 size-2 rounded-full bg-brand" aria-hidden />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
