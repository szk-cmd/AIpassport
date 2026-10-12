"use client";

import { useState } from "react";
import { MAX_FILE_MB } from "@/lib/plans";

export type PickedFile = { file: File; url: string | null };

type Props = {
  title: string;
  hint: string;
  icon: string;
  accept: string;
  unit: string; // "รูป" หรือ "ไฟล์"
  max: number;
  files: PickedFile[];
  onChange: (files: PickedFile[]) => void;
};

const MAX_BYTES = MAX_FILE_MB * 1024 * 1024;

// ช่องเลือกไฟล์ที่เลือกเพิ่มได้หลายรอบ มีตัวนับและเพดานตามแพ็กเกจ
export function FilePicker({ title, hint, icon, accept, unit, max, files, onChange }: Props) {
  const [warning, setWarning] = useState<string | null>(null);

  function handleAdd(list: FileList | null) {
    const incoming = Array.from(list ?? []);
    const messages: string[] = [];

    const tooBig = incoming.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length > 0) messages.push(`ข้าม ${tooBig.length} ไฟล์ที่ใหญ่เกิน ${MAX_FILE_MB}MB`);

    // ไม่รับไฟล์ซ้ำ (ชื่อและขนาดเท่ากัน)
    const isDuplicate = (f: File) => files.some((p) => p.file.name === f.name && p.file.size === f.size);
    const fresh = incoming.filter((f) => f.size <= MAX_BYTES && !isDuplicate(f));

    const room = max - files.length;
    if (fresh.length > room) {
      messages.push(`แพ็กเกจนี้ใส่ได้สูงสุด ${max} ${unit} ระบบเก็บไว้ ${Math.max(room, 0)} ${unit}แรก`);
    }

    const added = fresh.slice(0, Math.max(room, 0)).map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setWarning(messages.length > 0 ? messages.join(" · ") : null);
    onChange([...files, ...added]);
  }

  function handleClear() {
    files.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    setWarning(null);
    onChange([]);
  }

  const full = files.length >= max;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{title}</span>
        <span className={`text-sm ${full ? "font-semibold text-orange" : "text-brown/60"}`}>
          {files.length} / {max} {unit}
        </span>
      </div>

      <label
        className={`mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center ${
          full
            ? "cursor-not-allowed border-brown/15 bg-brown/5 text-brown/40"
            : "cursor-pointer border-teal/50 bg-teal/5 hover:bg-teal/10"
        }`}
      >
        <span className="text-3xl" aria-hidden>
          {icon}
        </span>
        <span className={`mt-1 font-medium ${full ? "" : "text-teal"}`}>
          {full ? `ครบ ${max} ${unit}แล้ว` : files.length > 0 ? "แตะเพื่อเลือกเพิ่ม" : "แตะเพื่อเลือกจากมือถือ"}
        </span>
        <span className="mt-1 text-sm text-brown/60">{hint}</span>
        <input
          type="file"
          multiple
          accept={accept}
          disabled={full}
          className="sr-only"
          onChange={(e) => {
            handleAdd(e.target.files);
            e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้หลังล้าง
          }}
        />
      </label>

      {warning && <p className="mt-2 rounded-lg bg-[#FCE9C2] px-3 py-2 text-sm text-brown">⚠ {warning}</p>}

      {files.length > 0 && (
        <>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {files.slice(0, 10).map((p, i) =>
              p.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- รูปตัวอย่างจากเครื่องผู้ใช้
                <img key={i} src={p.url} alt={p.file.name} className="aspect-square w-full rounded-md object-cover" />
              ) : (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-md bg-brown/10 p-1 text-center text-[10px] break-all"
                >
                  {p.file.name}
                </div>
              ),
            )}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-brown/60">{files.length > 10 ? `และอีก ${files.length - 10} ${unit}` : ""}</span>
            <button type="button" onClick={handleClear} className="text-brown/60 underline hover:text-orange">
              ล้างทั้งหมด
            </button>
          </div>
        </>
      )}
    </div>
  );
}
