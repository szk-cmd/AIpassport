import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTripBySlug, MOCK_TRIPS } from "@/lib/mock";
import { OrderForm } from "./OrderForm";

export function generateStaticParams() {
  return MOCK_TRIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/t/[slug]/order">): Promise<Metadata> {
  const trip = getTripBySlug((await params).slug);
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
  const trip = getTripBySlug(slug); // MOCK: ของจริงจะดึงจาก DB
  if (!trip) notFound();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <Link href={`/t/${slug}`} className="text-sm text-cream/70 hover:text-cream">
        ← กลับหน้าทริป
      </Link>
      <h1 className="mt-2 text-3xl font-semibold">สั่งพิมพ์กรอบรูป</h1>
      <p className="mt-2 text-cream/70">พิมพ์ใส่กรอบจริง ส่งถึงบ้าน เหมาะเป็นของขวัญให้ผู้ใหญ่</p>

      <OrderForm s={trip.summary} slug={slug} />
    </main>
  );
}
