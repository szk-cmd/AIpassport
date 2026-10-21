"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PhotoDrop } from "@/components/PhotoDrop";
import type { PreparedFile } from "@/lib/photo-prep";
import { useStore } from "@/lib/trip-store";

// หลังกดจบทริป: เพิ่มรูปที่ยังไม่ได้ส่งในแชท (เช่นรูปจากกล้อง/คอม) ข้ามได้
export function PhotosStep() {
  const { id } = useParams<{ id: string }>();
  const data = useStore();
  // MOCK: รูปอยู่แค่ในหน้านี้ ยังไม่อัปโหลด (สัปดาห์ 2 จะส่ง blob ที่ย่อแล้ว + takenAt/lat/lng ขึ้น storage)
  const [files, setFiles] = useState<PreparedFile[]>([]);
  const trip = data?.trips.find((t) => t.id === id);
  if (!data) return null;

  function handleClear() {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  }

  const next = `/trip/${id}/checkout`;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="font-heading text-sm tracking-widest text-gold">จบทริปแล้ว</p>
      <h1 className="mt-1 text-3xl font-semibold">มีรูปอื่นอีกไหม?</h1>
      <p className="mt-2 text-cream/70">
        เพิ่มรูปจาก{trip ? ` “${trip.title}” ` : "ทริปนี้"}ที่ยังไม่ได้ส่งในแชทได้ เช่นรูปจากกล้องหรือคอมพิวเตอร์
      </p>

      <section className="mt-6 rounded-2xl bg-cream p-5 text-brown">
        <PhotoDrop files={files} onAdd={(added) => setFiles((prev) => [...prev, ...added])} onClear={handleClear} />
        {files.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {files.slice(0, 10).map((f) =>
              f.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- รูปตัวอย่างจากเครื่องผู้ใช้
                <img key={f.id} src={f.previewUrl} alt={f.name} className="aspect-square w-full rounded-md object-cover" />
              ) : (
                <div key={f.id} className="flex aspect-square items-center justify-center rounded-md bg-brown/10">
                  {f.kind === "pdf" ? "🧾" : "📷"}
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <Link
        href={next}
        className="mt-6 block w-full rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream"
      >
        {files.length > 0 ? `ถัดไป (เพิ่ม ${files.length} ไฟล์)` : "ถัดไป"}
      </Link>
      {files.length === 0 && (
        <Link href={next} className="mt-3 block text-center text-sm text-cream/70 underline hover:text-cream">
          ข้าม ไม่มีรูปเพิ่ม
        </Link>
      )}
    </main>
  );
}
