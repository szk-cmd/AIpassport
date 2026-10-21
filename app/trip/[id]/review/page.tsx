import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewForm } from "./ReviewForm";

export const metadata: Metadata = { title: "ตรวจทาน – PassportAI" };

export default function ReviewPage() {
  return (
    // อ่าน id ทริปจาก URL จึงต้องอยู่ใน Suspense (กฎของ Next 16)
    <Suspense>
      <ReviewForm />
    </Suspense>
  );
}
