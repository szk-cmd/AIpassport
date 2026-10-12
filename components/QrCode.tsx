"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type Props = {
  path: string; // เช่น "/t/chiangmai-3-days" (ต่อหน้าด้วยโดเมนที่เปิดอยู่)
  size?: number;
  dark?: string;
  light?: string;
  className?: string;
};

// สร้าง QR ในเบราว์เซอร์ เพราะต้องรู้โดเมนจริง (localhost ตอนพัฒนา, vercel ตอน deploy)
export function QrCode({ path, size = 160, dark = "#2B2019", light = "#F7F2EA", className = "" }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(path, window.location.origin).toString();
    QRCode.toDataURL(url, { margin: 1, width: size * 2, color: { dark, light } }).then(setSrc);
  }, [path, size, dark, light]);

  return (
    <div className={className} style={{ width: size, height: size, background: light }}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- data URL สร้างเอง
        <img src={src} alt="QR code สำหรับเปิดหน้าทริป" width={size} height={size} />
      )}
    </div>
  );
}
