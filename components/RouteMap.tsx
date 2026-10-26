import { TripMap } from "@/components/TripMap";
import { dayColor, dayIndexOf } from "@/lib/route-days";
import type { RoutePoint } from "@/lib/types";

// แปลงพิกัด lat/lng เป็นตำแหน่ง x/y ในกรอบขนาด w×h (สเกลเท่ากันทั้งสองแกน แผนที่จะได้ไม่บิด)
function project(route: RoutePoint[], w: number, h: number, pad: number) {
  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const scale = Math.min(
    (w - pad * 2) / (Math.max(...lngs) - minLng || 1),
    (h - pad * 2) / (maxLat - minLat || 1),
  );
  const offsetX = (w - (Math.max(...lngs) - minLng) * scale) / 2;
  const offsetY = (h - (maxLat - minLat) * scale) / 2;

  return route.map((p) => ({
    ...p,
    x: offsetX + (p.lng - minLng) * scale,
    y: offsetY + (maxLat - p.lat) * scale, // ละติจูดมากอยู่ด้านบน
  }));
}

const W = 320;
const H = 240;

// หน้าเว็บ: แผนที่จริง (เลื่อน/ซูมได้) + รายชื่อจุดเรียงตามเวลา แยกสีตามวัน
// กรอบรูปสำหรับพิมพ์ใช้ RouteMapImage (ภาพนิ่ง) ด้านล่างแทน
export function RouteMap({ route }: { route: RoutePoint[] }) {
  if (route.length === 0) return null;
  const dayOf = dayIndexOf(route);
  const hasDays = route.some((p) => p.date);

  return (
    <div>
      <TripMap route={route} />
      <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-label text-ink">
        {route.map((p, i) => (
          <li key={p.name} className="flex items-start gap-2">
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-caption font-semibold text-white tabular-nums"
              style={{ background: dayColor(dayOf(p)) }}
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              {p.name}
              {hasDays && (
                <span className="block text-caption text-ink-muted">
                  วันที่ {dayOf(p) + 1}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// สีแผนที่: dark = แบบเดิม (กรอบรูปสำหรับพิมพ์), light = ระบบดีไซน์ใหม่ในหน้าเว็บ (พื้นเทาอ่อน เส้นทึบ)
const MAP_TONES = {
  dark: {
    bg: "#1E6B63",
    grid: "#F7F2EA",
    line: "#E8A93C",
    dash: "6 5",
    dot: "#E0642C",
    ring: "#F7F2EA",
  },
  light: {
    bg: "#F2F1EE",
    grid: "#1C1917",
    line: "#57534E",
    dash: undefined,
    dot: "#C2410C",
    ring: "#FFFFFF",
  },
} as const;

// ภาพแผนที่อย่างเดียว (ไม่มีรายชื่อสถานที่) ใช้ในหน้าทริปและกรอบรูปสำหรับพิมพ์
export function RouteMapImage({
  route,
  className = "",
  tone = "dark",
}: {
  route: RoutePoint[];
  className?: string;
  tone?: keyof typeof MAP_TONES;
}) {
  const points = project(route, W, H, 28);
  const c = MAP_TONES[tone];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ background: c.bg }}
      role="img"
      aria-label="แผนที่เส้นทาง"
    >
      <defs>
        <pattern
          id={`grid-${tone}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke={c.grid}
            strokeOpacity="0.06"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#grid-${tone})`} />
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={c.line}
        strokeWidth={tone === "light" ? 1.75 : 2.5}
        strokeDasharray={c.dash}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={p.name}>
          <circle
            cx={p.x}
            cy={p.y}
            r="10"
            fill={c.dot}
            stroke={c.ring}
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#FFFFFF"
          >
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

// เส้นทางล้วนๆ แบบ Strava สำหรับการ์ดโซเชียล
export function RouteLine({
  route,
  width,
  height,
  color = "#E0642C",
}: {
  route: RoutePoint[];
  width: number;
  height: number;
  color?: string;
}) {
  if (route.length === 0) return null;
  const stroke = width / 60;
  const points = project(route, width, height, stroke * 2);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={first.x} cy={first.y} r={stroke * 1.2} fill={color} />
      <circle
        cx={last.x}
        cy={last.y}
        r={stroke * 1.2}
        fill="none"
        stroke={color}
        strokeWidth={stroke / 1.5}
      />
    </svg>
  );
}
