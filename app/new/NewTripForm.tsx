"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOCK_TRIP } from "@/lib/mock";
import { DEFAULT_PLAN, getPlan, type PlanId } from "@/lib/plans";
import { FilePicker, type PickedFile } from "./FilePicker";
import { PlanPicker } from "./PlanPicker";

const inputClass =
  "mt-1 w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-brown outline-none focus:border-orange";

export function NewTripForm() {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN.id);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [photos, setPhotos] = useState<PickedFile[]>([]);
  const [docs, setDocs] = useState<PickedFile[]>([]);

  const plan = getPlan(planId);
  const dateError = startDate && endDate && endDate < startDate;
  const canSubmit = title.trim() !== "" && startDate !== "" && endDate !== "" && !dateError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    // MOCK: ยังไม่อัปโหลดจริง ไปหน้ายืนยันของทริปตัวอย่างเลย
    router.push(`/trip/${MOCK_TRIP.id}/confirm`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* ---------- แพ็กเกจ ---------- */}
      <section className="rounded-2xl bg-cream p-5 text-brown">
        <h2 className="text-lg font-semibold">เลือกแพ็กเกจ</h2>
        <p className="mb-3 text-sm text-brown/60">ช่วงทดลองเปิดให้ใช้แพ็กเกจฟรีก่อน</p>
        <PlanPicker value={planId} onChange={setPlanId} />
      </section>

      {/* ---------- ข้อมูลทริป + ไฟล์ ---------- */}
      <section className="space-y-5 rounded-2xl bg-cream p-5 text-brown">
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

        <FilePicker
          title="รูปเที่ยว"
          hint="เลือกได้หลายรูปพร้อมกัน"
          icon="📷"
          accept="image/*"
          unit="รูป"
          max={plan.maxPhotos}
          files={photos}
          onChange={setPhotos}
        />

        <FilePicker
          title="ตั๋ว ใบเสร็จ ที่พัก"
          hint="รูปถ่ายหรือไฟล์ PDF"
          icon="🧾"
          accept="image/*,application/pdf"
          unit="ไฟล์"
          max={plan.maxDocs}
          files={docs}
          onChange={setDocs}
        />

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
      </section>
    </form>
  );
}
