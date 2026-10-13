"use client";

import { useState } from "react";

// คัดลอกลิงก์หน้าทริป (ต่อหน้าด้วยโดเมนที่เปิดอยู่)
export function CopyLinkButton({ path, className = "" }: { path: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = new URL(path, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API ใช้ได้เฉพาะ https/localhost ถ้าเปิดผ่าน IP ในวง Wi-Fi ใช้วิธีเก่าแทน
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {copied ? "คัดลอกแล้ว ✓" : "🔗 คัดลอกลิงก์"}
    </button>
  );
}
