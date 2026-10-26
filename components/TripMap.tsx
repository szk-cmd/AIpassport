"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { dayColor, dayIndexOf } from "@/lib/route-days";
import type { RoutePoint } from "@/lib/types";

// แผนที่จริงแบบเลื่อน/ซูมได้ (Leaflet + แผนที่ฐานสไตล์เรียบของ CARTO จากข้อมูล OpenStreetMap ใช้ฟรีโดยต้องแสดงเครดิต)
// หมุดมีเลขลำดับตามเวลา เส้นทางแยกสีตามวัน
export function TripMap({
  route,
  className = "",
}: {
  route: RoutePoint[];
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current || route.length === 0) return;
    let disposed = false;
    let map: import("leaflet").Map | null = null;

    // โหลด Leaflet ตอนอยู่ในเบราว์เซอร์เท่านั้น (ใช้ window)
    import("leaflet").then((L) => {
      if (disposed || !el.current) return;
      map = L.map(el.current, {
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: true,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      const dayOf = dayIndexOf(route);
      // เส้นเชื่อมตามลำดับ สีตามวันของจุดปลายทาง
      for (let i = 1; i < route.length; i++) {
        const a = route[i - 1];
        const b = route[i];
        L.polyline(
          [
            [a.lat, a.lng],
            [b.lat, b.lng],
          ],
          { color: dayColor(dayOf(b)), weight: 3, opacity: 0.85 },
        ).addTo(map);
      }
      route.forEach((p, i) => {
        const color = dayColor(dayOf(p));
        const icon = L.divIcon({
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `<span style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;border-radius:9999px;background:${color};color:#fff;font:600 12px/1 sans-serif;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)">${i + 1}</span>`,
        });
        L.marker([p.lat, p.lng], {
          icon,
          title: p.name,
          alt: `${i + 1}. ${p.name}`,
        })
          .bindTooltip(`${i + 1}. ${escapeHtml(p.name)}`, {
            direction: "top",
            offset: [0, -14],
          })
          .addTo(map!);
      });

      const bounds = L.latLngBounds(
        route.map((p) => [p.lat, p.lng] as [number, number]),
      );
      if (route.length === 1) map.setView(bounds.getCenter(), 14);
      else map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [route]);

  if (route.length === 0) return null;
  return (
    <div
      ref={el}
      className={`relative z-0 h-72 w-full overflow-hidden rounded-control bg-surface ${className}`}
      role="region"
      aria-label="แผนที่เส้นทาง เลื่อนและซูมได้"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
