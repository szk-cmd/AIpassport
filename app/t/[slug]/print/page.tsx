import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { PrintSheet } from "@/components/PrintSheet";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTripBySlug, MOCK_TRIPS } from "@/lib/mock";

export function generateStaticParams() {
  return MOCK_TRIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/t/[slug]/print">): Promise<Metadata> {
  const trip = getTripBySlug((await params).slug);
  return { title: `กรอบรูป ${trip?.summary.title ?? ""} – PassportAI` };
}

// ตั้งค่ากระดาษ A4 แนวตั้ง และซ่อนทุกอย่างยกเว้นแผ่นกรอบรูปตอนพิมพ์
const printCss = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  .no-print { display: none !important; }
  .print-area { padding: 0 !important; max-width: none !important; }
  .a4-sheet { width: 210mm !important; box-shadow: none !important; border-radius: 0 !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

export default function PrintPage({ params }: PageProps<"/t/[slug]/print">) {
  // อ่าน slug จาก URL อยู่ใน Suspense ตามกฎของ Next 16
  return (
    <Suspense>
      <PrintContent params={params} />
    </Suspense>
  );
}

async function PrintContent({ params }: { params: PageProps<"/t/[slug]/print">["params"] }) {
  const { slug } = await params;
  const trip = getTripBySlug(slug); // MOCK: ของจริงจะดึงจาก DB
  if (!trip) notFound();
  const s = trip.summary;

  return (
    <main className="print-area mx-auto w-full max-w-2xl px-4 py-8">
      <style>{printCss}</style>

      <div className="no-print mb-6">
        <Link href={`/t/${slug}`} className="text-sm text-cream/70 hover:text-cream">
          ← กลับหน้าทริป
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">กรอบรูปสำหรับพิมพ์</h1>
        <p className="mt-1 text-cream/70">กระดาษ A4 แนวตั้ง ตัวอักษรใหญ่ อ่านง่ายสำหรับผู้ใหญ่ที่บ้าน</p>
      </div>

      <PrintSheet s={s} slug={slug} />

      <div className="no-print mx-auto mt-6 max-w-md">
        <PrintButton />
      </div>
    </main>
  );
}
