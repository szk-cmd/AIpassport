"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { activeTrips, useSession, useStore } from "@/lib/trip-store";

const NAV_HEIGHT = 64; // px ไม่รวมพื้นที่ขอบล่างของ iPhone

// แสดงแถบเฉพาะหน้าหลักของแอป ซ่อนในหน้า output (print, social, order) และขั้นตอนสร้างพาสปอร์ต
function showOn(path: string) {
  return (
    path === "/" ||
    path === "/chat" ||
    path === "/profile" ||
    /^\/trip\/[^/]+\/chat$/.test(path) ||
    /^\/t\/[^/]+$/.test(path)
  );
}

// แถบเมนูล่างแบบ LINE: หน้าแรก / แชท / โปรไฟล์
export function BottomNav() {
  const path = usePathname();
  const user = useSession();
  const data = useStore();
  const keyboardOpen = useKeyboardOpen();
  const inChat = path === "/chat" || path.endsWith("/chat");
  const visible = Boolean(user) && showOn(path) && !(inChat && keyboardOpen);

  // บอกหน้าอื่น (เช่นแชทที่สูงเต็มจอ) ว่าต้องเว้นที่ด้านล่างเท่าไร
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--nav-h",
      visible ? `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))` : "0px",
    );
  }, [visible]);

  if (!visible) return null;

  // ทริปที่กำลังเที่ยวมีทริปเดียว → เข้าแชทนั้นตรงๆ, หลายทริป → รายการแชท
  const active = data ? activeTrips(data) : [];
  const chatHref = active.length === 1 ? `/trip/${active[0].id}/chat` : "/chat";
  const tabs = [
    { href: "/", label: "หน้าแรก", icon: "home", on: path === "/" || path.startsWith("/t/") },
    { href: chatHref, label: "แชท", icon: "chat", on: inChat, dot: active.length > 0 },
    { href: "/profile", label: "โปรไฟล์", icon: "user", on: path === "/profile" },
  ] as const;

  return (
    <>
      {/* เว้นที่ท้ายหน้า เนื้อหาจะได้ไม่โดนแถบบัง */}
      <div style={{ height: "var(--nav-h)" }} aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brown/10 bg-cream pb-[env(safe-area-inset-bottom)] text-brown"
        aria-label="เมนูหลัก"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3" style={{ height: NAV_HEIGHT }}>
          {tabs.map((t) => (
            <li key={t.label}>
              <Link
                href={t.href}
                aria-current={t.on ? "page" : undefined}
                className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-xs ${
                  t.on ? "font-semibold text-orange" : "text-brown/55"
                }`}
              >
                <NavIcon name={t.icon} filled={t.on} />
                {t.label}
                {"dot" in t && t.dot && (
                  <span className="absolute top-2.5 left-1/2 ml-2 size-2 rounded-full bg-orange" aria-hidden />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

// มือถือไม่มี event คีย์บอร์ดตรงๆ จึงดูว่ากำลังพิมพ์ในช่อง input/textarea อยู่ไหม
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
    const onIn = (e: FocusEvent) => isField(e.target) && setOpen(true);
    // รอให้โฟกัสย้ายเสร็จก่อน: ถ้ายังอยู่ในช่องพิมพ์ (เช่นกดปุ่มส่งแล้วโฟกัสกลับ) ไม่ต้องโชว์แถบ
    const onOut = () => setTimeout(() => setOpen(isField(document.activeElement)), 100);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);
  return open;
}

function NavIcon({ name, filled }: { name: "home" | "chat" | "user"; filled: boolean }) {
  const paths = {
    home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
    chat: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
      </>
    ),
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
