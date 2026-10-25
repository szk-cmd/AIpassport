import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { TopBar } from "@/components/ui";
import { getSummaryBySlug } from "@/lib/trips-server";
import { OrderForm } from "./OrderForm";

export async function generateMetadata({ params }: PageProps<"/t/[slug]/order">): Promise<Metadata> {
  const trip = await getSummaryBySlug((await params).slug);
  return { title: `สั่งพิมพ์กรอบรูป ${trip?.summary.title ?? ""} – PassportAI` };
}

export default function OrderPage({ params }: PageProps<"/t/[slug]/order">) {
  // อ่าน slug จาก URL อยู่ใน Suspense ตามกฎของ Next 16
  return (
    <Suspense>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: { params: PageProps<"/t/[slug]/order">["params"] }) {
  const { slug } = await params;
  await connection();
  const trip = await getSummaryBySlug(slug); // trip_outputs ของทริปนั้น (ทริปเดโมใช้ข้อมูล seed)
  if (!trip) notFound();

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <TopBar backHref={`/t/${slug}`} title="กลับหน้าทริป" />
      <main className="mx-auto w-full max-w-md px-4 pt-2 pb-12">
        <h1 className="font-sans text-title font-semibold">สั่งพิมพ์กรอบรูป</h1>
        <p className="mt-2 text-body text-ink-muted">พิมพ์ใส่กรอบจริง ส่งถึงบ้าน เหมาะเป็นของขวัญให้ผู้ใหญ่</p>

        <OrderForm s={trip.summary} slug={slug} />
      </main>
    </div>
  );
}
