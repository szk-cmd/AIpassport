import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Prompt } from "next/font/google";
import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

// ฟอนต์หัวข้อ
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "500", "600", "700"], // 300 ใช้ในกรอบรูปแบบ minimal
});

// ฟอนต์หลักของแอป (sans-serif ไม่มีหัว) ระบบดีไซน์ใช้ 400/600, 500 เผื่อหน้าที่ยังไม่ได้รีดีไซน์
const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PassportAI – หนังสือเดินทางแห่งความทรงจำ",
  description: "เปลี่ยนรูปและตั๋วจากทริป ให้เป็นหนังสือเดินทางแห่งความทรงจำ",
};

export const viewport: Viewport = {
  themeColor: "#2B2019",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${notoThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* แถบเมนูอ่าน URL จึงต้องอยู่ใน Suspense (กฎของ Next 16) */}
        <Suspense>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
