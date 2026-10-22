"use client";

import { ArrowLeft, Check, Clock, Download, Star } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { Button, ButtonLink, Card, Chip, cx, ICON, TextArea } from "@/components/ui";
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

  // การ์ดตัวเลือก (ขนาด/สีกรอบ): พื้นขาว เงาเบา ที่เลือกอยู่มีวงสีแบรนด์
  const optionClass = (on: boolean) =>
    cx(
      "rounded-control bg-card p-3 text-left shadow-soft ring-2 transition",
      on ? "ring-brand" : "ring-transparent hover:ring-line",
    );

  if (step === 1) {
    return (
      <div className="mt-8 space-y-8">
        <p className="text-label text-ink-muted">ขั้นที่ 1 จาก 2 · เลือกแบบ</p>

        {/* แถบตัวอย่างทุกแบบ ใช้ข้อมูลทริปจริง เลื่อนแนวนอน */}
        <div className="-mx-4 -mt-4 flex snap-x gap-4 overflow-x-auto px-4 pt-1 pb-2">
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
                  className={cx(
                    "pointer-events-none overflow-hidden rounded-control shadow-soft ring-2 ring-offset-2 ring-offset-canvas",
                    on ? "ring-brand" : "ring-transparent",
                  )}
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
                <span className={cx("mt-2 block text-label", on ? "font-semibold text-brand" : "text-ink-muted")}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto w-full overflow-hidden rounded-control shadow-soft">{preview}</div>

        <Card className="space-y-8">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-sans text-body font-semibold">รูปในกรอบ</h2>
              <span className={cx("text-label", enoughPhotos ? "text-ink-muted" : "font-semibold text-warning")}>
                {options.photoIds.length}/{max} รูป
              </span>
            </div>
            <p className="mt-1 text-caption text-ink-muted">
              {max === 1
                ? "แบบนี้ใช้รูปเดียว แตะเพื่อเปลี่ยนรูป"
                : `แตะเพื่อเลือก/เอาออก (อย่างน้อย ${min} รูป) · รูปหมายเลข 1 = รูปใหญ่ กดดาวเพื่อเปลี่ยนรูปใหญ่`}
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2">
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
                      className={cx(
                        "block w-full overflow-hidden rounded-control ring-2 ring-offset-2 ring-offset-card",
                        on ? "ring-brand" : "ring-transparent",
                        !on && (full ? "opacity-30" : "opacity-60 hover:opacity-100"),
                      )}
                    >
                      <Photo photo={photo} hidePlace className="aspect-square" />
                    </button>
                    {on && max > 1 && (
                      <span className="pointer-events-none absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-brand text-caption font-semibold text-white">
                        {order + 1}
                      </span>
                    )}
                    {on && order > 0 && (
                      <button
                        type="button"
                        onClick={() => makeHero(id)}
                        className="absolute bottom-1 left-1 flex size-6 items-center justify-center rounded-full bg-ink/60 text-white"
                        aria-label={`ใช้ ${photo.data.caption} เป็นรูปใหญ่`}
                      >
                        <Star size={12} strokeWidth={1.75} aria-hidden />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {!enoughPhotos && <p className="mt-2 text-label text-warning">แบบนี้ต้องมีอย่างน้อย {min} รูป</p>}
          </div>

          <div>
            <h2 className="font-sans text-body font-semibold">ข้อมูลที่แสดง</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.info.map((key) => {
                const on = !options.hidden.includes(key);
                return (
                  <Chip key={key} selected={on} icon={on ? Check : undefined} onClick={() => toggleInfo(key)}>
                    {INFO_LABELS[key]}
                  </Chip>
                );
              })}
            </div>
          </div>

          <div className={cx(options.hidden.includes("text") && "opacity-50")}>
            <TextArea
              label="ข้อความบนกรอบรูป"
              rows={3}
              maxLength={MAX_TEXT_LENGTH}
              value={options.text}
              onChange={(e) => update({ text: e.target.value })}
              hint={`${options.text.length}/${MAX_TEXT_LENGTH} · สั้นๆ 2-3 บรรทัด อ่านง่าย`}
            />
          </div>
        </Card>

        <div className="space-y-2">
          <Button block onClick={() => setStep(2)} disabled={!enoughPhotos}>
            ถัดไป เลือกขนาดและกรอบ
          </Button>
          <ButtonLink href={printHref(slug, options)} block variant="ghost" icon={Download}>
            ดาวน์โหลด PDF ไปพิมพ์เอง
          </ButtonLink>
          <SkipLink slug={slug} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-label text-ink-muted">ขั้นที่ 2 จาก 2 · ขนาดและกรอบ</p>
        <Button size="sm" variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>
          เปลี่ยนแบบ
        </Button>
      </div>

      {/* ตัวอย่างกรอบรูป: template ที่เลือกในขั้น 1 ใส่กรอบตามสีที่เลือก */}
      <div className="mx-auto w-4/5 p-[5%] shadow-soft" style={{ background: frame.color }}>
        <div className="shadow-inner">{preview}</div>
      </div>

      <section>
        <h2 className="font-sans text-body font-semibold">ขนาด</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {SIZES.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setSizeId(x.id)}
              aria-pressed={x.id === sizeId}
              className={optionClass(x.id === sizeId)}
            >
              <span className="block text-body font-semibold">{x.label}</span>
              <span className="block text-caption text-ink-muted">{x.note}</span>
              <span className="mt-2 block text-label font-semibold">{x.price}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-sans text-body font-semibold">สีกรอบ</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {FRAMES.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setFrameId(x.id)}
              aria-pressed={x.id === frameId}
              className={cx(optionClass(x.id === frameId), "flex flex-col items-center")}
            >
              <span className="size-8 rounded-full shadow-soft ring-1 ring-line" style={{ background: x.color }} />
              <span className="mt-2 text-label">{x.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-baseline justify-between">
        <span className="text-label text-ink-muted">
          แบบ{template.name} · {size.label} · กรอบ{frame.label}
        </span>
        <span className="text-title font-semibold">{size.price}</span>
      </div>

      <div className="space-y-2">
        <Button block onClick={() => setComingSoon(true)}>
          สั่งพิมพ์
        </Button>
        {comingSoon && (
          <p className="flex items-center justify-center gap-2 rounded-control bg-warning/10 px-4 py-3 text-label text-warning">
            <Clock {...ICON} size={16} />
            ฟีเจอร์นี้เปิดให้บริการเร็วๆ นี้
          </p>
        )}
        <ButtonLink href={printHref(slug, options)} block variant="secondary" icon={Download}>
          ดาวน์โหลด PDF ไปพิมพ์เอง
        </ButtonLink>
        <SkipLink slug={slug} />
      </div>
    </div>
  );
}

function SkipLink({ slug }: { slug: string }) {
  return (
    <ButtonLink href={`/t/${slug}`} block variant="ghost">
      ข้ามไปก่อน กลับไปดูพาสปอร์ต
    </ButtonLink>
  );
}
