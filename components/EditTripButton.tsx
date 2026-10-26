"use client";

import { Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { useSession, useStore } from "@/lib/trip-store";

// ปุ่ม "แก้ไขทริป" ในการ์ดแชร์ แสดงเฉพาะเจ้าของทริปที่ login อยู่ (คนที่เปิดลิงก์แชร์จะไม่เห็น)
// แก้เรื่องเล่า/ค่าใช้จ่ายได้หลังยืนยันแล้ว ใช้ลิงก์เดิม ไม่คิดเงินเพิ่ม
export function EditTripButton({ slug }: { slug: string }) {
  const user = useSession();
  const data = useStore();
  const trip = user
    ? data?.trips.find((t) => t.slug === slug && t.status === "completed")
    : undefined;
  if (!trip) return null;
  return (
    <ButtonLink
      href={`/trip/${trip.id}/review`}
      block
      variant="ghost"
      icon={Pencil}
    >
      แก้ไขทริป (เรื่องเล่า ค่าใช้จ่าย)
    </ButtonLink>
  );
}
