import type { Metadata } from "next";
import { ConfirmForm } from "./ConfirmForm";

export const metadata: Metadata = { title: "ตรวจสอบข้อมูล – PassportAI" };

// MOCK: ยังไม่อ่าน id จาก URL ใช้ทริปตัวอย่างเสมอ
export default function ConfirmPage() {
  return <ConfirmForm />;
}
