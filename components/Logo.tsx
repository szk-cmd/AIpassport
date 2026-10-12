// โลโก้ PassportAI: หนังสือเดินทาง + เครื่องบิน + วงโคจร + ประกายดาว
const BOOK = "#2B2019"; // น้ำตาลเข้ม
const ORBIT = "#E0642C"; // ส้ม
const STAR = "#E8A93C"; // เหลืองทอง

export function LogoMark({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="PassportAI"
    >
      {/* หน้ากระดาษด้านหลัง 2 แผ่น (เส้นขาวคั่นให้เห็นเป็นชั้น) */}
      <rect x="40" y="16" width="50" height="72" rx="5" fill={BOOK} stroke="#F7F2EA" strokeWidth="3" transform="rotate(10 65 52)" />
      <rect x="36" y="20" width="50" height="74" rx="5" fill={BOOK} stroke="#F7F2EA" strokeWidth="3" transform="rotate(5 61 57)" />
      {/* ปกหน้า */}
      <rect x="28" y="26" width="54" height="76" rx="6" fill={BOOK} stroke="#F7F2EA" strokeWidth="3" />
      {/* เครื่องบิน */}
      <path
        d="M12 2c.8 0 1.5.7 1.5 1.5V9l7.5 4.5v2l-7.5-2.3V18l2 1.5V21L12 20l-3.5 1v-1.5l2-1.5v-4.8L3 15.5v-2L10.5 9V3.5C10.5 2.7 11.2 2 12 2z"
        fill="#F7F2EA"
        transform="translate(55 64) rotate(45) scale(1.55) translate(-12 -12)"
      />
      {/* วงโคจร */}
      <path
        d="M22 74 C 8 92, 36 104, 70 92 C 90 85, 104 72, 106 58"
        fill="none"
        stroke={ORBIT}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* ประกายดาว */}
      <path d="M103 18 L106.5 31.5 L120 35 L106.5 38.5 L103 52 L99.5 38.5 L86 35 L99.5 31.5 Z" fill={STAR} />
    </svg>
  );
}

// โลโก้บนแผ่นสีครีม (แบบไอคอนแอป) ใช้บนพื้นเข้มได้
export function LogoTile({ size = 120 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-cream shadow-xl"
      style={{ width: size, height: size, borderRadius: size * 0.26 }}
    >
      <LogoMark size={size * 0.78} />
    </div>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading font-bold tracking-tight ${className}`}>
      Passport <span className="text-orange">AI</span>
    </span>
  );
}
