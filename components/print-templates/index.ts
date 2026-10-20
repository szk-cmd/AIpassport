import type { TripSummary } from "@/lib/types";
import { Classic } from "./Classic";
import { Minimal } from "./Minimal";
import { Passport } from "./Passport";
import { Polaroid } from "./Polaroid";
import { aiPhotoIds, MAX_TEXT_LENGTH, type TemplateProps } from "./shared";

export { aiPhotoIds, MAX_TEXT_LENGTH, type TemplateProps };

// template กรอบรูปทั้งหมด เพิ่มแบบใหม่ที่นี่ที่เดียว
export const TEMPLATES = [
  { id: "classic", name: "คลาสสิก", Component: Classic },
  { id: "polaroid", name: "โพลารอยด์", Component: Polaroid },
  { id: "passport", name: "พาสปอร์ต", Component: Passport },
  { id: "minimal", name: "มินิมอล", Component: Minimal },
] as const satisfies readonly {
  id: string;
  name: string;
  Component: (props: TemplateProps) => React.ReactNode;
}[];

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export function getTemplate(id: string | undefined) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

// สิ่งที่ผู้ใช้เลือกในหน้าสั่งพิมพ์ ส่งต่อไปหน้า print ทาง URL (?template=&hero=&text=)
export type PrintOptions = { template: TemplateId; heroId: string; text: string };

export function defaultPrintOptions(s: TripSummary): PrintOptions {
  return { template: TEMPLATES[0].id, heroId: s.print.photo_ids[0], text: s.print.short_text };
}

// อ่านค่าจาก URL ถ้าไม่มีหรือไม่ถูกต้องใช้ค่าตั้งต้นของทริป
export function parsePrintOptions(s: TripSummary, q: Record<string, string | string[] | undefined>): PrintOptions {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const base = defaultPrintOptions(s);
  const hero = first(q.hero);
  const text = first(q.text)?.trim().slice(0, MAX_TEXT_LENGTH);
  return {
    template: getTemplate(first(q.template)).id,
    heroId: hero && aiPhotoIds(s).includes(hero) ? hero : base.heroId,
    text: text || base.text,
  };
}

export function printHref(slug: string, o: PrintOptions) {
  const q = new URLSearchParams({ template: o.template, hero: o.heroId, text: o.text });
  return `/t/${slug}/print?${q}`;
}
