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

// แผนที่แบบง่าย: วางจุดตามพิกัดจริงแล้วลากเส้นตามลำดับ (ยังไม่ใช้แผนที่โลกจริง)
export function RouteMap({ route }: { route: RoutePoint[] }) {
  if (route.length === 0) return null;

  return (
    <div>
      <RouteMapImage route={route} className="w-full rounded-2xl" />
      <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {route.map((p, i) => (
          <li key={p.name} className="flex gap-2">
            <span className="font-heading text-orange">{i + 1}</span>
            {p.name}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ภาพแผนที่อย่างเดียว (ไม่มีรายชื่อสถานที่) ใช้ในหน้าทริปและกรอบรูปสำหรับพิมพ์
export function RouteMapImage({ route, className = "" }: { route: RoutePoint[]; className?: string }) {
  const points = project(route, W, H, 28);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`bg-teal ${className}`} role="img" aria-label="แผนที่เส้นทาง">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F7F2EA" strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#grid)" />
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#E8A93C"
        strokeWidth="2.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r="10" fill="#E0642C" stroke="#F7F2EA" strokeWidth="2" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#F7F2EA">
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={first.x} cy={first.y} r={stroke * 1.2} fill={color} />
      <circle cx={last.x} cy={last.y} r={stroke * 1.2} fill="none" stroke={color} strokeWidth={stroke / 1.5} />
    </svg>
  );
}
