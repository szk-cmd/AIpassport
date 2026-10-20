"use client";

import { formatDate, formatDateRange } from "@/lib/format";
import type { PreparedFile, TripGroup } from "@/lib/photo-prep";

type Props = {
  groups: TripGroup[];
  undated: PreparedFile[];
  startDate: string;
  endDate: string;
  includeUndated: boolean;
  onPick: (group: TripGroup) => void;
  onToggleUndated: (include: boolean) => void;
};

// การ์ดทริปที่จับกลุ่มได้จากวันที่ในรูป ให้ผู้ใช้กดยืนยันว่าใช่ทริปไหน
export function TripGroups({ groups, undated, startDate, endDate, includeUndated, onPick, onToggleUndated }: Props) {
  if (groups.length === 0 && undated.length === 0) return null;

  return (
    <div className="space-y-3">
      {groups.length > 1 && <p className="text-sm text-brown/70">รูปที่เลือกมาจาก {groups.length} ช่วงเวลา ทริปนี้คือช่วงไหน?</p>}

      {[...groups].reverse().map((g) => {
        const picked = g.start === startDate && g.end === endDate;
        return (
          <div
            key={g.start}
            className={`rounded-xl border-2 p-3 ${picked ? "border-orange bg-orange/10" : "border-brown/15 bg-white"}`}
          >
            <p className="font-heading font-semibold">
              พบทริป {g.start === g.end ? formatDate(g.start) : formatDateRange(g.start, g.end)}
              <span className="font-normal text-brown/70"> · {g.files.length} รูป</span>
            </p>
            <Thumbs files={g.files} />
            <button
              type="button"
              onClick={() => onPick(g)}
              className={`mt-2 w-full rounded-full py-2 text-sm font-medium ${
                picked ? "bg-orange text-cream" : "border border-orange text-orange hover:bg-orange/10"
              }`}
            >
              {picked ? "✓ ใช้ทริปนี้" : "ใช่ ทริปนี้"}
            </button>
          </div>
        );
      })}

      {undated.length > 0 && (
        <div className="rounded-xl border-2 border-dashed border-brown/20 bg-white p-3">
          <p className="font-heading font-semibold">
            ไม่ทราบวันที่<span className="font-normal text-brown/70"> · {undated.length} รูป</span>
          </p>
          <p className="text-xs text-brown/60">เช่น รูปที่ส่งต่อมาจาก LINE หรือภาพแคปหน้าจอ</p>
          <Thumbs files={undated} />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeUndated}
              onChange={(e) => onToggleUndated(e.target.checked)}
              className="size-4 accent-orange"
            />
            รวมรูปกลุ่มนี้ในทริปด้วย
          </label>
        </div>
      )}
    </div>
  );
}

function Thumbs({ files }: { files: PreparedFile[] }) {
  return (
    <div className="mt-2 grid grid-cols-6 gap-1">
      {files.slice(0, 6).map((f) =>
        f.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- รูปตัวอย่างจากเครื่องผู้ใช้
          <img key={f.id} src={f.previewUrl} alt={f.name} className="aspect-square w-full rounded-md object-cover" />
        ) : (
          <div key={f.id} className="flex aspect-square items-center justify-center rounded-md bg-brown/10 text-lg">
            📷
          </div>
        ),
      )}
    </div>
  );
}
