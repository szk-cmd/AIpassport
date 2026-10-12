"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOCK_TRIP } from "@/lib/mock";

type Preview = { name: string; url: string | null };

const inputClass =
  "mt-1 w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-brown outline-none focus:border-orange";

export function NewTripForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);

  const dateError = startDate && endDate && endDate < startDate;
  const canSubmit = title.trim() !== "" && startDate !== "" && endDate !== "" && !dateError;

  function handleFiles(fileList: FileList | null) {
    // คืนหน่วยความจำของรูปตัวอย่างชุดเก่า
    previews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    const files = Array.from(fileList ?? []);
    setPreviews(
      files.map((f) => ({
        name: f.name,
        url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      })),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    // MOCK: ยังไม่อัปโหลดจริง ไปหน้ายืนยันของทริปตัวอย่างเลย
    router.push(`/trip/${MOCK_TRIP.id}/confirm`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl bg-cream p-5 text-brown">
      <label className="block">
        <span className="font-medium">ชื่อทริป</span>
        <input
          className={inputClass}
          placeholder="เช่น เชียงใหม่ 3 วัน"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="font-medium">วันเริ่ม</span>
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="font-medium">วันจบ</span>
          <input
            type="date"
            className={inputClass}
            min={startDate || undefined}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
      {dateError && <p className="text-sm text-orange">วันจบต้องไม่อยู่ก่อนวันเริ่ม</p>}

      <div>
        <span className="font-medium">รูป ตั๋ว และใบเสร็จ</span>
        <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal/50 bg-teal/5 px-4 py-8 text-center hover:bg-teal/10">
          <span className="text-3xl" aria-hidden>
            📷
          </span>
          <span className="mt-2 font-medium text-teal">แตะเพื่อเลือกไฟล์จากมือถือ</span>
          <span className="mt-1 text-sm text-brown/60">เลือกได้หลายไฟล์พร้อมกัน</span>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {previews.length > 0 && (
          <>
            <p className="mt-3 text-sm text-brown/70">เลือกแล้ว {previews.length} ไฟล์</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {previews.slice(0, 12).map((p, i) =>
                p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- รูปตัวอย่างจากเครื่องผู้ใช้
                  <img
                    key={i}
                    src={p.url}
                    alt={p.name}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ) : (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg bg-brown/10 p-1 text-center text-xs break-all"
                  >
                    {p.name}
                  </div>
                ),
              )}
            </div>
            {previews.length > 12 && (
              <p className="mt-2 text-sm text-brown/60">และอีก {previews.length - 12} ไฟล์</p>
            )}
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream transition disabled:opacity-40"
      >
        สร้างหนังสือเดินทาง
      </button>
      <p className="text-center text-xs text-brown/50">
        โหมดตัวอย่าง: ระบบจะใช้ข้อมูลทริปเชียงใหม่แทนไฟล์ที่เลือก
      </p>
    </form>
  );
}
