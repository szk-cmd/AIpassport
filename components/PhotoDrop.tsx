"use client";

import { useState } from "react";
import { MAX_FILE_MB } from "@/lib/config";
import { fileId, isSupported, prepareAll, type PreparedFile } from "@/lib/photo-prep";

type Props = {
  files: PreparedFile[];
  onAdd: (files: PreparedFile[]) => void;
  onClear: () => void;
};

// ช่องเดียวรับทั้งรูปเที่ยว ตั๋ว ใบเสร็จ ที่พัก เลือกเพิ่มได้หลายรอบ ไม่จำกัดจำนวน
// อ่าน EXIF + ย่อรูปในเครื่องก่อน แล้วค่อยส่งให้ฟอร์มจับกลุ่มทริป
export function PhotoDrop({ files, onAdd, onClear }: Props) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const busy = progress !== null;

  async function handleAdd(list: FileList | null) {
    const all = Array.from(list ?? []);
    const supported = all.filter(isSupported);
    const known = new Set(files.map((f) => f.id));
    const fresh = supported.filter((f) => !known.has(fileId(f)));
    if (fresh.length === 0) {
      setWarning(all.length > 0 ? "ไม่มีรูปใหม่ (อาจเลือกซ้ำ หรือเป็นไฟล์ที่ไม่รองรับ)" : null);
      return;
    }

    setWarning(null);
    setProgress({ done: 0, total: fresh.length });
    const { prepared, skipped } = await prepareAll(fresh, (done) => setProgress({ done, total: fresh.length }));
    setProgress(null);

    const messages: string[] = [];
    const unsupported = all.length - supported.length;
    if (unsupported > 0) messages.push(`ข้าม ${unsupported} ไฟล์ที่ไม่ใช่รูปหรือ PDF`);
    if (skipped > 0) messages.push(`ข้าม ${skipped} ไฟล์ที่ใหญ่เกิน ${MAX_FILE_MB}MB`);
    setWarning(messages.length > 0 ? messages.join(" · ") : null);
    onAdd(prepared);
  }

  function inputProps(folder: boolean) {
    return {
      type: "file" as const,
      multiple: true,
      accept: folder ? undefined : "image/*,application/pdf",
      disabled: busy,
      className: "sr-only",
      // เลือกทั้งโฟลเดอร์ (มือถือส่วนใหญ่จะเปิดตัวเลือกไฟล์ปกติแทน)
      ref: folder ? (el: HTMLInputElement | null) => el?.setAttribute("webkitdirectory", "") : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleAdd(e.target.files);
        e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้หลังล้าง
      },
    };
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-medium">เลือกรูปจากทริปนี้ (เลือกเยอะได้เลย)</span>
        {files.length > 0 && <span className="text-sm text-brown/60">{files.length} ไฟล์</span>}
      </div>

      <label
        className={`mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center ${
          busy ? "cursor-wait border-brown/15 bg-brown/5" : "cursor-pointer border-teal/50 bg-teal/5 hover:bg-teal/10"
        }`}
      >
        <span className="text-3xl" aria-hidden>
          📷
        </span>
        {progress ? (
          <>
            <span className="mt-1 font-medium text-teal">
              กำลังอ่านรูป {progress.done}/{progress.total}
            </span>
            <span className="mt-2 h-2 w-full max-w-60 overflow-hidden rounded-full bg-brown/10">
              <span
                className="block h-full rounded-full bg-teal transition-all"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </span>
          </>
        ) : (
          <>
            <span className="mt-1 font-medium text-teal">
              {files.length > 0 ? "แตะเพื่อเลือกเพิ่ม" : "แตะเพื่อเลือกรูป"}
            </span>
            <span className="mt-1 text-sm text-brown/60">
              ใส่ตั๋ว ใบเสร็จ ที่พัก (รูปหรือ PDF) มาในนี้ได้เลย ระบบจะแยกให้เอง
            </span>
          </>
        )}
        <input {...inputProps(false)} />
      </label>

      <label
        className={`mt-2 block text-center text-sm ${
          busy ? "cursor-wait text-brown/40" : "cursor-pointer text-teal underline hover:text-orange"
        }`}
      >
        📁 หรือเลือกทั้งโฟลเดอร์จากคอมพิวเตอร์
        <input {...inputProps(true)} />
      </label>

      {warning && <p className="mt-2 rounded-lg bg-[#FCE9C2] px-3 py-2 text-sm text-brown">⚠ {warning}</p>}

      {files.length > 0 && !busy && (
        <div className="mt-2 text-right text-sm">
          <button type="button" onClick={onClear} className="text-brown/60 underline hover:text-orange">
            ล้างทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}
