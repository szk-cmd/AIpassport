"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import {
  aiPhotoIds,
  defaultPrintOptions,
  fitPhotos,
  getTemplate,
  INFO_LABELS,
  MAX_TEXT_LENGTH,
  printHref,
  TEMPLATES,
  type InfoKey,
  type PrintOptions,
  type TemplateId,
} from "@/components/print-templates";
import { getPhoto } from "@/lib/mock";
import type { TripSummary } from "@/lib/types";

// ราคายังไม่ได้ตั้ง ใส่ [฿__] ไว้ก่อน
const SIZES = [
  { id: "a4", label: "A4", note: "21 × 29.7 ซม.", price: "[฿__]" },
  { id: "8x10", label: "8 × 10 นิ้ว", note: "20 × 25 ซม.", price: "[฿__]" },
] as const;

const FRAMES = [
  { id: "wood", label: "ไม้ธรรมชาติ", color: "linear-gradient(135deg, #C9965F, #9A6B3E 60%, #B88552)" },
  { id: "black", label: "ดำ", color: "#1C1714" },
  { id: "white", label: "ขาว", color: "#FDFBF7" },
] as const;

type Props = { s: TripSummary; slug: string };

// ขั้น 1 เลือก template + รูปในกรอบ + ข้อมูลที่แสดง + ข้อความ → ขั้น 2 เลือกขนาด/กรอบ ยังไม่มีระบบจ่ายเงิน
export function OrderForm({ s, slug }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [options, setOptions] = useState<PrintOptions>(() => defaultPrintOptions(s));
  const [sizeId, setSizeId] = useState<(typeof SIZES)[number]["id"]>("a4");
  const [frameId, setFrameId] = useState<(typeof FRAMES)[number]["id"]>("wood");
  const [comingSoon, setComingSoon] = useState(false);
  const size = SIZES.find((x) => x.id === sizeId)!;
  const frame = FRAMES.find((x) => x.id === frameId)!;
  const template = getTemplate(options.template);
  const update = (change: Partial<PrintOptions>) => setOptions((o) => ({ ...o, ...change }));
  const { min, max } = template.photos;
  const enoughPhotos = options.photoIds.length >= min;

  // เปลี่ยนแบบ: เก็บรูปที่เลือกไว้เท่าที่แบบใหม่รับได้ ขาดก็เติมจากรูปที่ AI คัด
  function chooseTemplate(id: TemplateId) {
    update({ template: id, photoIds: fitPhotos(s, id, options.photoIds) });
  }

  // แตะรูป: ยังไม่เลือก → เพิ่มต่อท้าย, เลือกแล้ว → เอาออก, แบบรูปเดียว → เปลี่ยนรูปเลย
  function togglePhoto(id: string) {
    const ids = options.photoIds;
    if (max === 1) return update({ photoIds: [id] });
    if (ids.includes(id)) return update({ photoIds: ids.filter((x) => x !== id) });
    if (ids.length < max) update({ photoIds: [...ids, id] });
  }

  function makeHero(id: string) {
    update({ photoIds: [id, ...options.photoIds.filter((x) => x !== id)] });
  }

  function toggleInfo(key: InfoKey) {
    const hidden = options.hidden.includes(key) ? options.hidden.filter((k) => k !== key) : [...options.hidden, key];
    update({ hidden });
  }

  const preview = (
    <template.Component
      s={s}
      slug={slug}
      text={options.text}
      photoIds={options.photoIds}
      hidden={options.hidden}
    />
  );

  const optionClass = (on: boolean) =>
    `rounded-xl border-2 px-3 py-2 text-left transition ${
      on ? "border-orange bg-orange/10" : "border-brown/15 bg-white hover:border-orange/50"
    }`;

  if (step === 1) {
    return (
      <div className="mt-6 space-y-5">
        <p className="font-heading text-sm tracking-widest text-gold">ขั้นที่ 1 จาก 2 · เลือกแบบ</p>

        {/* แถบตัวอย่างทุกแบบ ใช้ข้อมูลทริปจริง เลื่อนแนวนอน */}
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {TEMPLATES.map((t) => {
            const on = t.id === options.template;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => chooseTemplate(t.id)}
                aria-pressed={on}
                className="w-24 shrink-0 snap-start text-center"
              >
                <div
                  className={`pointer-events-none overflow-hidden rounded-md ring-offset-2 ring-offset-brown ${
                    on ? "ring-3 ring-orange" : "opacity-75"
                  }`}
                  aria-hidden
                >
                  <t.Component
                    s={s}
                    slug={slug}
                    text={options.text}
                    photoIds={fitPhotos(s, t.id, options.photoIds)}
                    hidden={options.hidden}
                  />
                </div>
                <span className={`mt-2 block text-sm ${on ? "font-semibold text-orange" : "text-cream/70"}`}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto w-full shadow-2xl">{preview}</div>

        <section className="space-y-5 rounded-2xl bg-cream p-5 text-brown">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="font-medium">รูปในกรอบ</p>
              <span className={`text-sm ${enoughPhotos ? "text-brown/60" : "font-semibold text-orange"}`}>
                {options.photoIds.length}/{max} รูป
              </span>
            </div>
            <p className="text-xs text-brown/60">
              {max === 1
                ? "แบบนี้ใช้รูปเดียว แตะเพื่อเปลี่ยนรูป"
                : `แตะเพื่อเลือก/เอาออก (อย่างน้อย ${min} รูป) · รูปหมายเลข 1 = รูปใหญ่ กด ★ เพื่อเปลี่ยนรูปใหญ่`}
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {aiPhotoIds(s).map((id) => {
                const photo = getPhoto(id);
                if (!photo) return null;
                const order = options.photoIds.indexOf(id);
                const on = order !== -1;
                const full = !on && max > 1 && options.photoIds.length >= max;
                return (
                  <div key={id} className="relative">
                    <button
                      type="button"
                      onClick={() => togglePhoto(id)}
                      disabled={full}
                      aria-pressed={on}
                      aria-label={photo.data.caption}
                      className={`block w-full overflow-hidden rounded-md ${
                        on ? "ring-3 ring-orange" : full ? "opacity-30" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Photo photo={photo} hidePlace className="aspect-square" />
                    </button>
                    {on && max > 1 && (
                      <span className="pointer-events-none absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-orange text-xs font-bold text-cream">
                        {order + 1}
                      </span>
                    )}
                    {on && order > 0 && (
                      <button
                        type="button"
                        onClick={() => makeHero(id)}
                        className="absolute bottom-1 left-1 rounded-full bg-black/55 px-1.5 text-xs text-cream"
                        aria-label={`ใช้ ${photo.data.caption} เป็นรูปใหญ่`}
                      >
                        ★
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {!enoughPhotos && <p className="mt-2 text-sm text-orange">แบบนี้ต้องมีอย่างน้อย {min} รูป</p>}
          </div>

          <div>
            <p className="font-medium">ข้อมูลที่แสดง</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {template.info.map((key) => {
                const on = !options.hidden.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInfo(key)}
                    aria-pressed={on}
                    className={`rounded-full border-2 px-3 py-1.5 text-sm transition ${
                      on ? "border-teal bg-teal text-cream" : "border-brown/20 bg-white text-brown/50 line-through"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {INFO_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className={`block ${options.hidden.includes("text") ? "opacity-50" : ""}`}>
            <span className="font-medium">ข้อความบนกรอบรูป</span>
            <textarea
              rows={3}
              maxLength={MAX_TEXT_LENGTH}
              value={options.text}
              onChange={(e) => update({ text: e.target.value })}
              className="mt-1 w-full rounded-xl border border-brown/20 bg-white px-4 py-3 leading-relaxed outline-none focus:border-orange"
            />
            <span className="block text-right text-xs text-brown/50">
              {options.text.length}/{MAX_TEXT_LENGTH} · สั้นๆ 2-3 บรรทัด อ่านง่าย
            </span>
          </label>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!enoughPhotos}
            className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream disabled:opacity-40"
          >
            ถัดไป เลือกขนาดและกรอบ
          </button>
          <Link
            href={printHref(slug, options)}
            className="block text-center text-sm text-brown/60 underline hover:text-orange"
          >
            ⬇ ดาวน์โหลด PDF ไปพิมพ์เอง
          </Link>
        </section>

        <SkipLink slug={slug} />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <p className="font-heading text-sm tracking-widest text-gold">ขั้นที่ 2 จาก 2 · ขนาดและกรอบ</p>
        <button type="button" onClick={() => setStep(1)} className="text-sm text-cream/70 underline hover:text-cream">
          ← เปลี่ยนแบบ
        </button>
      </div>

      {/* ตัวอย่างกรอบรูป: template ที่เลือกในขั้น 1 ใส่กรอบตามสีที่เลือก */}
      <div className="mx-auto w-4/5 p-[5%] shadow-2xl" style={{ background: frame.color }}>
        <div className="shadow-inner">{preview}</div>
      </div>

      <section className="space-y-5 rounded-2xl bg-cream p-5 text-brown">
        <div>
          <p className="font-medium">ขนาด</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SIZES.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setSizeId(x.id)}
                aria-pressed={x.id === sizeId}
                className={optionClass(x.id === sizeId)}
              >
                <span className="block font-heading font-semibold">{x.label}</span>
                <span className="block text-xs text-brown/60">{x.note}</span>
                <span className="mt-1 block text-sm font-semibold text-orange">{x.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-medium">สีกรอบ</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FRAMES.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setFrameId(x.id)}
                aria-pressed={x.id === frameId}
                className={`${optionClass(x.id === frameId)} flex flex-col items-center`}
              >
                <span className="size-8 rounded-full border border-brown/20" style={{ background: x.color }} />
                <span className="mt-1 text-sm">{x.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-brown/15 pt-3">
          <span className="text-sm text-brown/70">
            แบบ{template.name} · {size.label} · กรอบ{frame.label}
          </span>
          <span className="font-heading text-2xl font-semibold text-orange">{size.price}</span>
        </div>

        <button
          type="button"
          onClick={() => setComingSoon(true)}
          className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
        >
          สั่งพิมพ์
        </button>
        {comingSoon && (
          <p className="rounded-lg bg-[#FCE9C2] px-3 py-2 text-center text-sm">ฟีเจอร์นี้เปิดให้บริการเร็วๆ นี้</p>
        )}

        <Link
          href={printHref(slug, options)}
          className="block w-full rounded-full border-2 border-brown/20 py-3 text-center font-heading font-semibold hover:bg-brown/5"
        >
          ⬇ ดาวน์โหลด PDF ไปพิมพ์เอง
        </Link>
      </section>

      <SkipLink slug={slug} />
    </div>
  );
}

function SkipLink({ slug }: { slug: string }) {
  return (
    <Link href={`/t/${slug}`} className="block text-center text-sm text-cream/70 underline hover:text-cream">
      ข้ามไปก่อน กลับไปดูพาสปอร์ต
    </Link>
  );
}
