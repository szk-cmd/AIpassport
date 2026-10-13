// ตราประทับสถานที่ แบบวงกลมหรือสี่เหลี่ยม ขอบหยัก เอียงนิดๆ หมึกซึมเล็กน้อย

export const STAMP_COLORS = ["#E0642C", "#1E6B63"] as const; // ส้ม, เขียวอมฟ้า

// ตัวเลขสุ่มแบบคงที่จากข้อความ (server/browser ได้ค่าเดียวกัน ไม่เกิด hydration mismatch)
export function seeded(text: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000; // 0..1
}

type Props = {
  label: string;
  sub?: string;
  shape?: "circle" | "rect";
  color?: string;
  rotate?: number; // องศา ถ้าไม่ระบุจะสุ่มจากชื่อ (-12..12)
  className?: string;
  style?: React.CSSProperties;
};

export function Stamp({ label, sub, shape = "circle", color = STAMP_COLORS[0], rotate, className = "", style }: Props) {
  const angle = rotate ?? Math.round(seeded(label) * 24 - 12);
  const id = `ink-${Math.round(seeded(label, 7) * 1e6)}`;
  // ชื่อยาวให้ตัวเล็กลง จะได้ไม่ล้นตรา
  const fontSize = Math.min(30, 230 / Math.max(label.length, 4));

  return (
    <svg
      viewBox={shape === "circle" ? "0 0 200 200" : "0 0 240 160"}
      className={className}
      style={{ ...style, transform: `rotate(${angle}deg)`, color }}
      role="img"
      aria-label={`ตราประทับ ${label}`}
    >
      <defs>
        {/* ทำให้ขอบหมึกขรุขระเหมือนประทับจริง */}
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.round(seeded(label, 3) * 99)} />
          <feDisplacementMap in="SourceGraphic" scale="2.5" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} fill="none" stroke="currentColor" opacity="0.88">
        {shape === "circle" ? (
          <>
            <path d={zigzagCircle(100, 100, 96, 88, 36)} strokeWidth="4" />
            <circle cx="100" cy="100" r="74" strokeWidth="2" />
            <path id={`${id}-arc`} d="M 42 100 A 58 58 0 0 1 158 100" stroke="none" />
            <text fill="currentColor" stroke="none" fontSize="15" fontWeight="700" letterSpacing="3">
              <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
                PASSPORT AI
              </textPath>
            </text>
            <text
              x="100"
              y={sub ? 108 : 112}
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize={fontSize}
              fontWeight="700"
              style={{ fontFamily: "var(--font-prompt)" }}
            >
              {label}
            </text>
            {sub && (
              <text x="100" y="136" textAnchor="middle" fill="currentColor" stroke="none" fontSize="13" fontWeight="600" letterSpacing="1">
                {sub}
              </text>
            )}
          </>
        ) : (
          <>
            <path d={zigzagRect(4, 4, 232, 152, 9)} strokeWidth="4" />
            <rect x="18" y="18" width="204" height="124" rx="4" strokeWidth="2" />
            <text x="120" y="46" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontWeight="700" letterSpacing="3">
              ✈ PASSPORT AI
            </text>
            <text
              x="120"
              y="92"
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize={fontSize * 1.1}
              fontWeight="700"
              style={{ fontFamily: "var(--font-prompt)" }}
            >
              {label}
            </text>
            {sub && (
              <text x="120" y="124" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontWeight="600" letterSpacing="1">
                {sub}
              </text>
            )}
          </>
        )}
      </g>
    </svg>
  );
}

// ขอบวงกลมหยักแบบฟันเลื่อย
function zigzagCircle(cx: number, cy: number, outer: number, inner: number, teeth: number) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / teeth;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

// ขอบสี่เหลี่ยมหยักแบบแสตมป์
function zigzagRect(x: number, y: number, w: number, h: number, step: number) {
  const d = 5;
  const pts: string[] = [];
  const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.round(len / step);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const off = i % 2 === 0 ? 0 : d;
      pts.push(`${(x1 + (x2 - x1) * t + nx * off).toFixed(1)},${(y1 + (y2 - y1) * t + ny * off).toFixed(1)}`);
    }
  };
  edge(x, y, x + w, y, 0, 1);
  edge(x + w, y, x + w, y + h, -1, 0);
  edge(x + w, y + h, x, y + h, 0, -1);
  edge(x, y + h, x, y, 1, 0);
  return `M ${pts.join(" L ")} Z`;
}
