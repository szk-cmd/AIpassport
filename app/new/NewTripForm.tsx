"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MOCK_TRIP } from "@/lib/mock";
import { DEFAULT_PLAN, getPlan, type PlanId } from "@/lib/plans";
import { groupByTrip, type PreparedFile, type TripGroup } from "@/lib/photo-prep";
import { PhotoDrop } from "./PhotoDrop";
import { TripGroups } from "./TripGroups";

const inputClass =
  "mt-1 w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-brown outline-none focus:border-orange";

export function NewTripForm() {
  const router = useRouter();
  // แพ็กเกจมาจากหน้า /plan ทาง URL (?plan=free) ถ้าไม่มีหรือยังไม่เปิดให้ใช้ ใช้แพ็กเกจฟรี
  const requested = getPlan((useSearchParams().get("plan") ?? DEFAULT_PLAN.id) as PlanId);
  const plan = requested.available ? requested : DEFAULT_PLAN;
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [files, setFiles] = useState<PreparedFile[]>([]);
  const [includeUndated, setIncludeUndated] = useState(false);

  const groups = useMemo(() => groupByTrip(files), [files]);
  const undated = files.filter((f) => f.kind === "image" && !f.takenAt);
  const pdfCount = files.filter((f) => f.kind === "pdf").length;
  // รูปที่ใช้ = รูปที่ถ่ายในช่วงวันเริ่ม-วันจบ (+ รูปไม่ทราบวันที่ถ้าผู้ใช้เลือก) PDF ใช้ทั้งหมด
  const inRange = files.filter((f) => f.takenAt && f.takenAt >= startDate && f.takenAt <= endDate).length;
  const outOfRange = files.length - pdfCount - undated.length - inRange;
  const usedPhotos = inRange + (includeUndated ? undated.length : 0);

  const dateError = startDate && endDate && endDate < startDate;
  const canSubmit = title.trim() !== "" && startDate !== "" && endDate !== "" && !dateError;
  // บอกผู้ใช้ว่ายังขาดอะไร ปุ่มจะได้ไม่จางเฉยๆ
  const missing = [
    title.trim() === "" && "ชื่อทริป",
    (startDate === "" || endDate === "") &&
      (groups.length > 0 ? "วันที่ (กด “ใช่ ทริปนี้” บนการ์ด หรือกรอกเอง)" : "วันเริ่ม-วันจบ"),
  ].filter(Boolean);

  function handleAdd(added: PreparedFile[]) {
    setFiles((prev) => [...prev, ...added]);
  }

  function handleClear() {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setIncludeUndated(false);
  }

  function pickGroup(g: TripGroup) {
    setStartDate(g.start);
    setEndDate(g.end);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    // MOCK: ยังไม่อัปโหลดจริง (สัปดาห์ 2 จะส่ง blob ที่ย่อแล้ว + takenAt/lat/lng) ไปหน้ายืนยันของทริปตัวอย่างเลย
    router.push(`/trip/${MOCK_TRIP.id}/confirm`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* ---------- แพ็กเกจที่เลือกไว้ ---------- */}
      <div className="flex items-center justify-between rounded-2xl border border-cream/20 px-4 py-3">
        <div>
          <p className="text-xs text-cream/60">แพ็กเกจ</p>
          <p className="font-heading font-semibold">
            {plan.name} <span className="text-gold">· AI คัดเข้าเล่ม {plan.maxPhotos} รูป</span>
          </p>
        </div>
        <Link href="/plan" className="text-sm text-cream/70 underline hover:text-cream">
          เปลี่ยน
        </Link>
      </div>

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


        <PhotoDrop files={files} onAdd={handleAdd} onClear={handleClear} />

        <TripGroups
          groups={groups}
          undated={undated}
          startDate={startDate}
          endDate={endDate}
          includeUndated={includeUndated}
          onPick={pickGroup}
          onToggleUndated={setIncludeUndated}
        />

        <div>
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
          {groups.length > 0 && <p className="mt-1 text-xs text-brown/60">เติมให้จากทริปที่เลือก แก้เองได้</p>}
        </div>
        {dateError && <p className="text-sm text-orange">วันจบต้องไม่อยู่ก่อนวันเริ่ม</p>}

        {files.length > 0 && (
          <p className="rounded-lg bg-teal/10 px-3 py-2 text-sm text-teal">
            จะใช้ {usedPhotos} รูป{pdfCount > 0 && ` + ${pdfCount} เอกสาร PDF`}
            {outOfRange > 0 && startDate && endDate && (
              <span className="text-brown/60"> · ข้าม {outOfRange} รูปที่อยู่นอกช่วงวันที่</span>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream transition disabled:opacity-40"
        >
          สร้างหนังสือเดินทาง
        </button>
        {missing.length > 0 && <p className="text-center text-sm text-orange">ยังขาด: {missing.join(" · ")}</p>}
        <p className="text-center text-xs text-brown/50">
          โหมดตัวอย่าง: ระบบจะใช้ข้อมูลทริปเชียงใหม่แทนไฟล์ที่เลือก
        </p>
      </section>
    </form>
  );
}
