"use client";

import { useSession } from "@/lib/trip-store";
import { TripHistory } from "./TripHistory";

// เลือกว่าจะแสดงหน้าแบรนด์หรือประวัติทริป ตามสถานะ login ในเครื่อง
export function HomeGate({ landing }: { landing: React.ReactNode }) {
  const user = useSession();
  if (user === undefined) return null; // ยังไม่รู้ (ก่อนอ่าน localStorage) ไม่ให้หน้ากระพริบ
  return user ? <TripHistory /> : landing;
}
