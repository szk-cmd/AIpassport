"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { IconButton } from "./TopBar";
import { cx, ICON } from "./utils";

// ลิ้นชัก: เลื่อนออกจากซ้าย (เช่นรายการทริป) หรือจากล่าง (เช่นตัวเลือก) กด Esc หรือแตะพื้นหลังเพื่อปิด
export function Sheet({
  open,
  onClose,
  title,
  side = "left",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "bottom";
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cx("fixed inset-0 z-50", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cx("absolute inset-0 bg-ink/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        inert={!open}
        className={cx(
          "absolute flex flex-col bg-card shadow-soft transition-transform duration-300",
          side === "left"
            ? cx("inset-y-0 left-0 w-4/5 max-w-xs", open ? "translate-x-0" : "-translate-x-full")
            : cx(
                "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-card pb-[env(safe-area-inset-bottom)]",
                open ? "translate-y-0" : "translate-y-full",
              ),
        )}
      >
        {side === "bottom" && <span className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" aria-hidden />}
        <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-4">
          <h2 className="font-sans text-body font-semibold text-ink">{title}</h2>
          <IconButton label="ปิด" onClick={onClose}>
            <X {...ICON} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </aside>
    </div>
  );
}
