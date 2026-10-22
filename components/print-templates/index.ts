import type { TripSummary } from "@/lib/types";
import { Classic } from "./Classic";
import { Minimal } from "./Minimal";
import { Passport } from "./Passport";
import { Polaroid } from "./Polaroid";
import { aiPhotoIds, INFO_LABELS, MAX_TEXT_LENGTH, type InfoKey, type TemplateProps } from "./shared";

export { aiPhotoIds, INFO_LABELS, MAX_TEXT_LENGTH, type InfoKey, type TemplateProps };

// template กรอบรูปทั้งหมด เพิ่มแบบใหม่ที่นี่ที่เดียว
// photos = จำนวนรูปที่เลือกได้ (รูปแรก = รูปใหญ่), info = ข้อมูลที่ผู้ใช้เปิด/ปิดได้
export const TEMPLATES = [
  {
    id: "classic",
    name: "คลาสสิก",
    Component: Classic,
    photos: { min: 1, max: 5 },
    info: ["date", "text", "qr"],
  },
  {
    id: "polaroid",
    name: "โพลารอยด์",
    Component: Polaroid,
    photos: { min: 4, max: 6 },
    info: ["date", "captions", "text", "qr"],
  },
  {
    id: "passport",
    name: "พาสปอร์ต",
    Component: Passport,
    photos: { min: 1, max: 1 },
    info: ["date", "stats", "text", "stamps", "qr"],
  },
  {
    id: "minimal",
    name: "มินิมอล",
    Component: Minimal,
    photos: { min: 1, max: 1 },
    info: ["date", "text", "qr"],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  Component: (props: TemplateProps) => React.ReactNode;
  photos: { min: number; max: number };
  info: readonly InfoKey[];
}[];

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export function getTemplate(id: string | undefined) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

// สิ่งที่ผู้ใช้เลือกในหน้าสั่งพิมพ์ ส่งต่อไปหน้า print ทาง URL (?template=&photos=&text=&hide=)
export type PrintOptions = { template: TemplateId; photoIds: string[]; text: string; hidden: InfoKey[] };

// ปรับรายการรูปให้พอดีกับ template: เกินตัดท้าย, ขาดเติมจากรูปที่ AI คัดไว้
export function fitPhotos(s: TripSummary, template: TemplateId, photoIds: string[]) {
  const { min, max } = getTemplate(template).photos;
  const valid = aiPhotoIds(s);
  const picked = [...new Set(photoIds)].filter((id) => valid.includes(id)).slice(0, max);
  const extra = valid.filter((id) => !picked.includes(id));
  return [...picked, ...extra.slice(0, Math.max(0, min - picked.length))];
}

export function defaultPrintOptions(s: TripSummary): PrintOptions {
  const template = TEMPLATES[0];
  return {
    template: template.id,
    photoIds: aiPhotoIds(s).slice(0, template.photos.max),
    text: s.print.short_text,
    hidden: [],
  };
}

// อ่านค่าจาก URL ถ้าไม่มีหรือไม่ถูกต้องใช้ค่าตั้งต้นของทริป
export function parsePrintOptions(s: TripSummary, q: Record<string, string | string[] | undefined>): PrintOptions {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const list = (v: string | string[] | undefined) => first(v)?.split(",").filter(Boolean) ?? [];
  const base = defaultPrintOptions(s);
  const template = getTemplate(first(q.template)).id;
  const photos = list(q.photos);
  const text = first(q.text)?.trim().slice(0, MAX_TEXT_LENGTH);
  return {
    template,
    photoIds: fitPhotos(s, template, photos.length > 0 ? photos : base.photoIds),
    text: text || base.text,
    hidden: list(q.hide).filter((k): k is InfoKey => k in INFO_LABELS),
  };
}

export function printHref(slug: string, o: PrintOptions) {
  const q = new URLSearchParams({ template: o.template, photos: o.photoIds.join(","), text: o.text });
  if (o.hidden.length > 0) q.set("hide", o.hidden.join(","));
  return `/t/${slug}/print?${q}`;
}
