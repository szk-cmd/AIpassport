import type { RoutePoint } from "@/lib/types";

const W = 320;
const H = 240;
const PAD = 28;

// แผนที่แบบง่าย: วางจุดตามพิกัดจริงแล้วลากเส้นตามลำดับ (ยังไม่ใช้แผนที่โลกจริง)
export function RouteMap({ route }: { route: RoutePoint[] }) {
  if (route.length === 0) return null;

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // ใช้สเกลเดียวกันทั้งสองแกน แผนที่จะได้ไม่บิด
  const scale = Math.min(
    (W - PAD * 2) / (maxLng - minLng || 1),
    (H - PAD * 2) / (maxLat - minLat || 1),
  );
  const offsetX = (W - (maxLng - minLng) * scale) / 2;
  const offsetY = (H - (maxLat - minLat) * scale) / 2;

  const points = route.map((p) => ({
    ...p,
    x: offsetX + (p.lng - minLng) * scale,
    y: offsetY + (maxLat - p.lat) * scale, // ละติจูดมากอยู่ด้านบน
  }));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-teal" role="img" aria-label="แผนที่เส้นทาง">
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
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#F7F2EA"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
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
