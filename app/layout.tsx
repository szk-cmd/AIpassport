import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Prompt } from "next/font/google";
import "./globals.css";

// ฟอนต์หัวข้อ
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

// ฟอนต์เนื้อหา
const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
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
      className={`${prompt.variable} ${plexThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
