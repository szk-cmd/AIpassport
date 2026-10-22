import type { Metadata } from "next";
import { Showcase } from "./Showcase";

export const metadata: Metadata = { title: "UI – PassportAI" };

// ตัวอย่างระบบดีไซน์ใหม่ทุกชิ้น (components/ui) ยังไม่ได้ใช้ในหน้าจริง
export default function UiPage() {
  return <Showcase />;
}
