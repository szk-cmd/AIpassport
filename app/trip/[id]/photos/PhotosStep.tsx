"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PhotoDrop } from "@/components/PhotoDrop";
import type { PreparedFile } from "@/lib/photo-prep";
import { useStore } from "@/lib/trip-store";
import { uploadTripFile } from "@/lib/upload";

// หลังกดจบทริป: เพิ่มรูปที่ยังไม่ได้ส่งในแชท (เช่นรูปจากกล้อง/คอม) ข้ามได้
export function PhotosStep() {
  const { id } = useParams<{ id: string }>();
  const data = useStore();
  const [files, setFiles] = useState<PreparedFile[]>([]);
  // ลิงก์ไฟล์บน Supabase Storage ตาม id ไฟล์ (null = อัปโหลดไม่สำเร็จ)
  // TODO สัปดาห์ 2: บันทึกลิงก์ + takenAt/lat/lng ลง trip_items
  const [uploaded, setUploaded] = useState<Record<string, string | null>>({});
  const trip = data?.trips.find((t) => t.id === id);
  if (!data) return null;

  // อัปโหลดตรงจากเบราว์เซอร์เข้า Storage ทันทีที่เตรียมรูปเสร็จ (ไม่ผ่าน API ของเรา)
  function handleAdd(added: PreparedFile[]) {
    setFiles((prev) => [...prev, ...added]);
    for (const f of added) {
      uploadTripFile(id, f.blob).then((url) => setUploaded((u) => ({ ...u, [f.id]: url })));
    }
  }

  const doneCount = files.filter((f) => f.id in uploaded).length;
  const failed = files.filter((f) => uploaded[f.id] === null).length;

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
        <PhotoDrop files={files} onAdd={handleAdd} onClear={handleClear} />
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
        {files.length > 0 && (
          <p className="mt-2 text-sm text-brown/60">
            อัปโหลดแล้ว {doneCount - failed}/{files.length} ไฟล์
            {failed > 0 && ` · ${failed} ไฟล์อัปโหลดไม่สำเร็จ`}
          </p>
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
