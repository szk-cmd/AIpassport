"use client";

import { Home, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomTabBar, TAB_BAR_HEIGHT } from "@/components/ui";
import { activeTrips, useSession, useStore } from "@/lib/trip-store";

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
      visible ? `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))` : "0px",
    );
  }, [visible]);

  if (!visible) return null;

  // ทริปที่กำลังเที่ยวมีทริปเดียว → เข้าแชทนั้นตรงๆ, หลายทริป → รายการแชท
  const active = data ? activeTrips(data) : [];
  const chatHref = active.length === 1 ? `/trip/${active[0].id}/chat` : "/chat";
  const tabs = [
    { href: "/", label: "หน้าแรก", icon: Home, active: path === "/" || path.startsWith("/t/") },
    { href: chatHref, label: "แชท", icon: MessageCircle, active: inChat, dot: active.length > 0 },
    { href: "/profile", label: "โปรไฟล์", icon: User, active: path === "/profile" },
  ];

  return (
    <>
      {/* เว้นที่ท้ายหน้า เนื้อหาจะได้ไม่โดนแถบบัง */}
      <div style={{ height: "var(--nav-h)" }} aria-hidden />
      <BottomTabBar tabs={tabs} className="fixed inset-x-0 bottom-0 z-40" />
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
