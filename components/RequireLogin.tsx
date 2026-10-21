"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/trip-store";

// หน้าที่ต้อง login ก่อน: ยังไม่ login ให้กลับไปหน้าแรก (ซึ่งมีฟอร์มเข้าสู่ระบบ)
export function RequireLogin({ children }: { children: React.ReactNode }) {
  const user = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/");
  }, [user, router]);

  return user ? children : null;
}
