"use client";

import { Check, ImagePlus, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, cx, DateField, ICON, Input } from "@/components/ui";
import { packagePrice } from "@/lib/config";
import { formatBaht } from "@/lib/format";
import {
  groupByTrip,
  isSupported,
  prepareAll,
  type PreparedFile,
  type TripGroup,
} from "@/lib/photo-prep";
import {
  addItems,
  createTrip,
  dayCount,
  newId,
  todayKey,
} from "@/lib/trip-store";
import { uploadTripFile } from "@/lib/upload";

const MAX_FILES = 300; // ต่อครั้ง (เตรียมรูปในมือถือ ไม่ให้ค้าง)
const UPLOAD_CONCURRENCY = 3;

// สรุปทริปย้อนหลัง: เลือกรูปจากทริปที่ไปมาแล้ว → ระบบอ่านวันที่ในรูปแล้วเสนอช่วงวันให้
// → สร้างทริป อัปโหลดรูป แล้วไปเล่าทีละวันในแชท (ไม่ต้องมีรูปก็ได้ ตั้งวันเองได้)
export function PastTripForm() {
  const router = useRouter();
  const today = todayKey();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [files, setFiles] = useState<PreparedFile[]>([]);
  const [groups, setGroups] = useState<TripGroup[]>([]);
  const [groupIndex, setGroupIndex] = useState<number | null>(null);
  const [includeUndated, setIncludeUndated] = useState(true);
  const [reading, setReading] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [uploading, setUploading] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const undated = files.filter((f) => !f.takenAt);
  const chosen = [
    ...(groupIndex !== null ? groups[groupIndex].files : []),
    ...(includeUndated || groups.length === 0 ? undated : []),
  ];
  const dateError =
    startDate && endDate && endDate < startDate
      ? "วันจบต้องไม่อยู่ก่อนวันเริ่ม"
      : endDate && endDate >= today
        ? "ทริปย้อนหลังต้องจบก่อนวันนี้ (ถ้ายังเที่ยวอยู่ เลือก “กำลังจะไป / กำลังเที่ยว”)"
        : null;
  const days =
    startDate && endDate && !dateError ? dayCount(startDate, endDate) : null;
  const busy = reading !== null || uploading !== null;
  const canSubmit = title.trim() !== "" && days !== null && !busy;

  function chooseGroup(i: number, list = groups) {
    setGroupIndex(i);
    setStartDate(list[i].start);
    setEndDate(list[i].end);
  }

  async function handlePick(list: FileList | null) {
    const picked = Array.from(list ?? [])
      .filter(isSupported)
      .slice(0, MAX_FILES);
    if (picked.length === 0) return;
    setError(null);
    setReading({ done: 0, total: picked.length });
    // อ่าน EXIF + ย่อรูปในเครื่อง (ยังไม่อัปโหลดจนกว่าจะกดสร้างทริป)
    const { prepared } = await prepareAll(picked, (done) =>
      setReading({ done, total: picked.length }),
    );
    setReading(null);
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    const found = groupByTrip(prepared).filter((g) => g.end < today);
    setFiles(prepared);
    setGroups(found);
    if (found.length > 0) {
      // เสนอกลุ่มที่มีรูปมากที่สุดก่อน
      const biggest = found.reduce(
        (best, g, i) => (g.files.length > found[best].files.length ? i : best),
        0,
      );
      chooseGroup(biggest, found);
    } else {
      setGroupIndex(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const id = newId();
    setError(null);
    try {
      await createTrip({
        id,
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        planned_days: dayCount(startDate, endDate),
        retro: true,
      });
    } catch {
      setError("สร้างทริปไม่สำเร็จ ลองใหม่อีกครั้งนะ");
      return;
    }

    // อัปโหลดตรงเข้า Supabase Storage แล้วบันทึกลิงก์ + EXIF + รูปย่อ ให้ agent ใช้ตอนสรุป
    let done = 0;
    let failed = 0;
    let next = 0;
    setUploading({ done: 0, total: chosen.length });
    async function worker() {
      while (next < chosen.length) {
        const f = chosen[next++];
        try {
          const url = await uploadTripFile(id, f.blob);
          if (!url) throw new Error("upload");
          await addItems(id, [
            {
              kind: f.kind,
              file_url: url,
              caption: f.name,
              thumb: f.thumb,
              takenAt: f.takenAt,
              lat: f.lat,
              lng: f.lng,
            },
          ]);
        } catch {
          failed += 1;
        }
        setUploading({ done: ++done, total: chosen.length });
      }
    }
    await Promise.all(
      Array.from(
        { length: Math.min(UPLOAD_CONCURRENCY, chosen.length) },
        worker,
      ),
    );
    if (failed > 0) console.warn(`[past-trip] อัปโหลดไม่สำเร็จ ${failed} ไฟล์`);
    router.push(`/trip/${id}/chat`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* 1) เลือกรูป → ระบบหาช่วงวันให้ */}
      <div>
        <p className="text-label font-semibold">รูปจากทริปนั้น (ไม่บังคับ)</p>
        <label
          className={cx(
            "mt-2 flex items-center gap-3 rounded-card bg-surface px-4 py-4",
            busy ? "cursor-wait" : "cursor-pointer hover:bg-line",
          )}
        >
          {reading ? (
            <LoaderCircle
              {...ICON}
              className="shrink-0 animate-spin text-ink-muted"
            />
          ) : (
            <ImagePlus {...ICON} className="shrink-0 text-ink-muted" />
          )}
          <span className="flex-1">
            <span className="block text-body">
              {reading
                ? `กำลังอ่านรูป ${reading.done}/${reading.total}`
                : files.length > 0
                  ? `เลือกแล้ว ${files.length} ไฟล์ · แตะเพื่อเลือกใหม่`
                  : "เลือกรูปทั้งหมดของทริป เลือกเยอะได้เลย"}
            </span>
            <span className="block text-caption text-ink-muted">
              ระบบอ่านวันที่ในรูปแล้วเสนอช่วงวันของทริปให้เอง
            </span>
          </span>
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif,application/pdf"
            disabled={busy}
            className="sr-only"
            onChange={(e) => {
              handlePick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {groups.length > 0 && (
          <div
            className="mt-3 space-y-2"
            role="radiogroup"
            aria-label="ทริปที่พบจากรูป"
          >
            <p className="text-caption text-ink-muted">
              พบทริปจากวันที่ในรูป เลือกทริปที่ต้องการ
            </p>
            {groups.map((g, i) => (
              <button
                key={g.start}
                type="button"
                role="radio"
                aria-checked={groupIndex === i}
                onClick={() => chooseGroup(i)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-card bg-card px-4 py-3 text-left shadow-soft",
                  groupIndex === i && "ring-2 ring-brand",
                )}
              >
                <span className="flex-1">
                  <span className="block text-body">
                    {rangeLabel(g.start, g.end)}
                  </span>
                  <span className="block text-caption text-ink-muted">
                    {dayCount(g.start, g.end)} วัน · {g.files.length} รูป
                  </span>
                </span>
                {groupIndex === i && <Check {...ICON} className="text-brand" />}
              </button>
            ))}
          </div>
        )}

        {undated.length > 0 && groups.length > 0 && (
          <label className="mt-3 flex items-center gap-2 text-label text-ink-muted">
            <input
              type="checkbox"
              checked={includeUndated}
              onChange={(e) => setIncludeUndated(e.target.checked)}
              className="size-4 accent-brand"
            />
            รวม {undated.length} ไฟล์ที่ไม่มีวันที่ (เช่นรูปจาก LINE, PDF)
            ไว้ในทริปนี้ด้วย
          </label>
        )}
        {files.length > 0 && groups.length === 0 && !reading && (
          <p className="mt-3 text-caption text-ink-muted">
            ไม่พบวันที่ในรูป เลือกวันของทริปเองด้านล่างได้เลย
          </p>
        )}
      </div>

      {/* 2) ชื่อ + วันของทริป */}
      <Input
        label="ชื่อทริป"
        placeholder="เช่น ญี่ปุ่น 5 วัน"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <DateField
          label="วันเริ่ม"
          max={today}
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setGroupIndex(null);
          }}
        />
        <DateField
          label="วันจบ"
          min={startDate || undefined}
          max={today}
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setGroupIndex(null);
          }}
          error={dateError ?? undefined}
        />
      </div>

      {days && (
        <Card>
          <div className="flex items-baseline justify-between">
            <span className="text-body">แพ็กเกจ {days} วัน</span>
            <span className="text-title font-semibold">
              {formatBaht(packagePrice(days))}
            </span>
          </div>
          <p className="mt-2 text-label text-ink-muted">
            ยังไม่เก็บเงินตอนนี้ ชำระตอนกดสรุปทริป
          </p>
        </Card>
      )}

      <Button type="submit" block disabled={!canSubmit}>
        {uploading
          ? `กำลังอัปโหลด ${uploading.done}/${uploading.total}`
          : chosen.length > 0
            ? `สร้างทริปย้อนหลัง (${chosen.length} ไฟล์)`
            : "สร้างทริปย้อนหลัง"}
      </Button>
      {error && <p className="text-center text-label text-danger">{error}</p>}
    </form>
  );
}

function rangeLabel(start: string, end: string) {
  const fmt = (d: string, withYear: boolean) =>
    new Date(`${d}T12:00:00`).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      ...(withYear && { year: "numeric" }),
    });
  return start === end
    ? fmt(start, true)
    : `${fmt(start, false)} – ${fmt(end, true)}`;
}
